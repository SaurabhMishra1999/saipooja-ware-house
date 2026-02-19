document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const invoicesTableBody = document.querySelector('#invoices-table tbody');

    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('invoices').where('userId', '==', user.uid).orderBy('dueDate', 'desc').onSnapshot(snapshot => {
                let html = '';
                if (snapshot.empty) {
                    invoicesTableBody.innerHTML = '<tr><td colspan="5">No invoices found.</td></tr>';
                    return;
                }
                snapshot.forEach(doc => {
                    const invoice = doc.data();
                    const dueDate = invoice.dueDate.toDate ? invoice.dueDate.toDate().toLocaleDateString() : 'N/A';
                    let actionButton = `<button class="btn-download-pdf" data-id="${doc.id}">Download PDF</button>`;
                    if (invoice.status === 'unpaid') {
                        actionButton += `<button class="btn-pay" data-id="${doc.id}" data-amount="${invoice.amount}">Pay Now</button>`;
                    }
                    html += `<tr data-id="${doc.id}"><td>${doc.id}</td><td>${dueDate}</td><td>₹${invoice.amount.toFixed(2)}</td><td><span class="status status-${invoice.status}">${invoice.status}</span></td><td>${actionButton}</td></tr>`;
                });
                invoicesTableBody.innerHTML = html;
            }, error => {
                invoicesTableBody.innerHTML = '<tr><td colspan="5">Failed to load invoices.</td></tr>';
            });
        } else {
            invoicesTableBody.innerHTML = '<tr><td colspan="5">Please log in to see your invoices.</td></tr>';
        }
    });

    invoicesTableBody.addEventListener('click', async e => {
        const target = e.target;
        const invoiceId = target.dataset.id;

        if (target.classList.contains('btn-download-pdf')) {
            generateAndDownloadPDF(invoiceId);
        } else if (target.classList.contains('btn-pay')) {
            const amount = target.dataset.amount;
            initiatePayment(invoiceId, amount);
        }
    });

    async function generateAndDownloadPDF(invoiceId) {
        const { jsPDF } = window.jspdf;
        try {
            const doc = await db.collection('invoices').doc(invoiceId).get();
            if (!doc.exists) { alert('Invoice not found!'); return; }
            const invoice = doc.data();

            const pdf = new jsPDF();
            pdf.setFontSize(22).text('Invoice', 20, 20);
            pdf.setFontSize(12).text('Saipooja Warehouse & Logistics', 20, 35).text('123 Warehouse St, Mumbai, India', 20, 42).text('info@saipoojawarehouse.com', 20, 49);
            pdf.setFontSize(14).text(`Invoice ID: ${invoiceId}`, 20, 65).text(`Booking ID: ${invoice.bookingId}`, 20, 72).text(`Due Date: ${invoice.dueDate.toDate().toLocaleDateString()}`, 20, 79);

            const addr = invoice.billingAddress;
            if(addr) {
                pdf.text('Bill To:', 20, 95).text(addr.name, 20, 102).text(addr.street, 20, 109).text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 20, 116);
            }
            
            pdf.autoTable({ startY: addr ? 125 : 105, head: [['Description', 'Amount']], body: [['Service Charge', `₹${invoice.amount.toFixed(2)}`]], theme: 'striped', styles: { fontSize: 12 } });
            pdf.setFontSize(14).text(`Status: ${invoice.status.toUpperCase()}`, 20, pdf.autoTable.previous.finalY + 15);
            pdf.save(`invoice-${invoiceId}.pdf`);
        } catch (error) {
            alert('Failed to generate PDF.');
        }
    }

    function initiatePayment(invoiceId, amount) {
        const user = auth.currentUser;
        const options = {
            key: "YOUR_KEY_ID", // Replace with your Razorpay Key ID
            amount: amount * 100, // Amount in paise
            currency: "INR",
            name: "Saipooja Warehouse",
            description: `Payment for Invoice #${invoiceId}`,
            image: "/logo.png", // Optional
            handler: async function(response) {
                try {
                    await db.collection('invoices').doc(invoiceId).update({ status: 'paid', paymentId: response.razorpay_payment_id });
                    alert('Payment successful!');
                } catch (error) {
                    alert('Failed to update invoice status after payment.');
                }
            },
            prefill: {
                name: user ? user.displayName : "",
                email: user ? user.email : "",
                contact: ""
            },
            theme: { color: "#3399cc" }
        };
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
            alert('Payment failed. Please try again.');
        });
        rzp.open();
    }
});
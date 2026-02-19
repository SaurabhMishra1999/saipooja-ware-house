document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Existing elements
    const warehouseTableBody = document.querySelector('#warehouse-bookings-table tbody');
    const logisticsTableBody = document.querySelector('#logistics-bookings-table tbody');
    const invoiceForm = document.getElementById('invoice-form');
    const inventoryForm = document.getElementById('inventory-form');
    const inventoryTableBody = document.querySelector('#inventory-table tbody');
    const branchSelect = document.getElementById('branch-select');

    // Edit Modal Elements
    const editModal = document.getElementById('edit-inventory-modal');
    const closeButton = document.querySelector('.close-button');
    const editInventoryForm = document.getElementById('edit-inventory-form');
    const editItemId = document.getElementById('edit-item-id');
    const editBranchSelect = document.getElementById('edit-branch-select');
    const editProductNameInput = document.getElementById('edit-product-name-input');
    const editSkuInput = document.getElementById('edit-sku-input');
    const editQuantityInput = document.getElementById('edit-quantity-input');
    const editLocationInput = document.getElementById('edit-location-input');

    // Admin check
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = '/';
        } else {
            loadWarehouseBookings();
            loadLogisticsBookings();
            loadBranches();
            loadInventory();
        }
    });

    // --- Booking Management ---
    function loadWarehouseBookings() {
        db.collection('warehouseBookings').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            let html = '';
            if (snapshot.empty) {
                warehouseTableBody.innerHTML = '<tr><td colspan="5">No warehouse bookings found.</td></tr>';
                return;
            }
            snapshot.forEach(doc => {
                const booking = doc.data();
                html += `<tr><td>${doc.id}</td><td>${booking.userId}</td><td>${booking.city}</td><td><span class="status status-${booking.status}">${booking.status}</span></td><td><button class="btn-approve" data-id="${doc.id}" data-type="warehouse">Approve</button><button class="btn-reject" data-id="${doc.id}" data-type="warehouse">Reject</button></td></tr>`;
            });
            warehouseTableBody.innerHTML = html;
        });
    }

    function loadLogisticsBookings() {
        db.collection('logisticsBookings').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            let html = '';
            if (snapshot.empty) {
                logisticsTableBody.innerHTML = '<tr><td colspan="6">No logistics bookings found.</td></tr>';
                return;
            }
            snapshot.forEach(doc => {
                const booking = doc.data();
                html += `<tr><td>${doc.id}</td><td>${booking.userId}</td><td>${booking.pickupCity}</td><td>${booking.dropoffCity}</td><td><span class="status status-${booking.status}">${booking.status}</span></td><td><button class="btn-approve" data-id="${doc.id}" data-type="logistics">Approve</button><button class="btn-reject" data-id="${doc.id}" data-type="logistics">Reject</button></td></tr>`;
            });
            logisticsTableBody.innerHTML = html;
        });
    }

    async function updateBookingStatus(id, type, status) {
        const collection = type === 'warehouse' ? 'warehouseBookings' : 'logisticsBookings';
        try {
            await db.collection(collection).doc(id).update({ status });
            alert(`Booking ${id} has been ${status}.`);
        } catch (error) {
            alert('Failed to update status.');
        }
    }

    // --- Branch & Inventory Management ---
    function loadBranches() {
        db.collection('branches').get().then(snapshot => {
            let html = '<option value="">Select Branch</option>';
            if (snapshot.empty) {
                html = '<option>No branches found</option>';
            }
            snapshot.forEach(doc => {
                html += `<option value="${doc.id}">${doc.data().name}</option>`;
            });
            branchSelect.innerHTML = html;
            editBranchSelect.innerHTML = html;
        });
    }

    function loadInventory() {
        db.collection('inventory').orderBy('branch').onSnapshot(snapshot => {
            let html = '';
            if (snapshot.empty) {
                inventoryTableBody.innerHTML = '<tr><td colspan="6">No inventory items found.</td></tr>';
                return;
            }
            snapshot.forEach(doc => {
                const item = doc.data();
                html += `<tr data-id="${doc.id}"><td>${item.branchName}</td><td>${item.productName}</td><td>${item.sku}</td><td>${item.quantity}</td><td>${item.location}</td><td><button class="btn-edit-inventory" data-id="${doc.id}">Edit</button><button class="btn-delete-inventory" data-id="${doc.id}">Delete</button></td></tr>`;
            });
            inventoryTableBody.innerHTML = html;
        });
    }

    inventoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            branch: inventoryForm['branch-select'].value,
            branchName: inventoryForm['branch-select'].selectedOptions[0].text,
            productName: inventoryForm['product-name-input'].value,
            sku: inventoryForm['sku-input'].value,
            quantity: parseInt(inventoryForm['quantity-input'].value),
            location: inventoryForm['location-input'].value,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (Object.values(data).some(val => !val)) {
            alert('Please fill out all inventory fields.');
            return;
        }
        try {
            await db.collection('inventory').add(data);
            alert('Inventory item added successfully!');
            inventoryForm.reset();
        } catch (error) {
            alert('Failed to add item.');
        }
    });

    inventoryTableBody.addEventListener('click', async e => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('btn-edit-inventory')) {
            const doc = await db.collection('inventory').doc(id).get();
            if (!doc.exists) { alert('Item not found.'); return; }
            const item = doc.data();
            editItemId.value = doc.id;
            editBranchSelect.value = item.branch;
            editProductNameInput.value = item.productName;
            editSkuInput.value = item.sku;
            editQuantityInput.value = item.quantity;
            editLocationInput.value = item.location;
            editModal.style.display = 'block';
        } else if (e.target.classList.contains('btn-delete-inventory')) {
            if (!confirm('Are you sure you want to delete this item?')) return;
            try {
                await db.collection('inventory').doc(id).delete();
                alert('Item deleted successfully.');
            } catch (error) {
                alert('Failed to delete item.');
            }
        }
    });

    closeButton.onclick = () => editModal.style.display = 'none';
    window.onclick = e => { if (e.target == editModal) editModal.style.display = 'none'; };

    editInventoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editItemId.value;
        const data = {
            branch: editBranchSelect.value,
            branchName: editBranchSelect.selectedOptions[0].text,
            productName: editProductNameInput.value,
            sku: editSkuInput.value,
            quantity: parseInt(editQuantityInput.value),
            location: editLocationInput.value
        };
        if (Object.values(data).some(val => !val)) {
            alert('Please fill out all fields.');
            return;
        }
        try {
            await db.collection('inventory').doc(id).update(data);
            alert('Item updated successfully!');
            editModal.style.display = 'none';
        } catch (error) {
            alert('Failed to update item.');
        }
    });

    // --- Invoice Management ---
    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookingId = invoiceForm['booking-id-input'].value;
        const amount = parseFloat(invoiceForm['amount-input'].value);
        const dueDate = new Date(invoiceForm['due-date-input'].value);

        const billingAddress = {
            name: invoiceForm['billing-name-input'].value,
            street: invoiceForm['billing-address-input'].value,
            city: invoiceForm['billing-city-input'].value,
            state: invoiceForm['billing-state-input'].value,
            pincode: invoiceForm['billing-pincode-input'].value,
        };

        if (!bookingId || !amount || !dueDate || Object.values(billingAddress).some(val => !val)) {
            alert('Please fill out all invoice and billing fields.');
            return;
        }

        let bookingDoc = await db.collection('warehouseBookings').doc(bookingId).get();
        if (!bookingDoc.exists) {
            bookingDoc = await db.collection('logisticsBookings').doc(bookingId).get();
        }

        if (!bookingDoc.exists) {
            alert('Booking not found!');
            return;
        }

        const invoiceData = {
            userId: bookingDoc.data().userId,
            bookingId,
            amount,
            dueDate: firebase.firestore.Timestamp.fromDate(dueDate),
            status: 'unpaid',
            billingAddress,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const docRef = await db.collection('invoices').add(invoiceData);
            generateInvoicePDF(docRef.id, invoiceData);
            alert('Invoice created and downloaded successfully!');
            invoiceForm.reset();
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice.');
        }
    });

    function generateInvoicePDF(invoiceId, invoiceData) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(22).text('Invoice', 20, 20);
        pdf.setFontSize(12).text('Saipooja Warehouse & Logistics', 20, 35).text('123 Warehouse St, Mumbai, India', 20, 42).text('info@saipoojawarehouse.com', 20, 49);

        pdf.setFontSize(14).text(`Invoice ID: ${invoiceId}`, 20, 65);
        pdf.text(`Booking ID: ${invoiceData.bookingId}`, 20, 72);
        pdf.text(`Due Date: ${invoiceData.dueDate.toDate().toLocaleDateString()}`, 20, 79);

        const addr = invoiceData.billingAddress;
        pdf.text('Bill To:', 20, 95);
        pdf.text(addr.name, 20, 102);
        pdf.text(addr.street, 20, 109);
        pdf.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 20, 116);

        pdf.autoTable({ 
            startY: 125, 
            head: [['Description', 'Amount']], 
            body: [['Service Charge', `₹${invoiceData.amount.toFixed(2)}`]],
            theme: 'striped',
            styles: { fontSize: 12 }
        });

        const finalY = pdf.autoTable.previous.finalY;
        pdf.setFontSize(14).text(`Status: ${invoiceData.status.toUpperCase()}`, 20, finalY + 15);

        pdf.save(`invoice-${invoiceId}.pdf`);
    }

    // Event delegation for booking status
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('btn-approve') || e.target.classList.contains('btn-reject')) {
            const status = e.target.classList.contains('btn-approve') ? 'approved' : 'rejected';
            updateBookingStatus(e.target.dataset.id, e.target.dataset.type, status);
        }
    });
});
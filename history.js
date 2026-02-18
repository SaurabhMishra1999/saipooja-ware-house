document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const warehouseTableBody = document.querySelector('#warehouse-table tbody');
    const logisticsTableBody = document.querySelector('#logistics-table tbody');

    auth.onAuthStateChanged(user => {
        if (user) {
            // Fetch warehouse bookings
            db.collection('warehouseBookings').where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc').get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        warehouseTableBody.innerHTML = '<tr><td colspan="4">No warehouse bookings found.</td></tr>';
                        return;
                    }
                    let html = '';
                    snapshot.forEach(doc => {
                        const booking = doc.data();
                        html += `
                            <tr>
                                <td style="padding: 1rem; border: 1px solid #ddd;">${booking.city}</td>
                                <td style="padding: 1rem; border: 1px solid #ddd;">${booking.productDescription}</td>
                                <td style="padding: 1rem; border: 1px solid #ddd;">${booking.requiredSpace}</td>
                                <td style="padding: 1rem; border: 1px solid #ddd;"><span class="status status-${booking.status}">${booking.status}</span></td>
                            </tr>
                        `;
                    });
                    warehouseTableBody.innerHTML = html;
                });

            // Fetch logistics bookings
            db.collection('logisticsBookings').where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc').get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        logisticsTableBody.innerHTML = '<tr><td colspan="4">No logistics bookings found.</td></tr>';
                        return;
                    }
                    let html = '';
                    snapshot.forEach(doc => {
                        const booking = doc.data();
                        html += `
                            <tr>
                                <td style="padding: 1rem; border: 1px solid #ddd;">${booking.pickupCity}</td>
                                <td style="padding: 1rem; border: 1px solid #ddd;">${booking.dropoffCity}</td>
                                <td style="padding: 1rem; border: 1px solid #ddd;">${booking.vehicleType}</td>
                                <td style="padding: 1rem; border: 1px solid #ddd;"><span class="status status-${booking.status}">${booking.status}</span></td>
                            </tr>
                        `;
                    });
                    logisticsTableBody.innerHTML = html;
                });
        } else {
            // If user is not logged in, show a message
            warehouseTableBody.innerHTML = '<tr><td colspan="4">Please log in to see your booking history.</td></tr>';
            logisticsTableBody.innerHTML = '<tr><td colspan="4">Please log in to see your booking history.</td></tr>';
        }
    });
});
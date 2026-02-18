document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const transportTableBody = document.querySelector('#transport-table tbody');

    // Super admin check - in a real app, this would be more secure
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = '/';
        } else {
            // Simple check if the user is a superadmin (e.g., by UID)
            // Replace with your actual superadmin UID
            if (user.uid !== 'YOUR_SUPERADMIN_UID') {
                alert('You are not authorized to view this page.');
                window.location.href = '/dashboard.html';
            } else {
                loadTransportData();
            }
        }
    });

    // Load all logistics bookings for the super admin
    function loadTransportData() {
        db.collection('logisticsBookings').onSnapshot(snapshot => {
            if (snapshot.empty) {
                transportTableBody.innerHTML = '<tr><td colspan="6">No transport bookings found.</td></tr>';
                return;
            }
            let html = '';
            snapshot.forEach(doc => {
                const booking = doc.data();
                html += `
                    <tr data-id="${doc.id}">
                        <td>${doc.id}</td>
                        <td>${booking.vehicleNumber || 'N/A'}</td>
                        <td>${booking.driverName || 'N/A'}</td>
                        <td>${booking.currentLocation || 'N/A'}</td>
                        <td><span class="status status-${booking.status}">${booking.status}</span></td>
                        <td>
                            <button class="btn-update-transport" data-id="${doc.id}">Update</button>
                        </td>
                    </tr>
                `;
            });
            transportTableBody.innerHTML = html;
        });
    }

    // Handle transport update
    transportTableBody.addEventListener('click', async e => {
        if (e.target.classList.contains('btn-update-transport')) {
            const bookingId = e.target.dataset.id;
            
            const vehicleNumber = prompt("Enter Vehicle Number:");
            const driverName = prompt("Enter Driver Name:");
            const currentLocation = prompt("Enter Current Location:");
            const status = prompt("Enter Status (e.g., 'in-transit', 'delayed', 'delivered'):");

            if (vehicleNumber && driverName && currentLocation && status) {
                try {
                    await db.collection('logisticsBookings').doc(bookingId).update({
                        vehicleNumber,
                        driverName,
                        currentLocation,
                        status
                    });
                    alert('Transport details updated successfully!');
                } catch (error) {
                    console.error("Error updating transport details: ", error);
                    alert('Failed to update details. Please try again.');
                }
            }
        }
    });

});
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/bookings')
        .then(response => response.json())
        .then(bookingData => {
            const tableBody = document.getElementById('warehouse-table-body');
            tableBody.innerHTML = ''; // Clear static data
            bookingData.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.bookingId}</td>
                    <td>${booking.userId}</td>
                    <td>${booking.city}</td>
                    <td>${booking.status}</td>
                    <td><button>Details</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching booking data:', error));
});
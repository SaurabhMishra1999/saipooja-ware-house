document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('stock-table-body');

    // Function to fetch and display stock
    function fetchStock() {
        fetch('/api/inventory') // We'll use the same inventory endpoint
            .then(response => response.json())
            .then(inventory => {
                tableBody.innerHTML = ''; // Clear existing data
                inventory.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.location}</td>
                    `;
                    tableBody.appendChild(row);
                });
            });
    }

    // Fetch stock on page load
    fetchStock();
});
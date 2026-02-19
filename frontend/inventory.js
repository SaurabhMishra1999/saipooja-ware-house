document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('inventory-table-body');
    const form = document.getElementById('inventory-form');

    // Function to fetch and display inventory
    function fetchInventory() {
        fetch('/api/inventory')
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
                        <td><button>Edit</button> <button>Delete</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            });
    }

    // Fetch inventory on page load
    fetchInventory();

    // Handle form submission for adding new items
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const newItem = {
            name: document.getElementById('item-name').value,
            quantity: parseInt(document.getElementById('item-quantity').value),
            location: document.getElementById('item-location').value
        };

        fetch('/api/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        })
        .then(response => response.json())
        .then(() => {
            fetchInventory(); // Refresh the list
            form.reset(); // Clear the form
        });
    });
});
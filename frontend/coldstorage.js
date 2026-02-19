document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const inventoryTable = document.getElementById('inventory-table').getElementsByTagName('tbody')[0];
    const itemForm = document.getElementById('item-form');
    const itemIdInput = document.getElementById('item-id');
    const itemNameInput = document.getElementById('item-name');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemLocationInput = document.getElementById('item-location');
    const cancelEditButton = document.getElementById('cancel-edit');
    const formContainer = document.querySelector('.form-container');

    const apiUrl = 'https://your-render-backend-url/api/coldstorage'; // Replace with your actual Render backend URL

    if (!user) {
        formContainer.style.display = 'none';
    }

    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'user-id': user ? user.id : ''
        };
    };

    // Fetch and display inventory data
    const fetchInventory = async () => {
        try {
            const response = await fetch(apiUrl);
            const inventory = await response.json();

            inventoryTable.innerHTML = '';
            inventory.forEach(item => {
                const row = inventoryTable.insertRow();
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.location}</td>
                    <td>
                        ${user ? `
                        <button onclick="editItem('${item.id}', '${item.name}', '${item.quantity}', '${item.location}')">Edit</button>
                        <button onclick="deleteItem('${item.id}')">Delete</button>
                        ` : ''}
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    // Save (add or update) item
    if(user) {
        itemForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = itemIdInput.value;
            const name = itemNameInput.value;
            const quantity = itemQuantityInput.value;
            const location = itemLocationInput.value;
            const isUpdating = !!id;

            const url = isUpdating ? `${apiUrl}/${id}` : apiUrl;
            const method = isUpdating ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method,
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ name, quantity: parseInt(quantity), location })
                });

                if (response.ok) {
                    fetchInventory();
                    resetForm();
                } else {
                    console.error('Error saving item:', await response.text());
                    alert('You must be logged in to perform this action.');
                }
            } catch (error) {
                console.error('Error saving item:', error);
            }
        });
    }

    // Cancel edit
    cancelEditButton.addEventListener('click', () => {
        resetForm();
    });

    // Edit item
    window.editItem = (id, name, quantity, location) => {
        itemIdInput.value = id;
        itemNameInput.value = name;
        itemQuantityInput.value = quantity;
        itemLocationInput.value = location;
        cancelEditButton.style.display = 'inline-block';
    };

    // Delete item
    window.deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                fetchInventory();
            } else {
                console.error('Error deleting item:', await response.text());
                alert('You must be logged in to perform this action.');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    function resetForm() {
        itemForm.reset();
        itemIdInput.value = '';
        cancelEditButton.style.display = 'none';
    }

    // Initial fetch
    fetchInventory();
});


document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const companyNameEl = document.getElementById('company-name');
    const branchesContainer = document.getElementById('branches-container');
    const addBranchForm = document.getElementById('add-branch-form');

    let currentUser = null;
    let companyId = null;

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            const userDocRef = db.collection('users').doc(user.uid);
            const userDoc = await userDocRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.role === 'admin' || userData.role === 'superadmin') {
                    // Admins should not be on the company dashboard
                    window.location.href = '/admin.html';
                } else {
                    companyId = userData.companyId;
                    loadDashboard();
                }
            } else {
                console.error("User document not found!");
                auth.signOut();
            }
        } else {
            // If no user is logged in, redirect to login page
            window.location.href = '/login.html';
        }
    });

    async function loadDashboard() {
        if (!companyId) return;

        // Fetch company details
        const companyDoc = await db.collection('companies').doc(companyId).get();
        if (companyDoc.exists) {
            companyNameEl.textContent = companyDoc.data().name;
        }

        // Fetch and render branches and inventory
        renderBranches();
    }

    async function renderBranches() {
        branchesContainer.innerHTML = ''; // Clear existing content
        const branchesSnapshot = await db.collection('companies').doc(companyId).collection('branches').get();

        if (branchesSnapshot.empty) {
            branchesContainer.innerHTML = '<p>No branches found. Add one using the form above.</p>';
            return;
        }

        branchesSnapshot.forEach(async (branchDoc) => {
            const branch = branchDoc.data();
            const branchId = branchDoc.id;

            const branchDiv = document.createElement('div');
            branchDiv.classList.add('branch');
            branchDiv.setAttribute('data-branch-id', branchId);

            // Fetch inventory for each branch
            const inventorySnapshot = await db.collection('companies').doc(companyId).collection('branches').doc(branchId).collection('inventory').get();
            let inventoryHtml = '<table><thead><tr><th>Name</th><th>Quantity</th><th>Actions</th></tr></thead><tbody>';
            if (inventorySnapshot.empty) {
                inventoryHtml += '<tr><td colspan="3">No inventory data.</td></tr>';
            } else {
                inventorySnapshot.forEach(itemDoc => {
                    const item = itemDoc.data();
                    inventoryHtml += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>
                                <button class="btn-edit-item" data-item-id="${itemDoc.id}">Edit</button>
                                <button class="btn-delete-item" data-item-id="${itemDoc.id}">Delete</button>
                            </td>
                        </tr>`;
                });
            }
            inventoryHtml += '</tbody></table>';

            const addInventoryForm = `
                <div class="booking-section">
                    <h4>Add Inventory to ${branch.name}</h4>
                    <form class="add-inventory-form booking-form" data-branch-id="${branchId}">
                        <div class="form-group">
                            <label>Item Name</label>
                            <input type="text" name="itemName" required>
                        </div>
                        <div class="form-group">
                            <label>Quantity</label>
                            <input type="number" name="quantity" required>
                        </div>
                        <button type="submit" class="btn-submit">Add Item</button>
                    </form>
                </div>
            `;

            branchDiv.innerHTML = `
                <h3>
                    ${branch.name} (${branch.location})
                    <button class="btn-edit-branch">Edit</button>
                    <button class="btn-delete-branch">Delete</button>
                </h3>
                ${inventoryHtml}
                ${addInventoryForm}
            `;
            branchesContainer.appendChild(branchDiv);
        });
    }

    // Handle Add Branch form submission
    addBranchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const branchName = document.getElementById('branch-name-input').value;
        const branchLocation = document.getElementById('branch-location-input').value;

        try {
            await db.collection('companies').doc(companyId).collection('branches').add({
                name: branchName,
                location: branchLocation
            });
            addBranchForm.reset();
            renderBranches(); // Re-render branches
            alert('Branch added successfully!');
        } catch (error) {
            console.error("Error adding branch: ", error);
            alert('Failed to add branch.');
        }
    });

    // Event Delegation for dynamic buttons
    branchesContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const branchDiv = target.closest('.branch');
        if (!branchDiv) return;
        const branchId = branchDiv.dataset.branchId;

        // Edit Branch
        if (target.classList.contains('btn-edit-branch')) {
            const branchRef = db.collection('companies').doc(companyId).collection('branches').doc(branchId);
            const branchDoc = await branchRef.get();
            const branchData = branchDoc.data();

            const newName = prompt('Enter new branch name:', branchData.name);
            const newLocation = prompt('Enter new branch location:', branchData.location);

            if (newName && newLocation) {
                await branchRef.update({ name: newName, location: newLocation });
                renderBranches();
            }
        }

        // Delete Branch
        if (target.classList.contains('btn-delete-branch')) {
            if (confirm('Are you sure you want to delete this branch?')) {
                await db.collection('companies').doc(companyId).collection('branches').doc(branchId).delete();
                renderBranches();
            }
        }

        // Edit Inventory Item
        if (target.classList.contains('btn-edit-item')) {
            const itemId = target.dataset.itemId;
            const itemRef = db.collection('companies').doc(companyId).collection('branches').doc(branchId).collection('inventory').doc(itemId);
            const itemDoc = await itemRef.get();
            const itemData = itemDoc.data();

            const newName = prompt('Enter new item name:', itemData.name);
            const newQuantity = prompt('Enter new quantity:', itemData.quantity);

            if (newName && newQuantity) {
                await itemRef.update({ name: newName, quantity: parseInt(newQuantity) });
                renderBranches();
            }
        }

        // Delete Inventory Item
        if (target.classList.contains('btn-delete-item')) {
            const itemId = target.dataset.itemId;
            if (confirm('Are you sure you want to delete this item?')) {
                await db.collection('companies').doc(companyId).collection('branches').doc(branchId).collection('inventory').doc(itemId).delete();
                renderBranches();
            }
        }
    });
    
    // Handle Add Inventory form submission
    branchesContainer.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('add-inventory-form')) {
            e.preventDefault();
            const form = e.target;
            const branchId = form.dataset.branchId;
            const itemName = form.elements.itemName.value;
            const quantity = form.elements.quantity.value;

            try {
                await db.collection('companies').doc(companyId).collection('branches').doc(branchId).collection('inventory').add({
                    name: itemName,
                    quantity: parseInt(quantity)
                });
                renderBranches();
                alert('Inventory item added!');
            } catch (error) {
                console.error("Error adding inventory item: ", error);
                alert('Failed to add item.');
            }
        }
    });
});

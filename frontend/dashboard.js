document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const userEmailSpan = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');
    const addUnitForm = document.getElementById('add-unit-form');
    const unitList = document.getElementById('unit-list');

    let currentUser = null;

    // Check user auth state
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            userEmailSpan.textContent = user.email;
            loadUnits();
        } else {
            // If no user is logged in, redirect to login page
            window.location.href = 'login.html';
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });

    // Add a new cold storage unit
    addUnitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const unitName = addUnitForm['unit-name'].value;
        const unitTemp = addUnitForm['unit-temperature'].value;

        if (currentUser && unitName && unitTemp) {
            db.collection('users').doc(currentUser.uid).collection('coldStorageUnits').add({
                name: unitName,
                temperature: unitTemp,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                addUnitForm.reset();
            })
            .catch(error => {
                console.error("Error adding unit: ", error);
            });
        }
    });

    // Load and display units
    function loadUnits() {
        if (!currentUser) return;

        db.collection('users').doc(currentUser.uid).collection('coldStorageUnits').orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
              unitList.innerHTML = ''; // Clear the list
              if (snapshot.empty) {
                  unitList.innerHTML = '<p>No cold storage units found.</p>';
                  return;
              }

              snapshot.forEach(doc => {
                  const unit = doc.data();
                  const unitElement = document.createElement('div');
                  unitElement.classList.add('unit-item');
                  unitElement.innerHTML = `
                      <span><strong>${unit.name}</strong> - ${unit.temperature}°C</span>
                      <button data-id="${doc.id}" class="delete-unit-button">Delete</button>
                  `;
                  unitList.appendChild(unitElement);
              });
          });
    }

    // Handle unit deletion
    unitList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-unit-button')) {
            const unitId = e.target.getAttribute('data-id');
            if (currentUser && unitId) {
                db.collection('users').doc(currentUser.uid).collection('coldStorageUnits').doc(unitId).delete()
                  .catch(error => {
                      console.error("Error deleting unit: ", error);
                  });
            }
        }
    });
});

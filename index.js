
// Hero text typing effect
const texts = [
    "Welcome to Saipooja Warehouse", "Secure Storage", "Climate Control", 
    "Real-time Stock Tracking", "Loading/Unloading", "Strategic Location", 
    "Flexible Transport", "Billing and Invoicing", "Digital Challan & POD", 
    "Damage Reporting", "Extra Charge Management", "Specialized Goods Handling", 
    "Stock Transfer & Crossing"
];
let textIndex = 0;
let charIndex = 0;
const typingSpeed = 150;
const erasingSpeed = 100;
const newTextDelay = 2000;

const typingElement = document.querySelector(".hero-text h1");

function type() {
    if (charIndex < texts[textIndex].length) {
        typingElement.textContent += texts[textIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingSpeed);
    } else {
        setTimeout(erase, newTextDelay);
    }
}

function erase() {
    if (charIndex > 0) {
        typingElement.textContent = texts[textIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingSpeed);
    } else {
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(type, typingSpeed + 500);
    }
}

// Modal functionality
const loginModal = document.getElementById("login-modal");
const loginBtn = document.getElementById("login-modal-btn");
const closeBtn = document.querySelector(".close-btn");

loginBtn.onclick = function(e) {
    e.preventDefault();
    loginModal.style.display = "block";
}

closeBtn.onclick = function() {
    loginModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
}

// Form Submissions with Firebase
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined') {
        console.error("Firebase is not initialized. Make sure your Firebase config is correct.");
        return;
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    let currentUserId = null;

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserId = user.uid;
        }
    });

    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            alert("Please log in to make a booking.");
            return;
        }

        const bookingData = {
            userId: currentUserId,
            city: bookingForm.city.value,
            productDescription: bookingForm.product.value,
            requiredSpace: bookingForm.sqft.value,
            requiredHeight: bookingForm.height.value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };

        try {
            await db.collection('warehouseBookings').add(bookingData);
            alert('Warehouse booking request submitted successfully! We will contact you shortly.');
            bookingForm.reset();
        } catch (error) {
            console.error("Error submitting warehouse booking: ", error);
            alert('Failed to submit booking request. Please try again.');
        }
    });

    const logisticsForm = document.getElementById('logistics-form');
    logisticsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            alert("Please log in to make a booking.");
            return;
        }

        const logisticsData = {
            userId: currentUserId,
            pickupCity: logisticsForm['pickup-city'].value,
            dropoffCity: logisticsForm['dropoff-city'].value,
            vehicleType: logisticsForm['vehicle-type'].value,
            goodsDescription: logisticsForm['goods-description'].value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };

        try {
            await db.collection('logisticsBookings').add(logisticsData);
            alert('Logistics booking request submitted successfully! We will contact you shortly.');
            logisticsForm.reset();
        } catch (error) {
            console.error("Error submitting logistics booking: ", error);
            alert('Failed to submit booking request. Please try again.');
        }
    });

    if (texts.length) {
        setTimeout(type, newTextDelay + 250);
    }
});

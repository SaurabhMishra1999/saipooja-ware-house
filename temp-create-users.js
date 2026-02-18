// This is a helper script to create users with hashed passwords.
// You need to run this from your local machine, not in the browser.
// Make sure you have Node.js installed.

// 1. Install firebase tools and firebase-functions if you haven't:
//    npm install -g firebase-tools
//    npm install firebase-functions

// 2. Configure with your project details:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const firebase = require('firebase/app');
require('firebase/functions');

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();

// Get the createUser function
const createUser = functions.httpsCallable('createUser');

// --- Users to create ---
const usersToCreate = [
  {
    email: 'client@example.com',
    password: 'securepass123', // Use strong passwords
    role: 'client'
  },
  {
    email: 'admin@example.com',
    password: 'adminpass456',
    role: 'admin'
  },
  {
    email: 'superadmin@example.com',
    password: 'superpass789',
    role: 'superadmin'
  }
];

async function createUsers() {
  console.log('Starting to create users...');
  for (const user of usersToCreate) {
    try {
      const result = await createUser(user);
      console.log(`Successfully created user: ${user.email}`, result.data);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
  console.log('Finished creating users.');
  process.exit(0);
}

createUsers();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
admin.initializeApp();

const db = admin.firestore();
const saltRounds = 10;

exports.login = functions.https.onCall(async (data, context) => {
  const { email, password } = data;

  try {
    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'User not found.');
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    const passwordMatch = await bcrypt.compare(password, userData.passwordHash);

    if (!passwordMatch) {
      throw new functions.https.HttpsError('unauthenticated', 'Invalid password.');
    }

    let dashboard;
    switch (userData.role) {
      case 'admin':
        dashboard = '/admin.html';
        break;
      case 'superadmin':
        dashboard = '/superadmin.html';
        break;
      default:
        dashboard = '/dashboard.html';
    }

    return { success: true, dashboard };

  } catch (error) {
    throw new functions.https.HttpsError('internal', 'An error occurred during login.', error);
  }
});

exports.createUser = functions.https.onCall(async (data, context) => {
  const { email, password, role } = data;

  if (!email || !password || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing email, password, or role.');
  }

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await db.collection('users').add({
      email,
      passwordHash,
      role,
    });

    return { success: true, message: 'User created successfully.' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'An error occurred while creating the user.', error);
  }
});

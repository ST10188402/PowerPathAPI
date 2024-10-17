require('dotenv').config();
const admin = require('firebase-admin');

// Path to your service account key file
const serviceAccount = require('./firebase-creds.json');

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export the Firestore database
const db = admin.firestore();
module.exports = db;
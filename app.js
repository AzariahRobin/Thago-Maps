// app.js for Thago Map Journey

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAUDKhDwj8ThgQJl-idV68qoiPPWquh8qc",
  authDomain: "thago-81cef.firebaseapp.com",
  projectId: "thago-81cef",
  storageBucket: "thago-81cef.appspot.com",
  messagingSenderId: "770450683174",
  appId: "1:770450683174:web:3b268b2adfa7df55937de7",
  measurementId: "G-TBNTP85GMM"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


let map;

// Registration
function registerUser() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const nickname = document.getElementById('nickname').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection('users').doc(cred.user.uid).set({
        email,
        nickname,
        pins: [],
        createdAt: new Date()
      });
    })
    .then(() => {
      alert('Registered successfully! Please verify your email.');
      auth.currentUser.sendEmailVerification();
    })
    .catch(err => alert(err.message));
}

// Login
function loginUser() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      if (!auth.currentUser.emailVerified) {
        alert("Please verify your email before continuing.");
        return;
      }
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('map-section').style.display = 'block';
      initMap();
      loadPins();
    })
    .catch(err => alert(err.message));
}

// Logout
function logoutUser() {
  auth.signOut().then(() => location.reload());
}

// Password Reset
function sendResetEmail() {
  const email = document.getElementById('email').value;
  auth.sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent!"))
    .catch(err => alert(err.message));
}

// Initialize Map
function initMap() {
  map = L.map('map').setView([12.9716, 77.5946], 13); // Default: Bangalore
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  map.on('click', onMapClick);
}

// Handle Map Click
function onMapClick(e) {
  const label = prompt("Name this place:");
  if (!label) return;

  const marker = L.marker(e.latlng).addTo(map)
    .bindPopup(label).openPopup();

  const uid = auth.currentUser.uid;
  db.collection('users').doc(uid).update({
    pins: firebase.firestore.FieldValue.arrayUnion({
      label,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      timestamp: new Date()
    })
  });
}

// Load Pins
function loadPins() {
  const uid = auth.currentUser.uid;
  db.collection('users').doc(uid).get().then(doc => {
    const pins = doc.data().pins || [];
    pins.forEach(pin => {
      L.marker([pin.lat, pin.lng]).addTo(map).bindPopup(pin.label);
    });
  });
}

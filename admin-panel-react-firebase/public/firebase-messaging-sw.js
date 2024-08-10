// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: "AIzaSyB0bocjx7pIwpWxbC7Qfb7XQbSiHDQwjk0",
  authDomain: "atcs-96271.firebaseapp.com",
  databaseURL: "https://atcs-96271.firebaseio.com",
  projectId: "atcs-96271",
  storageBucket: "atcs-96271.appspot.com",
  messagingSenderId: "1046881613444",
  appId: "1:1046881613444:web:7cacf4aea8e85c6f51b4d1",
  measurementId: "G-C37ZRE87MW"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

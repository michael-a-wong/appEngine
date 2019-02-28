const express = require('express');
const app = express();
const path = require(`path`);
const bodyParser = require('body-parser');
// const firebase = require("firebase");
// // Required for side-effects
// require("firebase/firestore");


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/submit', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/form.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/index.html'));
});

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});

app.use(express.static(path.join(__dirname, 'public')));




app.post('/submit', (req, res) => {
  console.log({
    name: req.body.name,
    message: req.body.message
  });
  res.send('Thanks for your message!');
});

// // Initialize Cloud Firestore through Firebase
// firebase.initializeApp({
//   apiKey: 'AIzaSyAjB7Q2l8E3SYEjo2dX_fcIeTEccr0YrgU',
//   authDomain: '342Fgk5qmugbyVTJ425w',
//   projectId: 'high-transit-232317'
// });

// var db = firebase.firestore();

// db.collection("users").add({
//     first: "Ada",
//     last: "Lovelace",
//     born: 1815
// })
// .then(function(docRef) {
//     console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//     console.error("Error adding document: ", error);
// });



// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

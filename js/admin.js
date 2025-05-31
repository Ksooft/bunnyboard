import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyApiP04up06Vxmf3RhGt1lccSryyallfRQ",
  authDomain: "bunnyboard-816a3.firebaseapp.com",
  databaseURL: "https://bunnyboard-816a3-default-rtdb.firebaseio.com",
  projectId: "bunnyboard-816a3",
  storageBucket: "bunnyboard-816a3.appspot.com",
  messagingSenderId: "50397720455",
  appId: "1:50397720455:web:a39b3c4f8b793f1afd6d22",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      document.getElementById("errorMsg").textContent = "Ошибка: " + error.message;
    });
});
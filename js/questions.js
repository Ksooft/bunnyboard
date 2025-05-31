// Импортируем функции из Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyApiP04up06Vxmf3RhGt1lccSryyallfRQ",
  authDomain: "bunnyboard-816a3.firebaseapp.com",
  databaseURL: "https://bunnyboard-816a3-default-rtdb.firebaseio.com",
  projectId: "bunnyboard-816a3",
  storageBucket: "bunnyboard-816a3.firebasestorage.app",
  messagingSenderId: "50397720455",
  appId: "1:50397720455:web:a39b3c4f8b793f1afd6d22",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.querySelector("#submitQuestion").addEventListener('click', e => {
  e.preventDefault();
  const name = document.querySelector("#nameInput").value
  const email = document.querySelector("#emailInput").value
  const question = document.querySelector("#questionInput").value
  if (name === "") {
    alert("Пожалуйста, введите ваше имя.");
    return;
  }

  if (!validateEmail(email)) {
    alert("Пожалуйста, введите корректный email.");
    return;
  }

  if (question.length < 10) {
    alert("Ваш вопрос слишком короткий. Минимум 10 символов.");
    return;
  }

  addQuestion(name, email, question)

  document.querySelector("#nameInput").value = "";
  document.querySelector("#emailInput").value = "";
  document.querySelector("#questionInput").value = "";

  // Закрытие модалки через Bootstrap API
  const modal = bootstrap.Modal.getInstance(document.querySelector("#questionModal"));
  modal.hide();

  alert("Ваш вопрос успешно отправлен!");
})

// Функция для добавления вопроса в базу данных
function addQuestion(name, email, question) {
  const dbRef = ref(database, "questions"); // Узел "questions"
  const newQuestionRef = push(dbRef); // Создаём уникальный ключ для нового вопроса
  set(newQuestionRef, {
    name: name,
    email: email,
    question: question,
  })
    .then(() => {
      console.log("Вопрос успешно добавлен!");
    })
    .catch((error) => {
      console.error("Ошибка добавления вопроса:", error);
    });
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

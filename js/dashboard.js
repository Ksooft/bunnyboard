// dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

// 🔗 Firebase config
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
const database = getDatabase(app);



// 🔐 Авторизация
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadOrders();
    loadQuestions();
    loadReviews();
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

// 🛒 ЗАКАЗЫ
function loadOrders() {
  const ordersContainer = document.getElementById("orders-list");
  const ordersRef = ref(database, "items");

  onValue(ordersRef, (snapshot) => {
    ordersContainer.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const id = child.key;

      const card = document.createElement("div");
      card.className = "card p-3 mb-3";
      const status = data.status || "новый";
      const statusColor = {
        "новый": "secondary",
        "в обработке": "warning",
        "завершён": "success"
      }[status] || "secondary";

      card.innerHTML = `
        <strong>Имя:</strong> ${data.name}<br>
        <strong>Телефон:</strong> ${data.phone}<br>
        <strong>Заказ:</strong><br><pre class="bg-light p-2">${data.order}</pre>
        <strong>Итого:</strong> ${data.price}₽<br>
        <strong>Статус:</strong> <span class="badge bg-${statusColor}">${status}</span><br>

        <div class="mt-2 d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-warning" onclick="setOrderStatus('${id}', 'в обработке')">В обработке</button>
          <button class="btn btn-sm btn-outline-success" onclick="setOrderStatus('${id}', 'завершён')">Завершён</button>
          <button class="btn btn-sm btn-outline-secondary" onclick="setOrderStatus('${id}', 'новый')">Сбросить</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('items', '${id}')">Удалить</button>
        </div>
      `;
      ordersContainer.appendChild(card);
    });
  });
}

// ❓ ВОПРОСЫ
function loadQuestions() {
  const questionsContainer = document.getElementById("questions-list");
  const questionsRef = ref(database, "questions");

  onValue(questionsRef, (snapshot) => {
    questionsContainer.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const id = child.key;

      const card = document.createElement("div");
      card.className = "card p-3 mb-3";
      const status = data.status || "новый";
      const statusColor = {
        "новый": "secondary",
        "обработан": "success"
      }[status] || "secondary";

      card.innerHTML = `
        <strong>Имя:</strong> ${data.name}<br>
        <strong>Email:</strong> ${data.email}<br>
        <strong>Вопрос:</strong> ${data.question}<br>
        <strong>Статус:</strong> <span class="badge bg-${statusColor}">${status}</span><br>

        <div class="mt-2 d-flex flex-wrap gap-2">
          <button class="btn btn-sm btn-outline-success" onclick="setQuestionStatus('${id}', 'обработан')">Обработан</button>
          <button class="btn btn-sm btn-outline-secondary" onclick="setQuestionStatus('${id}', 'новый')">Сбросить</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('questions', '${id}')">Удалить</button>
        </div>
      `;

      questionsContainer.appendChild(card);
    });
  });
}

// 🌟 ОТЗЫВЫ
function loadReviews() {
  const reviewsContainer = document.getElementById("reviews-list");
  const reviewsRef = ref(database, "reviews");

  onValue(reviewsRef, (snapshot) => {
    reviewsContainer.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const id = child.key;

      const card = document.createElement("div");
      card.className = "card p-3 mb-3";

      let imagesHTML = "";
      if (Array.isArray(data.images)) {
        imagesHTML = data.images.map(url => `
          <img src="${url}" style="max-width: 120px;" class="me-2 mb-2 rounded border">
        `).join('');
      }

      card.innerHTML = `
        <p><strong>Отзыв:</strong><br>${data.text}</p>
        <div class="d-flex flex-wrap">${imagesHTML}</div>
        <p class="small text-muted">${new Date(data.timestamp).toLocaleString()}</p>
        <button class="btn btn-sm btn-danger mt-2" onclick="deleteItem('reviews', '${id}')">Удалить</button>
      `;

      reviewsContainer.appendChild(card);
    });
  });
}

// 🔄 Обновление статуса
window.setQuestionStatus = function(questionId, status) {
  const questionRef = ref(database, `questions/${questionId}`);
  update(questionRef, { status: status })
    .then(() => {
      console.log(`Статус вопроса ${questionId} → ${status}`);
      loadQuestions(); // обновим UI
    })
    .catch(err => console.error("Ошибка обновления вопроса:", err));
};


// ❌ Удаление
window.deleteItem = function(path, id) {
  const confirmDelete = confirm("Вы уверены, что хотите удалить этот элемент?");
  if (!confirmDelete) return;

  remove(ref(database, `${path}/${id}`))
    .then(() => alert("Элемент успешно удалён."))
    .catch(err => alert("Ошибка при удалении: " + err.message));
};


window.setOrderStatus = function(orderId, status) {
  const orderRef = ref(database, `items/${orderId}`);
  update(orderRef, { status: status })
    .then(() => {
      console.log(`Статус заказа ${orderId} обновлён на ${status}`);
      loadOrders(); // перерисовать UI
    })
    .catch(err => console.error("Ошибка статуса:", err));
};

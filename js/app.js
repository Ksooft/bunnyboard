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

let cart = [];

const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const orderForm = document.getElementById('orderForm');

function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
  cartItems.innerHTML = ''; // Очистка списка товаров
  if (cart.length === 0) {
    cartItems.innerHTML = '<li class="list-group-item text-muted">Корзина пуста</li>';
    cartCount.textContent = 0;
    cartTotalPrice.textContent = '0 р.';
    localStorage.removeItem('cart'); // Удаляем корзину из localStorage, если она пуста
    return;
  }

  const totalItems = cart.reduce((total, product) => total + product.quantity, 0);
  let totalPrice = 0;

  cart.forEach((product, index) => {
    totalPrice += product.price * product.quantity;

    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.innerHTML = `
      <div>
        <strong>${product.name}</strong> 
        <span class="badge bg-secondary ms-2">${product.quantity} шт.</span>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-dark decrease me-2" data-index="${index}">-</button>
        <button class="btn btn-sm btn-outline-primary increase" data-index="${index}">+</button>
      </div>
    `;
    cartItems.appendChild(listItem);
  });

  cartCount.textContent = totalItems;
  cartTotalPrice.textContent = `${totalPrice} р.`;

  // Сохраняем корзину в localStorage
  saveCart();

  // Добавляем события для кнопок "+" и "-"
  document.querySelectorAll('.increase').forEach(button => {
    button.addEventListener('click', event => {
      const index = event.target.dataset.index;
      cart[index].quantity++;
      updateCart();
    });
  });

  document.querySelectorAll('.decrease').forEach(button => {
    button.addEventListener('click', event => {
      const index = event.target.dataset.index;
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1); // Удалить товар, если его количество становится 0
      }
      updateCart();
    });
  });
}

// Добавление товара в корзину
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('add-to-cart')) {
    const productName = event.target.dataset.product;
    const productPrice = parseInt(event.target.dataset.price);

    const existingProduct = cart.find(product => product.name === productName);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ name: productName, price: productPrice, quantity: 1 });
    }

    updateCart(); // Обновляем корзину
  }
});

// Обработка оформления заказа
orderForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;

  if (cart.length === 0) {
    alert('Корзина пуста. Добавьте товары для оформления заказа.');
    return;
  }

  const orderSummary = cart.map(product => `${product.name} - ${product.quantity} шт. (${product.price * product.quantity} р.)`).join('\n');
  const totalOrderPrice = cart.reduce((total, product) => total + product.price * product.quantity, 0);

  addData(name, phone, totalOrderPrice, orderSummary);
  alert(`Заказ оформлен!\nИмя: ${name}\nТелефон: ${phone}\nТовары:\n${orderSummary}\nОбщая сумма: ${totalOrderPrice} р.`);

  cart = []; // Очищаем корзину
  updateCart();
  orderForm.reset();
});


document.addEventListener("DOMContentLoaded", () => {
  loadCart()
  document.querySelectorAll('.carousel-item img').forEach(img => img.classList.add('zoomable'))
   const zoomableImages = document.querySelectorAll('.carousel-inner img.zoomable');
    const fullscreenModal = document.getElementById('fullscreenModal');
    const fullscreenImage = document.getElementById('fullscreenImage');

    // Добавляем обработчик клика для увеличения изображения
    zoomableImages.forEach(image => {
      image.addEventListener('click', (event) => {
        const src = event.target.getAttribute('src'); // Получаем ссылку на изображение
        fullscreenImage.setAttribute('src', src); // Устанавливаем в модальное окно
        const modalInstance = new bootstrap.Modal(fullscreenModal); // Инициализируем модальное окно
        modalInstance.show(); // Открываем модальное окно
      });
    });
});




// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Функция для добавления данных в базу
function addData(nameBuyer, phone, totalPrice, order) {
  const dbRef = ref(database, "items");
  const newItemRef = push(dbRef); // Создаём уникальный ключ для новой записи
  set(newItemRef, {
    name: nameBuyer,
    phone: phone,
    price: totalPrice,
    order: order,
  })
    .then(() => console.log("Данные успешно добавлены!"))
    .catch((error) => console.error("Ошибка добавления данных:", error));
}




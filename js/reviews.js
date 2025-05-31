// Импортируем функции из Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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
const database = getDatabase(app);

const IMGBB_API_KEY = '8a415721a249b2e4900e1909708b6d63';

let selectedFiles = [];

const previewContainer = document.getElementById('previewImages');
const reviewImageInput = document.getElementById('reviewImage');

reviewImageInput.addEventListener('change', function(event) {
  selectedFiles = Array.from(event.target.files);
  renderPreview();
});

function renderPreview() {
  previewContainer.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function(e) {
      const colDiv = document.createElement('div');
      colDiv.classList.add('col-md-3', 'mb-3', 'position-relative');

      const imgElement = document.createElement('img');
      imgElement.src = e.target.result;
      imgElement.classList.add('img-thumbnail');
      imgElement.style.width = '100%';
      imgElement.style.height = 'auto';

      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '&times;';
      deleteBtn.classList.add('btn', 'btn-danger', 'position-absolute');
      deleteBtn.style.top = '5px';
      deleteBtn.style.right = '5px';
      deleteBtn.onclick = function() {
        selectedFiles.splice(index, 1);
        renderPreview();
      };

      colDiv.appendChild(imgElement);
      colDiv.appendChild(deleteBtn);
      previewContainer.appendChild(colDiv);
    };

    reader.readAsDataURL(file);
  });
}

document.getElementById('reviewForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const reviewText = document.getElementById('reviewText').value.trim();
  let imageUrls = [];

  if (selectedFiles.length > 0) {
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          imageUrls.push(result.data.url);
        } else {
          alert('Ошибка загрузки изображения на ImgBB.');
          return;
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки на ImgBB:', error);
      alert('Ошибка при загрузке изображений.');
      return;
    }
  }

  try {
    const newReviewRef = push(ref(database, 'reviews'));
    await set(newReviewRef, {
      text: reviewText,
      images: imageUrls.length > 0 ? imageUrls : null,
      timestamp: Date.now()
    });

    alert('Отзыв успешно добавлен!');

    // Сброс формы и очистка превью
    document.getElementById('reviewForm').reset();
    selectedFiles = [];
    renderPreview();
    displayReviews();

  } catch (error) {
    console.error('Ошибка сохранения отзыва:', error);
    alert('Ошибка при сохранении отзыва!');
  }
});

function displayReviews() {
  const reviewsContainer = document.getElementById('reviewsContainer');
  reviewsContainer.innerHTML = ''; // Очистим контейнер перед рендером отзывов

  const reviewsRef = ref(database, 'reviews');
  onValue(reviewsRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
      const reviewsArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);

      reviewsArray.forEach((review) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('col-md-6', 'col-lg-4', 'mb-4');

        let imagesHtml = '';
        if (review.images && review.images.length > 0) {
          imagesHtml += `<div class="review-images">`;
          review.images.forEach(imageUrl => {
            imagesHtml += `
              <a href="#" class="open-modal" data-image="${imageUrl}">
                <img src="${imageUrl}" alt="Изображение отзыва">
              </a>
            `;
          });
          imagesHtml += `</div>`;
        }


        reviewDiv.innerHTML = `
          <div class="card">
            <div class="card-body">
              <p class="card-text">${review.text}</p>
              ${imagesHtml}
            </div>
          </div>
        `;

        // Навешиваем обработчик на все ссылки-картинки
        const openModalLinks = reviewDiv.querySelectorAll('.open-modal');
        openModalLinks.forEach(link => {
          link.addEventListener('click', function(event) {
            event.preventDefault();
            const imageUrl = this.getAttribute('data-image');
            openModal(imageUrl);
          });
        });

        reviewsContainer.appendChild(reviewDiv);
      });
    }
  }, { onlyOnce: true });
}


function openModal(imageUrl) {
  const modalImage = document.getElementById('modalImage');
  modalImage.src = imageUrl;

  const modal = new bootstrap.Modal(document.getElementById('imageModal'));
  modal.show();
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  const backdrop = document.querySelector('.modal-backdrop');

  if (backdrop) backdrop.remove();

  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.hide();
}

document.querySelector('.btn-close').addEventListener('click', function() {
  closeModal();
});

displayReviews();

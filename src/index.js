import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const { default: axios } = require('axios');

const apiKey = '31450160-24823ee897b47d1bc14ce3258';
const baseUrl = 'https://pixabay.com/api/';
let page = 1;
let search = '';
const perPage = 40;
let totalHits = 0;

const fetchImages = async (query, page) => {
  try {
    const response = await axios.get(
      `${baseUrl}?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );

    if (!response.data.hits.length) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    totalHits = response.data.totalHits;
    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }
    return response.data;
  } catch (e) {
    return Notiflix.Notify.failure('Oops an error occured');
  }
};

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const searchInput = document.querySelector('[name=searchQuery]');

const prepareHtml = async () => {
  const data = await fetchImages(search, page);
  if (!data) return;
  let toRender = '';
  data.hits.forEach(item => {
    toRender += `<div class="photo-card">
      <a href="${item.largeImageURL}"><img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" /></a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        <span>${item.likes}</span>
      </p>
      <p class="info-item">
        <b>Views</b>
        <span>${item.views}</span>
      </p>
      <p class="info-item">
        <b>Comments</b>
        <span>${item.comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads</b>
        <span>${item.downloads}</span>
      </p>
    </div>
  </div>`;
  });
  return toRender;
};

const handleFormSubmit = async e => {
  e.preventDefault();
  gallery.innerHTML = '';
  const formData = Object.fromEntries(new FormData(e.target).entries());
  search = formData.searchQuery;
  const markup = await prepareHtml();
  loadMoreBtn.style.display = 'none';
  if (!markup) return;
  gallery.innerHTML = markup;
  loadMoreBtn.style.display = 'block';
  new SimpleLightbox('.gallery a', {});
};

const loadMore = async () => {
  page += 1;
  if (page * perPage >= totalHits) {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  const markup = await prepareHtml();

  if (!markup) return;
  gallery.innerHTML += markup;
  new SimpleLightbox('.gallery a', {});
};

form.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMore);
searchInput.addEventListener('input', () => {
  page = 1;
});

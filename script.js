const revealItems = document.querySelectorAll('.reveal');
const note = document.querySelector('.secret-note');
const openNote = document.querySelector('.open-note');
const closeNotes = document.querySelectorAll('.close-note');
const musicToggle = document.querySelector('.music-toggle');
const noteBook = document.querySelector('.note-book');
const pages = [...document.querySelectorAll('.note-paper')];
const prevPage = document.querySelector('.prev-page');
const nextPage = document.querySelector('.next-page');
const pageNumber = document.querySelector('.page-count strong');
const bgMusic = document.querySelector('#bgMusic');
const musicLabel = musicToggle.querySelector('.music-label');
const totalPages = pages.length;
let currentPage = 1;

const heroPhoto = document.querySelector('.hero-photo');
const heroSlides = [
  'assets/photos/1.jpg',
  'assets/photos/2.jpg',
  'assets/photos/3.jpg',
  'assets/photos/4.jpg'
];
let heroSlideIndex = 0;

function setHeroSlide(index) {
  heroPhoto.style.backgroundImage = `linear-gradient(160deg, rgba(228, 110, 85, .16), transparent 55%), url('${heroSlides[index]}')`;
  heroPhoto.dataset.slide = String(index + 1);
}

heroSlides.forEach((source) => { new Image().src = source; });
setHeroSlide(heroSlideIndex);
window.setInterval(() => {
  heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
  if (typeof heroPhoto.animate === 'function') {
    heroPhoto.animate([{ opacity: 1 }, { opacity: .08 }, { opacity: 1 }], { duration: 1400, easing: 'ease-in-out' });
  }
  window.setTimeout(() => setHeroSlide(heroSlideIndex), 700);
}, 5000);

bgMusic.volume = 0.45;

function setMusicState(isPlaying, fallback = false) {
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicLabel.textContent = fallback ? 'putar musik' : (isPlaying ? 'pause musik' : 'putar musik');
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => observer.observe(item));

function closeSecretNote() {
  note.hidden = true;
  document.body.style.overflow = '';
}

openNote.addEventListener('click', () => {
  tryStartMusic();
  note.hidden = false;
  showPage(1, false);
  document.body.style.overflow = 'hidden';
  closeNotes[0].focus();
});
closeNotes.forEach((button) => button.addEventListener('click', closeSecretNote));
note.addEventListener('click', (event) => {
  if (event.target === note) closeSecretNote();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !note.hidden) closeSecretNote();
});

function showPage(page, animate = true) {
  if (page < 1 || page > totalPages) return;
  if (page === currentPage) {
    pages.forEach((item) => item.classList.remove('page-visible'));
    pages[page - 1].classList.add('page-visible');
    pageNumber.textContent = String(page).padStart(2, '0');
    prevPage.disabled = page === 1;
    nextPage.disabled = page === totalPages;
    return;
  }
  const direction = page > currentPage ? 'turning-forward' : 'turning-back';
  const activePage = pages[currentPage - 1];
  const targetPage = pages[page - 1];
  noteBook.classList.remove('turning-forward', 'turning-back');
  targetPage.classList.add('page-visible');
  if (animate) {
    noteBook.classList.add(direction);
    window.setTimeout(() => {
      pages.forEach((item) => item.classList.remove('page-visible'));
      targetPage.classList.add('page-visible');
      noteBook.classList.remove('turning-forward', 'turning-back');
    }, 450);
  } else {
    pages.forEach((item) => item.classList.remove('page-visible'));
    targetPage.classList.add('page-visible');
  }
  activePage.classList.remove('page-visible');
  currentPage = page;
  pageNumber.textContent = String(page).padStart(2, '0');
  prevPage.disabled = page === 1;
  nextPage.disabled = page === totalPages;
}

prevPage.addEventListener('click', () => showPage(currentPage - 1));
nextPage.addEventListener('click', () => showPage(currentPage + 1));

musicToggle.addEventListener('click', async () => {
  if (bgMusic.error) {
    musicToggle.setAttribute('aria-pressed', 'false');
    musicLabel.textContent = 'tambahkan musik';
    return;
  }
  if (bgMusic.paused) {
    try {
      await bgMusic.play();
      setMusicState(true);
    } catch {
      setMusicState(false, true);
    }
  } else {
    bgMusic.pause();
    setMusicState(false);
  }
});

bgMusic.addEventListener('error', () => {
  musicToggle.setAttribute('aria-pressed', 'false');
  musicLabel.textContent = 'tambahkan musik';
});

bgMusic.addEventListener('play', () => setMusicState(true));
bgMusic.addEventListener('pause', () => setMusicState(false));

async function tryStartMusic() {
  if (bgMusic.error || !bgMusic.paused) return;
  try {
    await bgMusic.play();
    if (bgMusic.error) {
      setMusicState(false, true);
      return;
    }
    setMusicState(true);
  } catch {
    setMusicState(false, true);
  }
}

tryStartMusic();
document.addEventListener('pointerdown', (event) => {
  if (event.target !== musicToggle) tryStartMusic();
}, { once: true });

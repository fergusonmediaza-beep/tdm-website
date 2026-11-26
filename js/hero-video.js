/* global document, window, navigator */

/*
 * Home hero video: silent and looping, with a pause/play button.
 * The video file only loads on screens 768px and wider, and not for visitors
 * who prefer reduced motion or have data saver on: they see the still poster.
 */
const heroVideo = document.querySelector('.js-hero-video');
const videoToggle = document.querySelector('.js-hero-video-toggle');
const MIN_VIDEO_WIDTH = 768;

function shouldLoadVideo() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wideScreen = window.matchMedia(`(width >= ${MIN_VIDEO_WIDTH}px)`).matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  return wideScreen && !reducedMotion && !saveData;
}

function showToggleState(isPaused) {
  const iconUse = videoToggle.querySelector('.js-hero-video-icon use');
  const iconName = isPaused ? 'icon-play' : 'icon-pause';
  videoToggle.setAttribute('aria-label', isPaused ? 'Play background video' : 'Pause background video');
  iconUse.setAttribute('href', `images/icons.svg#${iconName}`);
}

function toggleVideo() {
  if (heroVideo.paused) {
    heroVideo.play().catch(() => showToggleState(true));
  } else {
    heroVideo.pause();
  }
}

function startVideo() {
  const source = heroVideo.querySelector('source[data-src]');
  source.src = source.dataset.src;
  heroVideo.load();
  heroVideo.play().catch(() => showToggleState(true));

  videoToggle.hidden = false;
  videoToggle.addEventListener('click', toggleVideo);
  heroVideo.addEventListener('play', () => showToggleState(false));
  heroVideo.addEventListener('pause', () => showToggleState(true));
}

if (heroVideo && videoToggle && shouldLoadVideo()) {
  startVideo();
}

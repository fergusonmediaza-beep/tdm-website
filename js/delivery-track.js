/* global document, window, IntersectionObserver */

const TRACK_SELECTOR = '.js-delivery-track';

function revealTrack(track) {
  track.classList.remove('is-armed');
  track.classList.add('is-visible');
}

function initDeliveryTracks() {
  const tracks = document.querySelectorAll(TRACK_SELECTOR);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!tracks.length || reduceMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        revealTrack(entry.target);
      }
    });
  }, { threshold: 0.3 });

  tracks.forEach((track) => {
    track.classList.add('is-armed');
    observer.observe(track);
  });
}

initDeliveryTracks();

/* global document, window */
/*
 * Home hero video: silent and always looping (user decision, no pause button).
 * Visitors who prefer reduced motion see the still poster instead.
 */
const heroVideo = document.querySelector('.js-hero-video');

if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroVideo.removeAttribute('autoplay');
  heroVideo.pause();
}

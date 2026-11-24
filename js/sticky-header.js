/* global document, window */
/*
 * The header is sticky (CSS). Once the page scrolls, it gets a solid bar behind it
 * so the logo and nav stay readable over the dark hero, photos and the map.
 */
const siteHeader = document.querySelector('.site-header');

function updateHeader() {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
}

if (siteHeader) {
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

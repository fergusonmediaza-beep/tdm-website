/* global document */

/*
 * Tells screen readers whether the mobile menu is open: Bootstrap's offcanvas
 * doesn't update aria-expanded on the button that opens it.
 */
const menu = document.querySelector('#mobile_menu');
const menuButton = document.querySelector('.hamburger');

function setExpanded(isOpen) {
  menuButton.setAttribute('aria-expanded', String(isOpen));
}

if (menu && menuButton) {
  menu.addEventListener('show.bs.offcanvas', () => setExpanded(true));
  menu.addEventListener('hidden.bs.offcanvas', () => setExpanded(false));
}

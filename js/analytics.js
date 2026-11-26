/* global document, window */

/*
 * Google Analytics 4, loaded only after the visitor accepts cookies.
 * Until GA_MEASUREMENT_ID is filled in, nothing loads and no banner shows.
 * The choice is remembered in this browser; "Cookie settings" in the footer
 * reopens the banner so visitors can change their mind.
 */
const GA_MEASUREMENT_ID = '';
const CONSENT_KEY = 'tdm-cookie-consent';
const CONSENT_GRANTED = 'granted';
const CONSENT_DENIED = 'denied';

const banner = document.querySelector('.js-cookie-banner');
const settingsButtons = document.querySelectorAll('.js-cookie-settings');

function readConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* Storage blocked (private mode): the choice lasts for this page only. */
  }
}

function gtag() {
  /* gtag.js needs the arguments object itself, not an array copy. */
  window.dataLayer.push(arguments);
}

function loadAnalytics() {
  if (window.tdmAnalyticsLoaded) {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    return;
  }
  window.tdmAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.append(script);
}

/* Stops tracking and removes the Google Analytics cookies already set. */
function stopAnalytics() {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  const domain = window.location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('_ga')) {
      [domain, `.${domain}`, ''].forEach((cookieDomain) => {
        const domainPart = cookieDomain ? `; domain=${cookieDomain}` : '';
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
      });
    }
  });
}

function trackEvent(name, params) {
  if (readConsent() === CONSENT_GRANTED && window.tdmAnalyticsLoaded) {
    gtag('event', name, params);
  }
}

function showBanner() {
  banner.hidden = false;
  window.requestAnimationFrame(() => banner.classList.add('is-visible'));
}

function hideBanner() {
  banner.classList.remove('is-visible');
  banner.hidden = true;
}

function handleChoice(value) {
  saveConsent(value);
  hideBanner();
  if (value === CONSENT_GRANTED) {
    loadAnalytics();
  } else {
    stopAnalytics();
  }
}

/* Counts email and phone clicks, and sent enquiries (from contact.js). */
function handleLinkClick(event) {
  const link = event.target.closest('a[href^="mailto:"], a[href^="tel:"]');
  if (link) {
    const method = link.href.startsWith('mailto:') ? 'email' : 'phone';
    trackEvent('contact_click', { method });
  }
}

function initAnalytics() {
  if (GA_MEASUREMENT_ID === '' || !banner) {
    return;
  }
  settingsButtons.forEach((button) => {
    button.hidden = false;
    button.closest('.footer-item').hidden = false;
    button.addEventListener('click', showBanner);
  });
  banner.querySelector('.js-cookie-accept').addEventListener('click', () => handleChoice(CONSENT_GRANTED));
  banner.querySelector('.js-cookie-decline').addEventListener('click', () => handleChoice(CONSENT_DENIED));
  document.addEventListener('click', handleLinkClick);
  document.addEventListener('tdm:enquiry-sent', (event) => {
    trackEvent('generate_lead', { enquiry_type: event.detail.enquiryType });
  });

  const consent = readConsent();
  if (consent === CONSENT_GRANTED) {
    loadAnalytics();
  } else if (consent !== CONSENT_DENIED) {
    showBanner();
  }
}

initAnalytics();

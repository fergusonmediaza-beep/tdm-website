/* global document, window, emailjs */

const EMAILJS_PUBLIC_KEY = 'm-pxaM_ZlXFuxAhM-';
const EMAILJS_SERVICE_ID = 'service_h9vkkpb';
const EMAILJS_TEMPLATE_ID = 'template_ern697j';
const RESUBMIT_DELAY_MS = 30000;
const FALLBACK_EMAIL = 'enquires@tdmza.co.za';

function setStatus(status, message, type) {
  status.textContent = message;
  status.classList.toggle('is-success', type === 'success');
  status.classList.toggle('is-error', type === 'error');
}

function isEmailServiceReady() {
  return EMAILJS_PUBLIC_KEY !== ''
    && EMAILJS_SERVICE_ID !== ''
    && EMAILJS_TEMPLATE_ID !== ''
    && typeof emailjs !== 'undefined';
}

function fieldValue(form, name) {
  const field = form.elements.namedItem(name);
  return field ? field.value.trim() : '';
}

/*
 * The EmailJS template (copied from the EPF sites, like Digication's) uses the
 * case-sensitive {{Name}}, {{Email}}, {{Subject}} and {{Message}}. The lower-case
 * names are sent too, in case the template is changed. The message carries all
 * the details, so nothing is lost if the template only shows the message.
 */
function buildTemplateParams(form) {
  const name = fieldValue(form, 'from_name');
  const email = fieldValue(form, 'reply_to');
  const organisation = fieldValue(form, 'organisation') || 'Not given';
  const phone = fieldValue(form, 'phone') || 'Not given';
  const enquiryType = fieldValue(form, 'enquiry_type');
  const text = fieldValue(form, 'message');
  const subject = `${enquiryType} enquiry from ${name}`;
  const fullMessage = `${text}\n\nOrganisation: ${organisation}\nPhone: ${phone}\nEnquiry type: ${enquiryType}`;

  return {
    Name: name,
    Email: email,
    Subject: subject,
    Message: fullMessage,
    name,
    from_name: name,
    email,
    reply_to: email,
    title: subject,
    subject,
    organisation,
    phone,
    enquiry_type: enquiryType,
    message: fullMessage,
  };
}

function releaseSubmit(button, delay) {
  window.setTimeout(() => {
    button.disabled = false;
  }, delay);
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.enquiry-status');
  const submit = form.querySelector('.enquiry-submit');
  const honeypot = form.querySelector('.enquiry-honeypot-input');

  form.classList.add('was-validated');

  if (!form.checkValidity()) {
    setStatus(status, 'Please complete the highlighted fields.', 'error');
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return;
  }

  if (honeypot.value !== '') {
    return;
  }

  if (!isEmailServiceReady()) {
    setStatus(status, `The enquiry form is not connected yet. Please email us at ${FALLBACK_EMAIL}.`, 'error');
    return;
  }

  submit.disabled = true;
  setStatus(status, 'Sending your enquiry…', '');

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, buildTemplateParams(form), { publicKey: EMAILJS_PUBLIC_KEY })
    .then(() => {
      form.reset();
      form.classList.remove('was-validated');
      setStatus(status, 'Thank you. Your enquiry has been sent and our team will be in touch.', 'success');
      releaseSubmit(submit, RESUBMIT_DELAY_MS);
    })
    .catch(() => {
      setStatus(status, `Your enquiry could not be sent. Please try again, or email us at ${FALLBACK_EMAIL}.`, 'error');
      releaseSubmit(submit, 0);
    });
}

function initEnquiryForm() {
  const form = document.querySelector('.js-enquiry-form');
  if (!form) {
    return;
  }
  form.addEventListener('submit', handleSubmit);
}

initEnquiryForm();

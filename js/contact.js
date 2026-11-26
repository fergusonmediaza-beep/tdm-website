/* global document, window, emailjs, CustomEvent */

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
 * The EmailJS template uses the case-sensitive {{Name}}, {{Email}},
 * {{Subject}} and {{Message}}. The lower-case
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

/*
 * Spaces alone don't count as an answer: required text fields are checked on
 * their trimmed value, and the message must still reach its minimum length.
 */
function checkTrimmedValue(field) {
  if (field.type === 'checkbox' || field.tagName === 'SELECT') {
    return;
  }
  const trimmed = field.value.trim();
  const tooShort = field.minLength > 0 && trimmed.length < field.minLength;
  const empty = field.required && trimmed === '';
  field.setCustomValidity(empty || tooShort ? 'invalid' : '');
}

/* Links the error text to a field only while that field is wrong. */
function markField(field) {
  const errorId = field.dataset.error;
  const isInvalid = !field.checkValidity();
  field.setAttribute('aria-invalid', String(isInvalid));
  if (isInvalid && errorId) {
    field.setAttribute('aria-describedby', errorId);
  } else {
    field.removeAttribute('aria-describedby');
  }
}

function validateForm(form) {
  const fields = form.querySelectorAll('[data-error]');
  fields.forEach((field) => {
    checkTrimmedValue(field);
    markField(field);
  });
  return form.checkValidity();
}

function handleFieldChange(event) {
  const field = event.target;
  const form = event.currentTarget;
  if (!field.dataset.error || !form.classList.contains('was-validated')) {
    return;
  }
  checkTrimmedValue(field);
  markField(field);
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

  if (!validateForm(form)) {
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

  const enquiryType = fieldValue(form, 'enquiry_type');

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, buildTemplateParams(form), { publicKey: EMAILJS_PUBLIC_KEY })
    .then(() => {
      document.dispatchEvent(new CustomEvent('tdm:enquiry-sent', { detail: { enquiryType } }));
      form.reset();
      form.querySelectorAll('[data-error]').forEach((field) => field.removeAttribute('aria-invalid'));
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
  form.addEventListener('input', handleFieldChange);
  form.addEventListener('change', handleFieldChange);
}

initEnquiryForm();

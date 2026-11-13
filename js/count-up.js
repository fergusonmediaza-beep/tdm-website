/* global document, window, IntersectionObserver */

const COUNTER_SELECTOR = '.stat-value, .record-figure-value';
const GROUP_SELECTOR = 'section';
const DURATION_MS = 1800;
const NUMBER_PATTERN = /^(\d+)(\D*)$/;

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function prepareCounter(element) {
  const finalText = element.textContent.trim();
  const match = NUMBER_PATTERN.exec(finalText);
  if (!match) {
    return null;
  }

  const spokenValue = document.createElement('span');
  spokenValue.className = 'visually-hidden';
  spokenValue.textContent = finalText;

  const shownValue = document.createElement('span');
  shownValue.setAttribute('aria-hidden', 'true');
  shownValue.textContent = `0${match[2]}`;

  element.textContent = '';
  element.append(spokenValue, shownValue);
  return { output: shownValue, target: Number(match[1]), suffix: match[2] };
}

function runGroup(counters) {
  let startTime = 0;

  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }
    const progress = Math.min((timestamp - startTime) / DURATION_MS, 1);
    const eased = easeOutCubic(progress);
    counters.forEach((counter) => {
      counter.output.textContent = `${Math.round(counter.target * eased)}${counter.suffix}`;
    });
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function initCounters() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const groups = new Map();
  document.querySelectorAll(COUNTER_SELECTOR).forEach((element) => {
    const group = element.closest(GROUP_SELECTOR) || document.body;
    const counter = prepareCounter(element);
    if (!counter) {
      return;
    }
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group).push(counter);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        runGroup(groups.get(entry.target));
      }
    });
  }, { threshold: 0.25 });

  groups.forEach((counters, group) => {
    observer.observe(group);
  });
}

initCounters();

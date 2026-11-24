/* global document, window, IntersectionObserver */

const COUNTER_SELECTOR = '.stat-value, .record-figure-value, .hero-tagline-strong';
const GROUP_SELECTOR = 'section';
const DURATION_MS = 1800;
const NUMBER_PATTERN = /^(\d+)(\D*)$/;

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

/*
 * Every counter in a group moves from the first frame and lands on its final value
 * only on the last frame, so small numbers (3, 10) don't finish before big ones (135).
 */
function shownNumber(target, progress, eased) {
  if (progress >= 1) {
    return target;
  }
  const floor = Math.floor(target * eased);
  return Math.min(target - 1, Math.max(1, floor));
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

function runGroup(counters, delayMs) {
  let startTime = 0;

  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }
    const progress = Math.min((timestamp - startTime) / DURATION_MS, 1);
    const eased = easeOutCubic(progress);
    counters.forEach((counter) => {
      counter.output.textContent = `${shownNumber(counter.target, progress, eased)}${counter.suffix}`;
    });
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.setTimeout(() => window.requestAnimationFrame(step), delayMs);
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
        runGroup(groups.get(entry.target), Number(entry.target.dataset.countDelay) || 0);
      }
    });
  }, { threshold: 0.25 });

  groups.forEach((counters, group) => {
    observer.observe(group);
  });
}

initCounters();

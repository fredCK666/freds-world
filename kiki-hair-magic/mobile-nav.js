// Mobile section navigation: one moving highlight, shared by click and scroll.
const bar = document.querySelector('.mobile-bar');
const links = [...bar.querySelectorAll('a')];
const sections = ['works', 'prices', 'studio', 'about', 'consult'].map(id => document.getElementById(id));
let selected = null;
let clickTarget = null;
let releaseTimer = 0;
let frame = 0;

function selectSection(id) {
  const index = links.findIndex(link => link.hash === '#' + id);
  if (selected === index) return;
  selected = index;
  bar.classList.toggle('has-selection', index >= 0);
  if (index >= 0) bar.style.setProperty('--indicator-x', `calc(${index * 100}% + ${index * 6}px)`);
  links.forEach((link, i) => {
    link.classList.toggle('is-active', i === index);
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function sectionAtViewport() {
  const guide = (document.querySelector('.header')?.getBoundingClientRect().bottom || 0) + 100;
  let current = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= guide) current = section.id;
  }
  return current;
}

function syncScroll() {
  frame = 0;
  if (!clickTarget) selectSection(sectionAtViewport());
}
function queueSync() {
  if (!frame) frame = requestAnimationFrame(syncScroll);
}
function releaseClick() {
  clearTimeout(releaseTimer);
  clickTarget = null;
  queueSync();
}

// Anchor navigation remains native; the indicator responds immediately.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const id = link.hash.slice(1);
  if (!document.getElementById(id)) return;
  clickTarget = id;
  selectSection(id);
  clearTimeout(releaseTimer);
  releaseTimer = setTimeout(releaseClick, 1800);
});
addEventListener('scroll', () => {
  if (clickTarget) {
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(releaseClick, 180);
  }
  queueSync();
}, { passive: true });
addEventListener('scrollend', releaseClick, { passive: true });
for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
  addEventListener(event, releaseClick, { passive: true });
}
addEventListener('resize', queueSync, { passive: true });
addEventListener('pageshow', releaseClick);
queueSync();

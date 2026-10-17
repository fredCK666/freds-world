// Small, finite feedback animations. Native scrolling and form behavior stay intact.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.2,.75,.3,1)';
  const active = new WeakMap();
  function play(el, frames, duration = 320, delay = 0) {
    if (!el || reduced.matches || !el.animate) return;
    active.get(el)?.cancel();
    const animation = el.animate(frames, { duration, delay, easing: ease, fill: 'backwards' });
    active.set(el, animation);
  }
  const revealSelector = '.section-head,.quick-points>a,.work-card,.price-menu,.estimate,.studio-grid>*,.about-grid>*,.booking-steps li,#consult-form,.wish-card,.faq>*,footer>*';
  const seen = new WeakSet();
  let observer;
  const reveal = el => {
    el.classList.remove('motion-pending');
    observer?.unobserve(el);
    play(el, [{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}], 520, Number(el.dataset.motionDelay || 0));
  };
  if ('IntersectionObserver' in window) observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { rootMargin: '0px 0px -20px 0px', threshold: 0 });
  function watch(root = document, fresh = false) {
    root.querySelectorAll(revealSelector).forEach((el, index) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.dataset.motionDelay = String(Math.min(index % 4 * 45, 135));
      if (reduced.matches || !observer) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > innerHeight) { el.classList.add('motion-pending'); observer.observe(el); }
      else if (fresh && rect.bottom > 0) reveal(el);
    });
  }
  watch();
  ['.hero-copy','.hero-collage'].forEach((selector,index) => play(document.querySelector(selector),[
    {opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}
  ],600,index*80));
  ['gallery','favorite-list','price-table'].forEach(id => {
    const root = document.getElementById(id);
    if (root) new MutationObserver(() => {
      watch(root,true);
      if (id !== 'gallery') play(root,[{opacity:.55,translate:'0 5px'},{opacity:1,translate:'0 0'}],260);
    }).observe(root,{childList:true});
  });
  const total = document.getElementById('estimate-total');
  if (total) new MutationObserver(() => play(total,[
    {scale:'.94',opacity:.6},{scale:'1.035',opacity:1},{scale:'1',opacity:1}
  ],340)).observe(total,{childList:true,characterData:true,subtree:true});
  const clickable = 'button:not(:disabled),a,summary,.upload-label,input[type=checkbox]';
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || reduced.matches) return;
    const el = event.target.closest(clickable);
    if (el) play(el,[{scale:'1'},{scale:'.96'},{scale:'1'}],240);
  },{passive:true});
  document.addEventListener('click', event => {
    const el = event.target.closest(clickable);
    if (!el) return;
    if (event.detail === 0) play(el,[{scale:'.96'},{scale:'1.025'},{scale:'1'}],300);
    if (el.matches('.favorite')) play(el,[{scale:'.85',rotate:'-8deg'},{scale:'1.2',rotate:'8deg'},{scale:'1',rotate:'0deg'}],420);
    if (el.matches('.swatch')) play(el.querySelector('i'),[{scale:'.9'},{scale:'1.12'},{scale:'1'}],350);
  });
  document.addEventListener('toggle', event => {
    if (event.target.matches('details') && event.target.open) {
      [...event.target.children].filter(el=>el.tagName!=='SUMMARY').forEach(el=>play(el,[{opacity:0,translate:'0 -5px'},{opacity:1,translate:'0 0'}],280));
    }
  },true);
  document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(() => {
    if (dialog.open) play(dialog,[{opacity:0,scale:'.97',translate:'0 10px'},{opacity:1,scale:'1',translate:'0 0'}],300);
  }).observe(dialog,{attributes:true,attributeFilter:['open']}));
  // Never leave focused content waiting for a scroll reveal.
  document.addEventListener('focusin', event => {
    const pending = event.target.closest('.motion-pending');
    if (pending) { pending.classList.remove('motion-pending'); observer?.unobserve(pending); }
  });
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  const header = document.querySelector('.header');
  let frame = 0;
  function updateProgress() {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + Math.min(1,Math.max(0,distance>0?scrollY/distance:0)) + ')';
    header?.classList.toggle('is-scrolled',scrollY>12);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('pageshow',schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  reduced.addEventListener('change', () => {
    document.querySelectorAll('.motion-pending').forEach(el=>{el.classList.remove('motion-pending');observer?.unobserve(el);});
    if (reduced.matches) document.getAnimations().forEach(animation=>animation.cancel());
  });
  updateProgress();
})();

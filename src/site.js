const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.header-nav');
const mobile = matchMedia('(max-width: 1000px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (toggle && navigation) {
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    navigation.hidden = mobile.matches && !open;
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.hidden = false;
  setOpen(false);
  mobile.addEventListener('change', () => setOpen(false));
  toggle.addEventListener('click', () => setOpen(!isOpen()));

  navigation.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (!anchor || !isOpen() || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setOpen(false);
  });
  document.addEventListener('pointerdown', (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
}

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest('a[href^="#"]:not(.skip)');
  if (!anchor?.hash) return;
  const destination = document.getElementById(anchor.hash.slice(1));
  if (!destination) return;
  event.preventDefault();
  if (location.hash !== anchor.hash) history.pushState(null, '', anchor.hash);
  const heading = destination.querySelector('h2') ?? destination;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  destination.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const entrances = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      target.classList.add('reveal-enter');
      entrances.unobserve(target);
    }
  }, { rootMargin: '0px 0px -46px 0px', threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach((section) => entrances.observe(section));
}

if (header && document.body.classList.contains('home-page')) {
  const anchors = [...header.querySelectorAll('a[href^="#"]')];
  const sections = anchors.map((anchor) => ({
    anchor,
    section: document.getElementById(anchor.hash.slice(1)).closest('section'),
  })).sort((first, second) =>
    first.section.compareDocumentPosition(second.section) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

  let active;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
    header.style.setProperty('--progress', reducedMotion.matches ? 0 : progress);
    const focusLine = header.offsetHeight + Math.min(120, innerHeight * 0.16);
    const visible = progress === 1 ? sections.at(-1)
      : sections.findLast(({ section }) => section.getBoundingClientRect().top <= focusLine);
    if (visible?.anchor === active) return;
    active?.removeAttribute('aria-current');
    active = visible?.anchor;
    active?.setAttribute('aria-current', 'location');
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  reducedMotion.addEventListener('change', schedule);
  update();
}

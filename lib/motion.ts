import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function pageEnterTimeline(scope: Element): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  if (prefersReducedMotion()) return tl;

  const q = gsap.utils.selector(scope);

  tl.fromTo(q('.anim-header'), { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.35 }, 0)
    .fromTo(q('.anim-hero-title'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, 0.08)
    .fromTo(q('.anim-hero-sub'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 }, 0.16)
    .fromTo(
      q('.anim-chat-panel'),
      { opacity: 0, y: 12, scale: 0.995 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' },
      0.22,
    )
    .fromTo(q('.anim-composer'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0.34)
    .fromTo(q('.anim-footer'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.42)
    .fromTo(
      q('.chip-suggested'),
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04 },
      0.5,
    );

  return tl;
}

export function suggestedChipHoverTween(el: Element): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  if (prefersReducedMotion()) return tl;
  tl.to(el, {
    y: -1,
    borderColor: '#6b8f71',
    color: '#6b8f71',
    duration: 0.18,
    ease: 'power2.out',
  });
  return tl;
}

export function streamTokenTween(el: Element): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(el, { opacity: 1 }) as unknown as gsap.core.Tween;
  }
  return gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'power2.out' });
}

export function toolChipMountTween(el: Element): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(el, { opacity: 1, y: 0 }) as unknown as gsap.core.Tween;
  }
  return gsap.fromTo(
    el,
    { opacity: 0, y: 4 },
    { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' },
  );
}

export function toolChipFinishTween(el: Element): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (prefersReducedMotion()) return tl;
  const dots = el.querySelector('.chip-dots');
  const ok = el.querySelector('.chip-ok');
  if (dots) tl.to(dots, { opacity: 0, duration: 0.15 });
  if (ok) tl.fromTo(ok, { opacity: 0 }, { opacity: 1, duration: 0.2 }, '>');
  return tl;
}

export function errorShakeTween(el: Element): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(el, {}) as unknown as gsap.core.Tween;
  }
  return gsap.fromTo(
    el,
    { x: 0 },
    {
      keyframes: { x: [0, -4, 4, -2, 2, 0] },
      duration: 0.4,
      ease: 'power1.out',
    },
  );
}

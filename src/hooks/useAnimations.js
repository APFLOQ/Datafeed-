import { useEffect, useRef } from 'react';
import { $ as anime, stagger, set } from 'animejs';

export function useCardEntrance(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll('.glass-card');
    if (cards.length === 0) return;
    anime({
      targets: cards,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(80),
      duration: 600,
      easing: 'easeOutCubic',
    });
  }, [ref]);
}

export function useScrollReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = entry.target.querySelectorAll('.reveal');
            if (targets.length === 0) return;
            anime({
              targets,
              opacity: [0, 1],
              translateY: [30, 0],
              delay: stagger(100),
              duration: 500,
              easing: 'easeOutCubic',
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
}

export function useStaggerText(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const text = ref.current.textContent;
    ref.current.innerHTML = text
      .split('')
      .map((char) => `<span class="char">${char === ' ' ? ' ' : char}</span>`)
      .join('');
    anime({
      targets: ref.current.querySelectorAll('.char'),
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(30),
      duration: 500,
      easing: 'easeOutCubic',
    });
  }, [ref]);
}

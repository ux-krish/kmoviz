import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './SoundIntro.scss';

export default function SoundIntro({ onFinish }) {
  const containerRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Completely silent cinematic visual splash animation (zero audio)
    const tl = gsap.timeline({
      onComplete: () => {
        if (onFinish) onFinish();
      }
    });

    tl.fromTo(
      logoRef.current,
      { scale: 0.7, opacity: 0, filter: 'blur(8px)' },
      { scale: 1.05, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
    )
      .to(logoRef.current, {
        scale: 1.8,
        opacity: 0,
        filter: 'blur(12px)',
        duration: 0.5,
        delay: 0.3,
        ease: 'power2.in'
      })
      .to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.35,
          ease: 'power1.out'
        },
        '-=0.2'
      );

    return () => tl.kill();
  }, [onFinish]);

  return (
    <div ref={containerRef} className="netflix-intro-overlay" onClick={onFinish}>
      <div ref={logoRef} className="kmoviz-intro-branding">
        <div className="splash-icon">
          <span className="splash-letter">K</span>
        </div>
        <span className="splash-text">MOVIZ</span>
        <span className="splash-pro">PRO</span>
      </div>
    </div>
  );
}

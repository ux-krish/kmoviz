import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './SoundIntro.scss';

export default function SoundIntro({ onFinish }) {
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef(null);
  const nLogoRef = useRef(null);

  // Play Netflix Ta-Dum sound with Web Audio API
  const playTaDumSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const now = ctx.currentTime;

      // Deep bass strike
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 1.2);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.5);

      // Metallic shimmer chord
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(130, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(260, now + 0.8);
      gain2.gain.setValueAtTime(0.3, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 1.7);
    } catch (e) {
      console.warn('AudioContext prevented:', e);
    }
  };

  useEffect(() => {
    playTaDumSound();

    const tl = gsap.timeline({
      onComplete: () => {
        onFinish();
      }
    });

    tl.fromTo(
      nLogoRef.current,
      { scale: 0.6, opacity: 0, filter: 'blur(10px)' },
      { scale: 1.1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }
    )
      .to(nLogoRef.current, {
        scale: 2.5,
        opacity: 0,
        filter: 'blur(15px)',
        duration: 0.7,
        ease: 'power2.in'
      })
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power1.out'
      });

    return () => tl.kill();
  }, []);

  return (
    <div ref={containerRef} className="netflix-intro-overlay" onClick={onFinish}>
      <div ref={nLogoRef} className="kmoviz-intro-branding">
        <span className="k-neon">K</span><span className="text-white">MOVIZ</span>
      </div>
      <button className="skip-intro-btn" onClick={onFinish}>
        Skip
      </button>
    </div>
  );
}

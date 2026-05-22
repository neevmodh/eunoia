/**
 * ParticleSystem — Immersive CSS particle engine for the AI Wellness Garden
 * Pure React + CSS animations — no canvas, no Three.js dependency.
 * Renders: rain, fireflies, sparkles, stars, fog, butterflies, petals, storm, aurora
 */

import React, { useMemo } from 'react';

// Seeded random for stable renders (avoids hydration flicker)
const seededRand = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

// ─── Rain ─────────────────────────────────────────────────────────────────────
const RainParticles = ({ intensity = 40 }) => {
  const drops = useMemo(() =>
    Array.from({ length: intensity }, (_, i) => ({
      id: i,
      left: `${seededRand(i * 3) * 100}%`,
      delay: `${seededRand(i * 7) * 2.5}s`,
      duration: `${0.5 + seededRand(i * 11) * 0.9}s`,
      opacity: 0.25 + seededRand(i * 13) * 0.45,
      height: `${7 + seededRand(i * 17) * 14}px`,
      width: seededRand(i * 19) > 0.7 ? '2px' : '1px',
    })), [intensity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {drops.map(d => (
        <div key={d.id} className="absolute top-0 rounded-full"
          style={{
            left: d.left, height: d.height, width: d.width,
            background: 'linear-gradient(to bottom, transparent, rgba(147,197,253,0.75))',
            opacity: d.opacity,
            animation: `rainFall ${d.duration} ${d.delay} linear infinite`,
          }} />
      ))}
    </div>
  );
};

// ─── Fireflies ────────────────────────────────────────────────────────────────
const FireflyParticles = ({ count = 20 }) => {
  const flies = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${8 + seededRand(i * 5) * 84}%`,
      top: `${15 + seededRand(i * 9) * 65}%`,
      delay: `${seededRand(i * 13) * 5}s`,
      duration: `${3 + seededRand(i * 17) * 5}s`,
      size: `${2.5 + seededRand(i * 23) * 4}px`,
      color: ['#fbbf24', '#a78bfa', '#34d399', '#f9a8d4', '#60a5fa', '#fb923c'][Math.floor(seededRand(i * 29) * 6)],
    })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {flies.map(f => (
        <div key={f.id} className="absolute rounded-full"
          style={{
            left: f.left, top: f.top, width: f.size, height: f.size,
            background: f.color,
            boxShadow: `0 0 8px 3px ${f.color}88`,
            animation: `fireflyFloat ${f.duration} ${f.delay} ease-in-out infinite`,
          }} />
      ))}
    </div>
  );
};

// ─── Sparkles ─────────────────────────────────────────────────────────────────
const SparkleParticles = ({ count = 25 }) => {
  const sparks = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${seededRand(i * 7) * 100}%`,
      top: `${seededRand(i * 11) * 100}%`,
      delay: `${seededRand(i * 13) * 3.5}s`,
      duration: `${1.2 + seededRand(i * 17) * 2.5}s`,
      fontSize: `${10 + seededRand(i * 19) * 12}px`,
      char: ['✦', '✧', '⋆', '✺', '✸', '✹'][Math.floor(seededRand(i * 23) * 6)],
      color: ['#fbbf24', '#f9a8d4', '#c4b5fd', '#86efac', '#7dd3fc'][Math.floor(seededRand(i * 29) * 5)],
    })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {sparks.map(s => (
        <div key={s.id} className="absolute select-none"
          style={{
            left: s.left, top: s.top, fontSize: s.fontSize, color: s.color,
            animation: `sparklePop ${s.duration} ${s.delay} ease-in-out infinite`,
          }}>
          {s.char}
        </div>
      ))}
    </div>
  );
};

// ─── Stars ────────────────────────────────────────────────────────────────────
const StarParticles = () => {
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${seededRand(i * 3) * 100}%`,
      top: `${seededRand(i * 7) * 75}%`,
      delay: `${seededRand(i * 11) * 5}s`,
      duration: `${1.5 + seededRand(i * 13) * 3.5}s`,
      size: `${1 + seededRand(i * 17) * 3}px`,
      bright: seededRand(i * 23) > 0.85,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full"
          style={{
            left: s.left, top: s.top, width: s.size, height: s.size,
            background: s.bright ? '#fbbf24' : 'white',
            boxShadow: s.bright ? `0 0 4px 1px #fbbf2488` : 'none',
            animation: `starTwinkle ${s.duration} ${s.delay} ease-in-out infinite`,
          }} />
      ))}
      {/* Moon */}
      <div className="absolute top-4 right-8 text-4xl select-none animate-float" style={{ animationDuration: '6s' }}>🌙</div>
    </div>
  );
};

// ─── Fog ──────────────────────────────────────────────────────────────────────
const FogParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
    {[0, 1, 2, 3].map(i => (
      <div key={i} className="absolute inset-0 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse ${60 + i * 15}% ${40 + i * 10}% at ${20 + i * 20}% ${30 + i * 15}%, rgba(255,255,255,0.12) 0%, transparent 70%)`,
          animation: `fogDrift ${9 + i * 4}s ${i * 2.5}s ease-in-out infinite`,
        }} />
    ))}
  </div>
);

// ─── Butterflies ──────────────────────────────────────────────────────────────
const ButterflyParticles = ({ count = 10 }) => {
  const butterflies = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${8 + seededRand(i * 7) * 84}%`,
      top: `${25 + seededRand(i * 11) * 55}%`,
      delay: `${seededRand(i * 13) * 6}s`,
      duration: `${4 + seededRand(i * 17) * 5}s`,
      emoji: ['🦋', '🦋', '🦋', '🌸', '✨', '🌺'][Math.floor(seededRand(i * 23) * 6)],
      size: `${13 + seededRand(i * 29) * 12}px`,
    })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {butterflies.map(b => (
        <div key={b.id} className="absolute select-none"
          style={{
            left: b.left, top: b.top, fontSize: b.size,
            animation: `butterflyFloat ${b.duration} ${b.delay} ease-in-out infinite`,
          }}>
          {b.emoji}
        </div>
      ))}
    </div>
  );
};

// ─── Falling Petals ───────────────────────────────────────────────────────────
const PetalParticles = ({ count = 18 }) => {
  const petals = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${seededRand(i * 7) * 100}%`,
      delay: `${seededRand(i * 11) * 6}s`,
      duration: `${3.5 + seededRand(i * 13) * 5}s`,
      emoji: ['🌸', '🌺', '🌼', '🍃', '🌷', '🌹'][Math.floor(seededRand(i * 17) * 6)],
      size: `${11 + seededRand(i * 23) * 10}px`,
    })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {petals.map(p => (
        <div key={p.id} className="absolute top-0 select-none"
          style={{
            left: p.left, fontSize: p.size,
            animation: `petalFall ${p.duration} ${p.delay} ease-in infinite`,
          }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

// ─── Aurora Borealis ──────────────────────────────────────────────────────────
const AuroraParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
    {[
      { color: 'rgba(167,139,250,0.25)', delay: '0s', dur: '8s', top: '10%' },
      { color: 'rgba(52,211,153,0.2)',   delay: '2s', dur: '10s', top: '20%' },
      { color: 'rgba(249,168,212,0.2)',  delay: '4s', dur: '7s',  top: '15%' },
    ].map((a, i) => (
      <div key={i} className="absolute left-0 right-0 h-24 rounded-full blur-2xl"
        style={{
          top: a.top, background: a.color,
          animation: `fogDrift ${a.dur} ${a.delay} ease-in-out infinite`,
        }} />
    ))}
    <FireflyParticles count={12} />
    <StarParticles />
  </div>
);

// ─── Storm ────────────────────────────────────────────────────────────────────
const StormParticles = () => (
  <>
    <RainParticles intensity={60} />
    <div className="absolute inset-0 pointer-events-none rounded-3xl"
      style={{ background: 'rgba(0,0,0,0.15)', animation: 'pulseSoft 3s ease-in-out infinite' }} />
  </>
);

// ─── Rainbow ──────────────────────────────────────────────────────────────────
const RainbowParticles = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-t-3xl overflow-hidden">
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.12) 14%, rgba(234,179,8,0.12) 28%, rgba(34,197,94,0.12) 42%, rgba(59,130,246,0.12) 57%, rgba(99,102,241,0.12) 71%, rgba(168,85,247,0.15) 85%, transparent 100%)',
          animation: 'pulseSoft 4s ease-in-out infinite',
        }} />
    </div>
    <SparkleParticles count={30} />
    <ButterflyParticles count={12} />
  </>
);

// ─── Golden Hour ──────────────────────────────────────────────────────────────
const GoldenParticles = () => (
  <>
    <SparkleParticles count={20} />
    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none rounded-b-3xl"
      style={{ background: 'linear-gradient(to top, rgba(251,191,36,0.2), transparent)' }} />
  </>
);

// ─── Main export ──────────────────────────────────────────────────────────────
const ParticleSystem = ({ type = 'none' }) => {
  switch (type) {
    case 'rain':     return <RainParticles />;
    case 'firefly':  return <AuroraParticles />;
    case 'sparkle':  return <><SparkleParticles /><PetalParticles /></>;
    case 'stars':    return <StarParticles />;
    case 'fog':      return <FogParticles />;
    case 'rainbow':  return <RainbowParticles />;
    case 'storm':    return <StormParticles />;
    case 'golden':   return <GoldenParticles />;
    case 'petals':   return <PetalParticles />;
    case 'butterfly':return <ButterflyParticles />;
    default:         return null;
  }
};

export default ParticleSystem;

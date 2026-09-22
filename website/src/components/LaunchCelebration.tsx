'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createDustRenderer, FLOATS_PER_PARTICLE } from './launch/dustRenderer';

// Gold dust gathers into the logo, re-forms as "WE'RE LIVE", then foil confetti
// (rendered in Blender, see scripts/launch) bursts from both sides.

interface LaunchCelebrationProps {
  onComplete: () => void;
}

const TIMELINE = {
  toLogo: 700,
  toText: 3500,
  confetti: 4700,
  caption: 5300,
  finish: 9200,
};
const FADE_OUT_MS = 800;
const REDUCED_MOTION_MS = 3200;
const RING_CIRCUMFERENCE = 2 * Math.PI * 16;

const DUST_COLORS = ['#fff4cf', '#f8d77f', '#ebb84c', '#cf9232', '#a86a1c'].map(hex =>
  [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
);
const DUST_WEIGHTS = [0.12, 0.3, 0.3, 0.18, 0.1];

const SHEET_TILE = 96;
const SHEET_FRAMES = 12;
const SHAPE_WEIGHTS = [0.45, 0.25, 0.3]; // card, square, ribbon
const MATERIAL_WEIGHTS = [0.4, 0.25, 0.2, 0.15]; // gold, champagne, bronze, pearl

const pickWeighted = (weights: number[]) => {
  let r = Math.random();
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
};
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Pixel positions (in page coordinates) where a drawn shape is bright.
function sampleShape(
  width: number,
  height: number,
  originX: number,
  originY: number,
  count: number,
  draw: (ctx: CanvasRenderingContext2D) => void
) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  draw(ctx);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const candidates: number[] = [];
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (data[(y * canvas.width + x) * 4] > 140) candidates.push(x, y);
    }
  }

  const xs = new Float32Array(count);
  const ys = new Float32Array(count);
  const available = candidates.length / 2;
  for (let i = 0; i < count; i++) {
    const pick = available ? Math.floor(Math.random() * available) * 2 : 0;
    xs[i] = originX + (candidates[pick] ?? width / 2) + Math.random() - 0.5;
    ys[i] = originY + (candidates[pick + 1] ?? height / 2) + Math.random() - 0.5;
  }
  return { xs, ys };
}

interface Confetti {
  x: number; y: number; vx: number; vy: number;
  rotation: number; spin: number;
  tumble: number; tumbleSpeed: number;
  row: number; size: number;
  swayPhase: number; swayAmp: number;
}

export default function LaunchCelebration({ onComplete }: LaunchCelebrationProps) {
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [flash, setFlash] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [captionTop, setCaptionTop] = useState<number | null>(null);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setLeaving(true);
    window.setTimeout(onComplete, FADE_OUT_MS);
  }, [onComplete]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [finish]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      setShowCaption(true);
      const timer = window.setTimeout(finish, REDUCED_MOTION_MS);
      return () => window.clearTimeout(timer);
    }

    const dustCanvas = dustCanvasRef.current;
    const confettiCanvas = confettiCanvasRef.current;
    if (!dustCanvas || !confettiCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = createDustRenderer(dustCanvas, dpr);
    if (!renderer) {
      setReducedMotion(true);
      setShowCaption(true);
      const timer = window.setTimeout(finish, REDUCED_MOTION_MS);
      return () => window.clearTimeout(timer);
    }
    const confettiCtx = confettiCanvas.getContext('2d')!;

    let cancelled = false;
    let raf = 0;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    let width = window.innerWidth;
    let height = window.innerHeight;
    const small = width < 640;

    const resizeCanvases = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.resize(width, height);
      confettiCanvas.width = Math.round(width * dpr);
      confettiCanvas.height = Math.round(height * dpr);
      confettiCanvas.style.width = `${width}px`;
      confettiCanvas.style.height = `${height}px`;
      confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvases();

    const count = Math.round(Math.min(6500, Math.max(small ? 3200 : 2400, (width * height) / 210)));
    const vertexData = new Float32Array(count * FLOATS_PER_PARTICLE);

    // Particle state, struct-of-arrays for speed
    const x = new Float32Array(count), y = new Float32Array(count);
    const vx = new Float32Array(count), vy = new Float32Array(count);
    const fromX = new Float32Array(count), fromY = new Float32Array(count);
    const ctrlX = new Float32Array(count), ctrlY = new Float32Array(count);
    const toX = new Float32Array(count), toY = new Float32Array(count);
    const start = new Float32Array(count).fill(Infinity);
    const duration = new Float32Array(count);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const sprite = new Uint8Array(count);

    for (let i = 0; i < count; i++) {
      x[i] = Math.random() * width;
      y[i] = Math.random() * height;
      vx[i] = rand(-12, 12);
      vy[i] = rand(-10, 6);
      size[i] = rand(small ? 0.9 : 1.1, small ? 1.9 : 2.3);
      phase[i] = Math.random() * Math.PI * 2;
      sprite[i] = pickWeighted(DUST_WEIGHTS);
    }

    // Send every particle towards a new target along a curved, swimming path.
    const swimTo = (targets: { xs: Float32Array; ys: Float32Array }, now: number, sweep: boolean) => {
      const order = Array.from({ length: count }, (_, i) => i);
      const targetOrder = Array.from({ length: count }, (_, i) => i);
      if (sweep) {
        // Pair particles and targets left-to-right so the words write themselves in
        order.sort((a, b) => x[a] - x[b]);
        targetOrder.sort((a, b) => targets.xs[a] - targets.xs[b]);
      }
      let minX = Infinity;
      let maxX = -Infinity;
      for (let i = 0; i < count; i++) {
        minX = Math.min(minX, targets.xs[i]);
        maxX = Math.max(maxX, targets.xs[i]);
      }
      const spanX = Math.max(1, maxX - minX);
      for (let k = 0; k < count; k++) {
        const i = order[k];
        const t = targetOrder[k];
        fromX[i] = x[i];
        fromY[i] = y[i];
        toX[i] = targets.xs[t];
        toY[i] = targets.ys[t];
        const dx = toX[i] - fromX[i];
        const dy = toY[i] - fromY[i];
        const swirl = rand(-0.55, 0.55);
        ctrlX[i] = fromX[i] + dx * 0.5 - dy * swirl + rand(-40, 40);
        ctrlY[i] = fromY[i] + dy * 0.5 + dx * swirl + rand(-40, 40);
        const delay = sweep ? ((toX[i] - minX) / spanX) * 650 + rand(0, 220) : rand(0, 750);
        start[i] = now + delay;
        duration[i] = rand(1150, 1750);
      }
    };

    let sheet: HTMLImageElement | null = null;
    const sheetImage = new Image();
    sheetImage.onload = () => { sheet = sheetImage; };
    sheetImage.src = '/launch/confetti-sprites.webp';

    const confetti: Confetti[] = [];
    const confettiScale = small ? 0.78 : 1;
    const spawnConfetti = (fromLeft: boolean | null) => {
      const shape = pickWeighted(SHAPE_WEIGHTS);
      const material = pickWeighted(MATERIAL_WEIGHTS);
      const isRibbon = shape === 2;
      const base = (isRibbon ? rand(58, 92) : rand(30, 50)) * confettiScale;
      let px: number, py: number, pvx: number, pvy: number;
      if (fromLeft === null) {
        px = rand(-20, width + 20);
        py = rand(-160, -20);
        pvx = rand(-60, 60);
        pvy = rand(60, 220);
      } else {
        const angle = (fromLeft ? -1 : 1) * rand(12, 58) * (Math.PI / 180);
        const speed = rand(1000, 2000) * Math.min(1.25, Math.max(0.75, height / 850));
        px = fromLeft ? rand(-30, 20) : width + rand(-20, 30);
        py = height + rand(0, 40);
        pvx = (fromLeft ? 1 : -1) * Math.abs(Math.sin(angle)) * speed;
        pvy = -Math.cos(angle) * speed;
      }
      confetti.push({
        x: px, y: py, vx: pvx, vy: pvy,
        rotation: rand(0, Math.PI * 2), spin: rand(-6, 6),
        tumble: rand(0, SHEET_FRAMES), tumbleSpeed: rand(9, 22) * (Math.random() < 0.5 ? -1 : 1),
        row: shape * 4 + material, size: base,
        swayPhase: rand(0, Math.PI * 2), swayAmp: rand(20, 70),
      });
    };

    const burst = () => {
      const perSide = small ? 70 : 130;
      for (let i = 0; i < perSide; i++) {
        spawnConfetti(true);
        spawnConfetti(false);
      }
      later(650, () => {
        for (let i = 0; i < (small ? 60 : 110); i++) spawnConfetti(null);
      });
      later(1500, () => {
        for (let i = 0; i < (small ? 30 : 60); i++) spawnConfetti(i % 2 === 0);
      });
    };

    let begin = 0;
    let last = 0;

    const frame = (now: number) => {
      if (cancelled) return;
      const elapsed = now - begin;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;

      const fadeIn = Math.min(1, elapsed / 700);
      for (let i = 0; i < count; i++) {
        let settled = false;
        if (elapsed < start[i]) {
          // Free-floating dust
          x[i] += vx[i] * dt + Math.sin(now * 0.0007 + phase[i]) * 0.25;
          y[i] += vy[i] * dt + Math.cos(now * 0.0009 + phase[i]) * 0.2;
          if (x[i] < -20) x[i] = width + 20; else if (x[i] > width + 20) x[i] = -20;
          if (y[i] < -20) y[i] = height + 20; else if (y[i] > height + 20) y[i] = -20;
        } else {
          const t = Math.min(1, (elapsed - start[i]) / duration[i]);
          const e = easeInOutCubic(t);
          const u = 1 - e;
          x[i] = u * u * fromX[i] + 2 * u * e * ctrlX[i] + e * e * toX[i];
          y[i] = u * u * fromY[i] + 2 * u * e * ctrlY[i] + e * e * toY[i];
          if (t >= 1) {
            settled = true;
            x[i] = toX[i] + Math.sin(now * 0.0021 + phase[i]) * 0.45;
            y[i] = toY[i] + Math.cos(now * 0.0017 + phase[i]) * 0.45;
          }
        }
        const twinkle = 0.72 + 0.28 * Math.sin(now * 0.005 + phase[i] * 3);
        const spark = settled && Math.sin(now * 0.0013 + phase[i] * 7) > 0.985 ? 2.2 : 1;
        const o = i * FLOATS_PER_PARTICLE;
        const color = DUST_COLORS[sprite[i]];
        vertexData[o] = x[i];
        vertexData[o + 1] = y[i];
        vertexData[o + 2] = size[i] * (settled ? 1.7 : 3.2) * (spark > 1 ? 2.4 : 1);
        vertexData[o + 3] = Math.min(1, fadeIn * twinkle * (settled ? 1 : 0.6) * spark);
        vertexData[o + 4] = color[0];
        vertexData[o + 5] = color[1];
        vertexData[o + 6] = color[2];
      }
      renderer.render(vertexData, count, 0.3);

      // Foil confetti
      confettiCtx.clearRect(0, 0, width, height);
      if (sheet) {
        for (let i = confetti.length - 1; i >= 0; i--) {
          const piece = confetti[i];
          const drag = piece.row >= 8 ? 1.9 : 1.35;
          piece.vx -= piece.vx * drag * dt;
          piece.vy += 980 * dt - piece.vy * drag * dt * (piece.vy > 0 ? 1.4 : 0.35);
          piece.x += (piece.vx + Math.sin(now * 0.003 + piece.swayPhase) * piece.swayAmp) * dt;
          piece.y += piece.vy * dt;
          piece.rotation += piece.spin * dt;
          piece.tumble += piece.tumbleSpeed * dt;
          if (piece.y > height + 120) {
            confetti.splice(i, 1);
            continue;
          }
          const column = ((Math.floor(piece.tumble) % SHEET_FRAMES) + SHEET_FRAMES) % SHEET_FRAMES;
          confettiCtx.save();
          confettiCtx.translate(piece.x, piece.y);
          confettiCtx.rotate(piece.rotation);
          confettiCtx.drawImage(
            sheet,
            column * SHEET_TILE, piece.row * SHEET_TILE, SHEET_TILE, SHEET_TILE,
            -piece.size / 2, -piece.size / 2, piece.size, piece.size
          );
          confettiCtx.restore();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const layout = () => {
      const logoWidth = Math.min(width * (small ? 0.86 : 0.7), 780);
      const logoHeight = logoWidth * (312 / 900);
      const centerY = height * 0.44;
      return { logoWidth, logoHeight, centerY };
    };

    const buildLogoTargets = (mask: HTMLImageElement) => {
      const { logoWidth, logoHeight, centerY } = layout();
      return sampleShape(logoWidth, logoHeight, (width - logoWidth) / 2, centerY - logoHeight / 2, count, ctx => {
        ctx.drawImage(mask, 0, 0, logoWidth, logoHeight);
      });
    };

    const buildTextTargets = () => {
      const { centerY } = layout();
      const lines = small ? ['WE’RE', 'LIVE'] : ['WE’RE LIVE'];
      const boxWidth = Math.min(width * (small ? 0.8 : 0.72), 860);
      const probe = document.createElement('canvas').getContext('2d')!;
      probe.font = '700 100px Andika, Georgia, serif';
      const widest = Math.max(...lines.map(line => probe.measureText(line).width));
      const fontSize = Math.min((boxWidth / widest) * 100, height * (small ? 0.16 : 0.22));
      const lineHeight = fontSize * 1.02;
      const boxHeight = lineHeight * lines.length + fontSize * 0.2;
      setCaptionTop(centerY + boxHeight / 2 + Math.max(20, fontSize * 0.3));
      return sampleShape(boxWidth, boxHeight, (width - boxWidth) / 2, centerY - boxHeight / 2, count, ctx => {
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${fontSize}px Andika, Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        lines.forEach((line, index) => ctx.fillText(line, boxWidth / 2, fontSize * 0.08 + index * lineHeight));
      });
    };

    const loadMask = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = '/launch/logo-mask.png';
    });
    const fontsReady = Promise.race([
      document.fonts ? document.fonts.load('700 100px Andika').then(() => undefined) : Promise.resolve(),
      new Promise<void>(resolve => setTimeout(resolve, 1200)),
    ]);

    Promise.all([loadMask, fontsReady])
      .then(([mask]) => {
        if (cancelled) return;
        begin = performance.now();
        last = begin;
        raf = requestAnimationFrame(frame);

        later(TIMELINE.toLogo, () => swimTo(buildLogoTargets(mask), performance.now() - begin, false));
        later(TIMELINE.toText, () => swimTo(buildTextTargets(), performance.now() - begin, true));
        later(TIMELINE.confetti, () => {
          setFlash(true);
          burst();
        });
        later(TIMELINE.caption, () => setShowCaption(true));
        later(TIMELINE.finish, finish);
      })
      .catch(() => finish());

    const onResize = () => resizeCanvases();
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [finish]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Iroto Realty is live"
      className={`intro-overlay launch-stage fixed inset-0 z-[100] overflow-hidden transition-opacity ease-out ${leaving ? 'opacity-0' : 'opacity-100'}`}
      style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
      onClick={() => showCaption && finish()}
    >
      <div className="absolute inset-0 launch-backdrop" />
      <div className={`absolute inset-0 pointer-events-none launch-flash ${flash ? 'launch-flash-on' : ''}`} />

      {reducedMotion ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="launch-gold-text text-5xl sm:text-7xl font-bold tracking-wide">We&rsquo;re live</p>
        </div>
      ) : (
        <>
          <canvas ref={dustCanvasRef} className="absolute inset-0" aria-hidden="true" />
          <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
        </>
      )}

      <p className="sr-only" aria-live="polite">Iroto Realty is now live.</p>

      <div
        className={`absolute inset-x-0 flex flex-col items-center gap-5 px-6 text-center transition-all duration-700 ease-out ${
          showCaption ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ top: reducedMotion || captionTop === null ? '62%' : captionTop }}
      >
        <p className="whitespace-nowrap text-[10px] sm:text-sm uppercase tracking-[0.28em] sm:tracking-[0.45em] text-[#f3dca0]/80">
          Luxury coastal living &middot; now online
        </p>
        {/* Countdown ring: fills while the site opens */}
        <div className="flex items-center gap-3" role="status">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90" aria-hidden="true">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(233, 196, 106, 0.18)" strokeWidth="2.5" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#e9c46a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE}
              className={showCaption ? 'launch-ring-fill' : undefined}
              style={{ animationDuration: `${reducedMotion ? REDUCED_MOTION_MS : TIMELINE.finish - TIMELINE.caption}ms` }}
            />
          </svg>
          <span className="text-xs sm:text-sm tracking-wide text-[#f3dca0]/75">Entering the site&hellip;</span>
        </div>
      </div>

      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          finish();
        }}
        className="absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#f3dca0]/60 transition-colors hover:text-[#f3dca0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e9c46a]"
      >
        Skip
      </button>

      <style jsx>{`
        .launch-backdrop {
          background-color: #0b0603;
          background-image: radial-gradient(ellipse at 50% 42%, #3d2408 0%, #1d1005 45%, #0b0603 100%);
        }
        .launch-ring-fill {
          animation-name: launch-ring-fill;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes launch-ring-fill {
          to { stroke-dashoffset: 0; }
        }
        .launch-flash {
          background: radial-gradient(circle at 50% 44%, rgba(255, 226, 150, 0.55) 0%, rgba(255, 200, 90, 0.18) 25%, transparent 60%);
          opacity: 0;
        }
        .launch-flash-on {
          animation: launch-flash 1.4s ease-out forwards;
        }
        @keyframes launch-flash {
          0% { opacity: 0; transform: scale(0.6); }
          18% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.35); }
        }
        .launch-gold-text {
          background: linear-gradient(180deg, #fff3c4 0%, #f2c14e 45%, #b87a24 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
}

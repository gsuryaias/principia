import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function WaveInterference() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const dragRef = useRef(null);

  const [wavelength, setWavelength] = useState(35);
  const [damping, setDamping] = useState(0.15);
  const [paused, setPaused] = useState(false);
  const [sources, setSources] = useState([
    { x: 0.3, y: 0.5 },
    { x: 0.7, y: 0.5 },
  ]);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const k = (2 * Math.PI) / wavelength;
    const omega = 0.08;
    const t = timeRef.current;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        let val = 0;
        for (const src of sources) {
          const sx = src.x * w;
          const sy = src.y * h;
          const r = Math.sqrt((px - sx) ** 2 + (py - sy) ** 2);
          const attenuation = 1 / Math.max(1, Math.pow(r, damping));
          val += Math.sin(k * r - omega * t) * attenuation;
        }

        const maxVal = 2;
        const normalized = Math.max(-1, Math.min(1, val / maxVal));
        const absV = Math.abs(normalized);
        const idx = (py * w + px) * 4;

        if (normalized >= 0) {
          data[idx] = Math.floor(20 * absV);
          data[idx + 1] = Math.floor(80 * absV);
          data[idx + 2] = Math.floor(200 + 55 * absV);
        } else {
          data[idx] = Math.floor(200 + 55 * absV);
          data[idx + 1] = Math.floor(50 * absV);
          data[idx + 2] = Math.floor(30 * absV);
        }
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const drawScale = w / canvas.width;
    for (const src of sources) {
      ctx.beginPath();
      ctx.arc(src.x * w, src.y * h, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(src.x * w, src.y * h, 7, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [sources, wavelength, damping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const scale = 0.4;
      canvas.width = Math.floor(rect.width * scale);
      canvas.height = Math.floor(rect.height * scale);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loop = () => {
      if (!paused) {
        timeRef.current += 1;
      }
      renderFrame();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [paused, renderFrame]);

  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      const pos = getCanvasPos(e);
      const threshold = 0.04;
      for (let i = 0; i < sources.length; i++) {
        const dx = pos.x - sources[i].x;
        const dy = pos.y - sources[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          dragRef.current = i;
          e.target.setPointerCapture(e.pointerId);
          return;
        }
      }
    },
    [sources, getCanvasPos]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (dragRef.current === null) return;
      const pos = getCanvasPos(e);
      setSources((prev) => {
        const next = [...prev];
        next[dragRef.current] = {
          x: Math.max(0, Math.min(1, pos.x)),
          y: Math.max(0, Math.min(1, pos.y)),
        };
        return next;
      });
    },
    [getCanvasPos]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 'calc(100vh - 3.5rem)',
      background: '#09090b',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    canvasWrap: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      cursor: dragRef.current !== null ? 'grabbing' : 'default',
    },
    canvas: {
      display: 'block',
      imageRendering: 'auto',
    },
    controls: {
      padding: '16px 24px',
      background: 'rgba(24,24,27,0.95)',
      borderTop: '1px solid rgba(63,63,70,0.5)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '24px',
      alignItems: 'center',
      backdropFilter: 'blur(12px)',
    },
    controlGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    label: {
      fontSize: '13px',
      color: '#a1a1aa',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    },
    slider: {
      width: '120px',
      accentColor: '#6366f1',
      cursor: 'pointer',
    },
    value: {
      fontSize: '13px',
      color: '#71717a',
      fontFamily: 'monospace',
      minWidth: '36px',
    },
    button: {
      padding: '6px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(63,63,70,0.8)',
      background: paused ? '#6366f1' : 'rgba(39,39,42,0.8)',
      color: paused ? '#fff' : '#a1a1aa',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    hint: {
      fontSize: '12px',
      color: '#52525b',
      marginLeft: 'auto',
    },
  };

  return (
    <div style={styles.container}>
      <div
        ref={containerRef}
        style={styles.canvasWrap}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>

      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <span style={styles.label}>Wavelength</span>
          <input
            type="range"
            min="10"
            max="80"
            value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.value}>{wavelength}</span>
        </div>

        <div style={styles.controlGroup}>
          <span style={styles.label}>Damping</span>
          <input
            type="range"
            min="0"
            max="50"
            value={damping * 100}
            onChange={(e) => setDamping(Number(e.target.value) / 100)}
            style={styles.slider}
          />
          <span style={styles.value}>{damping.toFixed(2)}</span>
        </div>

        <button style={styles.button} onClick={() => setPaused((p) => !p)}>
          {paused ? '▶ Play' : '⏸ Pause'}
        </button>

        <span style={styles.hint}>Drag the white dots to move wave sources</span>
      </div>
    </div>
  );
}

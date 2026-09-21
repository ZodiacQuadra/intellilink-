import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SecurityKeyMatrixProps {
  style?: React.CSSProperties;
}

const STAGE_HEIGHT = 360;
const FOV = 40;
const CAMERA_Z = 6.2;
const KEY_HEIGHT = 3.6; // world units: the key fills ~80% of the stage height
const KEY_SRC = '/assets/u9bTOPLvp26Qvtp49kVrXhzKog.png';

// The source art is a 16:9 frame with a dotted key in its middle third. Rather than resampling the whole frame
// onto a coarse grid (which aliases and shrinks the key to a few faint dots), find every dot in the image exactly:
// threshold it, flood-fill each connected bright blob, and use the blob centroids.
function extractDots(img: HTMLImageElement): { x: number; y: number }[] {
  const W = 2000;
  const H = Math.round((img.naturalHeight / img.naturalWidth) * W);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;

  const on = new Uint8Array(W * H);
  for (let i = 0, p = 0; i < on.length; i++, p += 4) {
    if (data[p + 3] > 30 && (data[p] + data[p + 1] + data[p + 2]) / 3 > 45) on[i] = 1;
  }

  const dots: { x: number; y: number }[] = [];
  const stack: number[] = [];
  for (let start = 0; start < on.length; start++) {
    if (on[start] !== 1) continue;
    let sx = 0;
    let sy = 0;
    let n = 0;
    stack.push(start);
    on[start] = 2;
    while (stack.length) {
      const idx = stack.pop()!;
      const x = idx % W;
      const y = (idx - x) / W;
      sx += x;
      sy += y;
      n++;
      if (x > 0 && on[idx - 1] === 1) { on[idx - 1] = 2; stack.push(idx - 1); }
      if (x < W - 1 && on[idx + 1] === 1) { on[idx + 1] = 2; stack.push(idx + 1); }
      if (y > 0 && on[idx - W] === 1) { on[idx - W] = 2; stack.push(idx - W); }
      if (y < H - 1 && on[idx + W] === 1) { on[idx + W] = 2; stack.push(idx + W); }
    }
    if (n >= 30) dots.push({ x: sx / n, y: sy / n }); // ignore specks
  }
  return dots;
}

export const SecurityKeyMatrix: React.FC<SecurityKeyMatrixProps> = ({ style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect WebGL capability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = Math.min(container.clientWidth || 580, 580);
    const height = STAGE_HEIGHT;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);
    camera.position.z = CAMERA_Z;

    // Visible world size at z = 0, used to map the pointer into the scene.
    const visibleH = 2 * CAMERA_Z * Math.tan((FOV * Math.PI) / 360);
    const visibleW = () => visibleH * camera.aspect;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    let particlesMesh: THREE.Points | null = null;
    let particlePositions: Float32Array;
    let basePositions: Float32Array;
    let particleColors: Float32Array;
    let baseColors: Float32Array;
    let particleCount = 0;

    const buildParticles = (dots: { x: number; y: number }[]) => {
      if (!dots.length) return;

      // Centre the key and scale it so its height is KEY_HEIGHT world units.
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      dots.forEach((d) => {
        minX = Math.min(minX, d.x); maxX = Math.max(maxX, d.x);
        minY = Math.min(minY, d.y); maxY = Math.max(maxY, d.y);
      });
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const scale = KEY_HEIGHT / Math.max(1, maxY - minY);

      const pos: number[] = [];
      const col: number[] = [];
      dots.forEach((d) => {
        pos.push((d.x - cx) * scale, -(d.y - cy) * scale, 0);
        // A little variation, from deep electric blue to luminous cyan, so the key shimmers instead of reading flat.
        const t = Math.random();
        col.push(0.02 + t * 0.12, 0.42 + t * 0.32, 1.0);
      });

      particleCount = dots.length;
      particlePositions = new Float32Array(pos);
      basePositions = new Float32Array(pos);
      particleColors = new Float32Array(col);
      baseColors = new Float32Array(col);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      // A solid round dot with a thin soft edge (the source art is solid discs, not glows).
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const pCtx = pCanvas.getContext('2d')!;
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.72, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);

      const material = new THREE.PointsMaterial({
        size: 0.21, // three scales this by drawing-buffer height, so ~6px on a 360px stage (dot pitch is ~9px)
        vertexColors: true,
        map: new THREE.CanvasTexture(pCanvas),
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });

      particlesMesh = new THREE.Points(geometry, material);
      scene.add(particlesMesh);
      renderer.render(scene, camera);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => buildParticles(extractDots(img));
    img.onerror = () => setWebglSupported(false);
    img.src = KEY_SRC;

    // Pointer tracking, mapped into world units.
    let mouseX = 9999;
    let mouseY = 9999;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * visibleW();
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * visibleH;
      } else {
        mouseX = 9999;
        mouseY = 9999;
      }
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Only animate while on screen.
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let animationFrameId: number;
    const clock = new THREE.Clock();
    const RADIUS = 0.95;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible || !particlesMesh || !particlePositions || !basePositions) return;

      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const bx = basePositions[i3];
          const by = basePositions[i3 + 1];

          // Gentle ambient wave.
          const wave = Math.sin(elapsed * 1.5 + bx * 1.8 + by * 1.2) * 0.035;

          // Dots near the pointer are pushed away and light up.
          const dx = bx - mouseX;
          const dy = by - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let rx = 0;
          let ry = 0;
          let rz = 0;
          let glow = 0;
          if (dist < RADIUS) {
            const k = 1 - dist / RADIUS;
            const force = k * k * 0.5;
            rx = (dx / (dist || 1)) * force;
            ry = (dy / (dist || 1)) * force;
            rz = force * 0.9;
            glow = k;
          }

          particlePositions[i3] = bx + rx;
          particlePositions[i3 + 1] = by + wave + ry;
          particlePositions[i3 + 2] = rz;

          particleColors[i3] = Math.min(1, baseColors[i3] + glow * 0.75);
          particleColors[i3 + 1] = Math.min(1, baseColors[i3 + 1] + glow * 0.55);
          particleColors[i3 + 2] = 1;
        }

        particlesMesh.geometry.attributes.position.needsUpdate = true;
        particlesMesh.geometry.attributes.color.needsUpdate = true;
        particlesMesh.rotation.y = Math.sin(elapsed * 0.4) * 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = Math.min(container.clientWidth || 580, 580);
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (particlesMesh) {
        particlesMesh.geometry.dispose();
        (particlesMesh.material as THREE.PointsMaterial).map?.dispose();
        (particlesMesh.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: 580,
        height: STAGE_HEIGHT,
        margin: '0 auto',
        position: 'relative',
        ...style,
      }}
    >
      {!webglSupported && (
        <img
          src={KEY_SRC}
          alt="Security Key"
          style={{
            maxWidth: 580,
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
    </div>
  );
};

export default SecurityKeyMatrix;

/*
 * scenes-webgl.tsx — WebGL 3D scenes using Three.js imperatively.
 *
 * WHY IMPERATIVE (not @remotion/three / @react-three/fiber):
 *   @react-three/fiber v8 requires React 18; this project uses React 19.
 *   Using Three.js directly with delayRender/continueRender avoids the conflict.
 *
 * PATTERN:
 *   1. delayRender() blocks Remotion from capturing the frame screenshot.
 *   2. useEffect fires after React commits the <canvas> to the DOM.
 *   3. Three.js renders the 3D scene imperatively.
 *   4. continueRender() signals Remotion: frame ready, capture now.
 *
 * CAMERA MATH (9:16, fov=50°, z=5.5):
 *   vertical FOV = 50° → visible half-height = 5.5 * tan(25°) = 2.565 world units
 *   aspect = 1080/1920 = 0.5625 → visible half-width = 2.565 * 0.5625 = 1.44 units
 *   Frame = 2.88w × 5.13h in world space.
 *   Sphere radius 1.2 → diameter 2.4 → fills ~47% height, ~83% width. Good hero size.
 *
 * LIGHTING RECIPE for premium metallic look (no envMap):
 *   - Ambient VERY low (0.05) so shadows are deep — contrast sells the 3D.
 *   - DirectionalLight (strong, from top-right-front) → clear specular highlight.
 *   - PointLight accent color (from front-left) → colored glow on sphere surface.
 *   - HemisphereLight (sky=accent, ground=dark) → color bleed.
 *
 * hero3d: metallic sphere + two orbital rings + accent lighting.
 *   Best used for: hook/payoff beats; upgrade over CSS orb with real reflections.
 */
import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import * as THREE from 'three';
import {useTheme} from './theme';

// ThreeOrb — premium WebGL metallic sphere with two orbital rings.
// Sphere center is at y=0 (frame center). Radius 1.2 → ~47% of frame height.
// text place:"bottom" (default) leaves the top clear for the sphere to dominate.
export const ThreeOrb: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const {accent, mode} = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // delayRender blocks capture until continueRender() — called once per mount.
  // In offline video render, each frame = fresh mount → fires fresh every frame.
  const [handle] = useState(() => delayRender('three-orb'));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) { continueRender(handle); return; }

    const t = frame / fps; // deterministic time in seconds
    const accentColor = new THREE.Color(accent);
    const dark = mode === 'dark';

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1); // deterministic: no DPR scaling
    renderer.setClearColor(0x000000, 0); // transparent → CSS bg shows through
    renderer.shadowMap.enabled = false; // off for performance (no geo-cast shadows needed)

    // --- Scene + Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);
    camera.lookAt(0, 0, 0);

    // --- LIGHTING: low ambient + dramatic directional + colored accent ---
    // Very dark ambient so shadows are real (contrast = depth)
    scene.add(new THREE.AmbientLight(dark ? 0x050510 : 0x0a0820, dark ? 0.3 : 0.05));

    // Sky/ground gradient for natural color bleed
    const hemi = new THREE.HemisphereLight(
      dark ? accentColor : new THREE.Color(accent).multiplyScalar(0.7),
      dark ? 0x040408 : 0x000000,
      dark ? 0.6 : 0.4,
    );
    scene.add(hemi);

    // Key light: bright, top-right-front. Creates the dominant specular highlight.
    const key = new THREE.DirectionalLight(dark ? 0xffffff : 0xd8e0ff, dark ? 3 : 5);
    key.position.set(3, 5, 4);
    scene.add(key);

    // Accent fill: colored point light from front-left — gives sphere the brand color.
    const fill = new THREE.PointLight(accentColor, dark ? 3 : 4, 30);
    fill.position.set(-3, 1, 4);
    scene.add(fill);

    // Rim: back-below, separates sphere silhouette from bg
    const rim = new THREE.PointLight(dark ? 0x8090ff : 0x4040a0, dark ? 1.5 : 1.2, 25);
    rim.position.set(-1, -4, -3);
    scene.add(rim);

    // --- HERO SPHERE: IcosahedronGeometry detail=4 = smooth geodesic ---
    // Silver-tinted material picks up all the colored lights beautifully.
    const sphereGeo = new THREE.IcosahedronGeometry(1.2, 4);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: dark ? accentColor : new THREE.Color('#d8d8f0'), // dark=accent, light=silver-cool
      metalness: 0.88,
      roughness: 0.1,
      emissive: accentColor,
      emissiveIntensity: dark ? 0.2 : 0.08,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    const pulse = 1 + Math.sin(t * 2.2) * 0.022; // gentle breathing pulse
    sphere.rotation.x = t * 0.31;
    sphere.rotation.y = t * 0.52;
    sphere.scale.setScalar(pulse);
    scene.add(sphere);

    // --- RING 1: tilt π*4/9 (~80°) so it shows as a clear ellipse from front camera.
    //   Slowly orbits on Z. Accent colored, emissive for glow.
    const r1Geo = new THREE.TorusGeometry(2.0, 0.038, 16, 100);
    const r1Mat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.7,
      roughness: 0.15,
      emissive: accentColor,
      emissiveIntensity: dark ? 0.6 : 0.28,
    });
    const ring1 = new THREE.Mesh(r1Geo, r1Mat);
    // Starting tilt: 80° from flat (nearly vertical) + slow Z orbit
    ring1.rotation.x = Math.PI * 4 / 9 + t * 0.09;
    ring1.rotation.z = t * 0.14;
    scene.add(ring1);

    // --- RING 2: different tilt + counter orbit. Neutral/muted for depth.
    const r2Geo = new THREE.TorusGeometry(2.55, 0.02, 12, 100);
    const r2Mat = new THREE.MeshStandardMaterial({
      color: dark ? new THREE.Color('#a0a8c8') : new THREE.Color('#6060a0'),
      metalness: 0.55,
      roughness: 0.28,
      emissive: accentColor,
      emissiveIntensity: dark ? 0.1 : 0.04,
    });
    const ring2 = new THREE.Mesh(r2Geo, r2Mat);
    // Tilt: ~50° (π/6 + extra) rotated on both X and Z for cross-plane depth
    ring2.rotation.x = Math.PI / 6 + t * 0.07;
    ring2.rotation.z = Math.PI / 3 - t * 0.18;
    scene.add(ring2);

    // --- Render ---
    renderer.render(scene, camera);
    continueRender(handle);

    return () => {
      sphereGeo.dispose(); sphereMat.dispose();
      r1Geo.dispose(); r1Mat.dispose();
      r2Geo.dispose(); r2Mat.dispose();
      renderer.dispose();
    };
  }, []); // empty deps: closure captures `frame` at mount time (each frame = fresh mount)

  return (
    <AbsoluteFill>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      />
    </AbsoluteFill>
  );
};

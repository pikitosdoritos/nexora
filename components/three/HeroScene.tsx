"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { tokens } from "@/lib/tokens";

/**
 * The signature scene: a node network that morphs, as the user scrolls,
 * from a spherical "universe" (stage 0) into a linear chain of blocks
 * (stage ~0.55) and finally into a market-chart waveform (stage ~1).
 * `progressRef` is mutated by a ScrollTrigger outside the canvas so the
 * morph never triggers React re-renders.
 */

export interface SceneDriver {
  progress: number;
  pointerX: number;
  pointerY: number;
  active: boolean;
}

interface NetworkData {
  cloud: Float32Array;
  chain: Float32Array;
  wave: Float32Array;
  edges: Uint16Array;
}

function buildNetwork(count: number, seed = 7): NetworkData {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const cloud = new Float32Array(count * 3);
  const chain = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Cloud: shell-biased sphere
    const r = 4.2 + rand() * 3.4;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    cloud[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    cloud[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    cloud[i * 3 + 2] = r * Math.cos(phi);

    // Chain: nodes cluster into cubic "blocks" along the x axis
    const block = i % 9;
    const bx = (block - 4) * 2.6;
    chain[i * 3] = bx + (rand() - 0.5) * 1.1;
    chain[i * 3 + 1] = (rand() - 0.5) * 1.1;
    chain[i * 3 + 2] = (rand() - 0.5) * 1.1;

    // Wave: a candlestick-like market line
    const t = i / count;
    const x = (t - 0.5) * 17;
    const base = Math.sin(t * 9.4) * 1.1 + Math.sin(t * 23.7) * 0.5 + t * 2.2 - 1;
    wave[i * 3] = x;
    wave[i * 3 + 1] = base + (rand() - 0.5) * 0.5;
    wave[i * 3 + 2] = (rand() - 0.5) * 0.8;
  }

  // Edges: connect each node to 2 nearby neighbours (cheap O(n * k))
  const edgeList: number[] = [];
  for (let i = 0; i < count; i++) {
    for (let k = 1; k <= 2; k++) {
      const j = (i + k * 7) % count;
      edgeList.push(i, j);
    }
  }
  return { cloud, chain, wave, edges: new Uint16Array(edgeList) };
}

/** Blends the three formations according to scroll progress. */
function blend(out: Float32Array, d: NetworkData, p: number, time: number) {
  // 0 → .45 cloud, .45 → .75 chain, .75 → 1 wave
  let a: Float32Array;
  let b: Float32Array;
  let t: number;
  if (p < 0.45) {
    a = d.cloud;
    b = d.chain;
    t = THREE.MathUtils.smoothstep(p, 0.28, 0.45);
  } else if (p < 0.75) {
    a = d.chain;
    b = d.wave;
    t = THREE.MathUtils.smoothstep(p, 0.6, 0.75);
  } else {
    a = d.wave;
    b = d.wave;
    t = 1;
  }
  const breathe = 1 + Math.sin(time * 0.4) * 0.012;
  for (let i = 0; i < out.length; i += 3) {
    out[i] = (a[i] + (b[i] - a[i]) * t) * breathe;
    out[i + 1] = (a[i + 1] + (b[i + 1] - a[i + 1]) * t) * breathe;
    out[i + 2] = (a[i + 2] + (b[i + 2] - a[i + 2]) * t) * breathe;
  }
}

function Network({ driver, count }: { driver: MutableRefObject<SceneDriver>; count: number }) {
  const data = useMemo(() => buildNetwork(count), [count]);
  const group = useRef<THREE.Group>(null);
  const pointsGeo = useRef<THREE.BufferGeometry>(null);
  const linesGeo = useRef<THREE.BufferGeometry>(null);
  const positions = useMemo(() => data.cloud.slice(), [data]);

  useFrame(({ clock }) => {
    const d = driver.current;
    if (!d.active) return;
    const time = clock.elapsedTime;

    blend(positions, data, d.progress, time);
    if (pointsGeo.current) {
      pointsGeo.current.attributes.position.needsUpdate = true;
    }
    if (linesGeo.current) {
      linesGeo.current.attributes.position.needsUpdate = true;
    }
    if (group.current) {
      const spin = d.progress < 0.4 ? time * 0.05 : time * 0.05 * (1 - THREE.MathUtils.smoothstep(d.progress, 0.4, 0.55));
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, spin + d.pointerX * 0.22, 0.06);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, d.pointerY * 0.14, 0.06);
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry ref={pointsGeo}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          color={tokens.colors.cyan}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments>
        <bufferGeometry ref={linesGeo}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="index" args={[data.edges, 1]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={tokens.colors.violet}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

const PULSES = 26;

/** Data packets travelling between random node pairs. */
function Pulses({ driver, count }: { driver: MutableRefObject<SceneDriver>; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const routes = useMemo(() => {
    const data = buildNetwork(count);
    return Array.from({ length: PULSES }, (_, i) => {
      const a = (i * 13) % count;
      const b = (i * 29 + 7) % count;
      return {
        from: new THREE.Vector3(data.cloud[a * 3], data.cloud[a * 3 + 1], data.cloud[a * 3 + 2]),
        to: new THREE.Vector3(data.cloud[b * 3], data.cloud[b * 3 + 1], data.cloud[b * 3 + 2]),
        speed: 0.25 + (i % 5) * 0.09,
        offset: i / PULSES,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    const d = driver.current;
    if (!mesh.current || !d.active) return;
    const fade = 1 - THREE.MathUtils.smoothstep(d.progress, 0.3, 0.5);
    const t = clock.elapsedTime;
    routes.forEach((r, i) => {
      const p = (t * r.speed + r.offset) % 1;
      dummy.position.lerpVectors(r.from, r.to, p);
      const s = fade * (0.05 + Math.sin(p * Math.PI) * 0.05);
      dummy.scale.setScalar(Math.max(0.0001, s));
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, PULSES]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={tokens.colors.cyan} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

/** The crystalline core at the center of the universe. */
function Core({ driver }: { driver: MutableRefObject<SceneDriver> }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const d = driver.current;
    if (!d.active) return;
    const t = clock.elapsedTime;
    const fade = 1 - THREE.MathUtils.smoothstep(d.progress, 0.25, 0.5);
    if (outer.current) {
      outer.current.rotation.y = t * 0.22;
      outer.current.rotation.z = t * 0.1;
      outer.current.scale.setScalar(Math.max(0.0001, fade * (1 + Math.sin(t * 1.4) * 0.03)));
    }
    if (inner.current) {
      inner.current.rotation.y = -t * 0.35;
      inner.current.scale.setScalar(Math.max(0.0001, fade * 0.6));
    }
    if (light.current) {
      light.current.intensity = fade * (14 + Math.sin(t * 2.2) * 4);
    }
  });

  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshStandardMaterial
          color="#0b1226"
          emissive={tokens.colors.violet}
          emissiveIntensity={0.35}
          metalness={0.9}
          roughness={0.15}
          transparent
          opacity={0.55}
          wireframe
        />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#101a3a"
          emissive={tokens.colors.cyan}
          emissiveIntensity={0.9}
          metalness={1}
          roughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      <pointLight ref={light} color={tokens.colors.cyan} intensity={14} distance={16} decay={2} />
    </group>
  );
}

function CameraRig({ driver }: { driver: MutableRefObject<SceneDriver> }) {
  const { camera } = useThree();
  useFrame(() => {
    const d = driver.current;
    if (!d.active) return;
    const p = d.progress;
    // Fly from the wide universe into the structure, then pull side-on for the chart
    const z = THREE.MathUtils.lerp(15, 8.5, THREE.MathUtils.smoothstep(p, 0, 0.45));
    const z2 = THREE.MathUtils.lerp(z, 11.5, THREE.MathUtils.smoothstep(p, 0.6, 0.95));
    const y = THREE.MathUtils.lerp(0.4, 0, THREE.MathUtils.smoothstep(p, 0, 0.5));
    camera.position.lerp(new THREE.Vector3(d.pointerX * 0.6, y + d.pointerY * 0.4, z2), 0.08);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({
  driver,
  quality,
}: {
  driver: MutableRefObject<SceneDriver>;
  quality: "full" | "lite" | "static";
}) {
  const count = quality === "full" ? 380 : 180;

  return (
    <Canvas
      dpr={quality === "full" ? [1, 1.75] : 1}
      frameloop={quality === "static" ? "demand" : "always"}
      camera={{ position: [0, 0.4, 15], fov: 50 }}
      gl={{ antialias: quality === "full", powerPreference: "high-performance", alpha: true }}
      aria-hidden
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 4]} intensity={0.5} color={tokens.colors.violet} />
      <fog attach="fog" args={["#05060e", 12, 30]} />
      <Network driver={driver} count={count} />
      {quality !== "static" && <Pulses driver={driver} count={count} />}
      <Core driver={driver} />
      <CameraRig driver={driver} />
    </Canvas>
  );
}

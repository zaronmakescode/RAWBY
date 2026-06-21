// ============================================================
// Vintage typewriter, hand-built procedurally. Black crinkle body,
// platen roller carriage with paper, tiered rows of round keys, a
// fan of type-bars, return lever + brass accents. PBR + scene env.
// ============================================================
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedGeo } from "../RoundedGeo";
import { REDUCED } from "../reduced";

const BODY = "#17191c";
const BRASS = "#caa14a";
const KEY = "#e9e4d6";
const PAPER = "#f1ede1";

function Body({ metalness = 0.45, roughness = 0.5, color = BODY }: { metalness?: number; roughness?: number; color?: string }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} envMapIntensity={1.0} />;
}

export function Typewriter() {
  const carriage = useRef<THREE.Group>(null);

  // 3 tiered rows of keys.
  const keys = useMemo(() => {
    const arr: [number, number, number][] = [];
    const rows = [11, 10, 9];
    rows.forEach((cols, r) => {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * 0.21 + r * 0.05;
        const z = 0.62 - r * 0.26;
        const y = -0.16 + r * 0.13;
        arr.push([x, y, z]);
      }
    });
    return arr;
  }, []);

  // Fan of type-bars rising toward the platen.
  const bars = useMemo(
    () => Array.from({ length: 13 }, (_, i) => (i / 12 - 0.5) * 1.5),
    []
  );

  useFrame((state) => {
    if (REDUCED || !carriage.current) return;
    const phase = (state.clock.elapsedTime * 0.55) % 2;
    // Carriage steps left while "typing", then snaps back with a ding.
    carriage.current.position.x = phase < 1.8 ? -phase * 0.22 : -(2 - phase) * 1.98;
  });

  return (
    <group rotation={[0.28, -0.5, 0]} position={[0, -0.15, 0]} scale={0.92}>
      {/* Main body */}
      <mesh>
        <RoundedGeo args={[2.5, 0.7, 1.7]} radius={0.14} />
        <Body />
      </mesh>
      {/* Raised back housing for the type mechanism */}
      <mesh position={[0, 0.5, -0.45]}>
        <RoundedGeo args={[2.1, 0.7, 0.7]} radius={0.12} />
        <Body />
      </mesh>
      {/* Front keyboard apron (sloped) */}
      <mesh position={[0, 0.05, 0.66]} rotation={[-0.5, 0, 0]}>
        <RoundedGeo args={[2.4, 0.6, 0.5]} radius={0.08} />
        <Body color="#1d1f23" />
      </mesh>

      {/* Brass brand plate */}
      <mesh position={[0, 0.16, 0.96]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.16, 0.02]} />
        <meshStandardMaterial color={BRASS} metalness={0.95} roughness={0.22} envMapIntensity={1.3} />
      </mesh>

      {/* Type-bar fan */}
      {bars.map((x, i) => (
        <mesh key={i} position={[x, 0.34, 0.05]} rotation={[-0.9, 0, x * 0.25]}>
          <boxGeometry args={[0.025, 0.6, 0.02]} />
          <Body color="#2a2c30" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Keys */}
      {keys.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[-0.5, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.085, 0.085, 0.05, 20]} />
            <Body color="#101215" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 20]} />
            <meshStandardMaterial color={KEY} metalness={0.05} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* Carriage (platen + paper + knobs + return lever) — drifts as it types */}
      <group ref={carriage} position={[0, 0.62, -0.3]}>
        {/* side frames */}
        {[-1.05, 1.05].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.08, 0.4, 0.5]} />
            <Body color="#202327" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* platen roller */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 2.0, 36]} />
          <Body color="#2c2e32" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* end knobs */}
        {[-1.08, 1.08].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.17, 0.17, 0.12, 28]} />
            <meshStandardMaterial color={BRASS} metalness={0.95} roughness={0.25} envMapIntensity={1.2} />
          </mesh>
        ))}
        {/* paper rising behind the platen */}
        <mesh position={[0, 0.45, -0.12]} rotation={[-0.18, 0, 0]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshStandardMaterial color={PAPER} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
        </mesh>
        {/* carriage return lever */}
        <mesh position={[-1.3, 0.12, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 12]} />
          <Body color="#202327" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-1.45, 0.32, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.3} envMapIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}

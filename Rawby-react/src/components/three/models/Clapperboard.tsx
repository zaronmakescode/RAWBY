// ============================================================
// Film clapperboard / slate. A solid dark slate with info rows and
// a hinged striped clapper stick on top that snaps open + shut.
// ============================================================
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedGeo } from "../RoundedGeo";
import { REDUCED } from "../reduced";

const SLATE = "#1b1e23";
const BRASS = "#caa14a";
const STRIPE_W = "#ECECE6";
const STRIPE_K = "#14161a";

function Slate({ metalness = 0.3, roughness = 0.5 }: { metalness?: number; roughness?: number }) {
  return <meshStandardMaterial color={SLATE} metalness={metalness} roughness={roughness} envMapIntensity={1.1} />;
}

export function Clapperboard() {
  const clap = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (REDUCED || !clap.current) return;
    const t = state.clock.elapsedTime % 3;
    // Mostly shut; opens then claps closed every ~3s.
    clap.current.rotation.z = t < 0.55 ? t * 0.85 : Math.max(0, 0.47 - (t - 0.55) * 4.5);
  });

  return (
    <group rotation={[0.12, -0.4, 0]} scale={0.92}>
      {/* Slate board */}
      <mesh position={[0, -0.4, 0]}>
        <RoundedGeo args={[2.4, 1.7, 0.16]} radius={0.06} />
        <Slate />
      </mesh>

      {/* Info rows (brass dividers + light "writing" blocks) */}
      {[0.05, -0.4, -0.85].map((y, i) => (
        <mesh key={`l${i}`} position={[0, y, 0.09]}>
          <boxGeometry args={[2.06, 0.03, 0.01]} />
          <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.32} envMapIntensity={1.1} />
        </mesh>
      ))}
      {[
        [-0.6, 0.27],
        [0.5, 0.27],
        [-0.4, -0.18],
        [0.3, -0.62],
      ].map(([x, y], i) => (
        <mesh key={`w${i}`} position={[x, y, 0.09]}>
          <boxGeometry args={[0.7, 0.07, 0.01]} />
          <meshStandardMaterial color="#cdd2d8" metalness={0.1} roughness={0.7} />
        </mesh>
      ))}

      {/* Hinged clapper stick (pivots from the left) */}
      <group ref={clap} position={[-1.2, 0.62, 0]}>
        <group position={[1.2, 0, 0]}>
          {/* stick body */}
          <mesh>
            <RoundedGeo args={[2.4, 0.34, 0.16]} radius={0.05} />
            <Slate roughness={0.55} />
          </mesh>
          {/* alternating black/white stripes (geometry, stands proud) */}
          {Array.from({ length: 11 }).map((_, i) => (
            <mesh key={i} position={[-1.05 + i * 0.21, 0, 0.12]}>
              <boxGeometry args={[0.21, 0.34, 0.08]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? STRIPE_W : STRIPE_K}
                roughness={0.5}
                metalness={0.05}
                emissive={i % 2 === 0 ? STRIPE_W : "#000000"}
                emissiveIntensity={i % 2 === 0 ? 0.25 : 0}
                envMapIntensity={0.6}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Brass hinge pin on the left */}
      <mesh position={[-1.2, 0.46, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.34, 20]} />
        <meshStandardMaterial color={BRASS} metalness={0.95} roughness={0.2} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}

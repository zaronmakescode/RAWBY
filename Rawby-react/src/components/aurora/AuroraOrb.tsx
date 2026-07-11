// Aurora's living form — a morphing wireframe orb (react-three-fiber).
// Breathes slowly at idle; when `thinking` is true it morphs and spins
// faster and glows warmer, so the orb doubles as her "typing" indicator.
// Colour follows the active accent (incl. custom); respects reduced-motion.
import { useRef, useMemo, useEffect, Suspense, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "../../store/theme";
import { useSettings } from "../../store/settings";

function parseRgbVar(cssVar: string): THREE.Vector3 {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length >= 3 && parts.every(Number.isFinite)) {
    return new THREE.Vector3(parts[0] / 255, parts[1] / 255, parts[2] / 255);
  }
  return new THREE.Vector3(0.9, 0.58, 0.12); // amber fallback
}

// Vertex — Ashima simplex-3D noise displaces the sphere along its normals.
// `uActivity` (0 idle → 1 thinking) drives both displacement speed + amount.
const vert = /* glsl */ `
varying vec3 vNormal;
uniform float uTime;
uniform float uActivity;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
        i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  float speed = mix(0.3, 1.5, uActivity);
  float amp   = mix(0.09, 0.24, uActivity);
  float n = snoise(position * 2.1 + uTime * speed);
  vec3 displaced = position + normal * n * amp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

// Fragment — rim-lit fresnel glow, deep accent core → bright accent edge.
const frag = /* glsl */ `
varying vec3 vNormal;
uniform vec3 uColor;
uniform vec3 uColorDeep;

void main() {
  vec3 normal = normalize(vNormal);
  float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
  vec3 col = mix(uColorDeep * 0.75, uColor, fresnel);
  col += uColor * fresnel * 0.55;
  gl_FragColor = vec4(col, 1.0);
}
`;

function Orb({ thinking, detail }: { thinking: boolean; detail: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const accent = useTheme((s) => s.accent);
  const customColor = useTheme((s) => s.customColor);
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActivity: { value: thinking ? 1 : 0 },
      uColor: { value: parseRgbVar("--c-500") },
      uColorDeep: { value: parseRgbVar("--c-700") },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uColor.value = parseRgbVar("--c-500");
    m.uniforms.uColorDeep.value = parseRgbVar("--c-700");
  }, [accent, customColor]);

  useFrame((_, delta) => {
    const m = matRef.current;
    if (!m) return;
    const target = thinking ? 1 : 0;
    m.uniforms.uActivity.value += (target - m.uniforms.uActivity.value) * Math.min(1, delta * 2.5);
    if (reduced.current || reduceMotion) return;
    m.uniforms.uTime.value += delta;
    if (meshRef.current) {
      const a = m.uniforms.uActivity.value;
      meshRef.current.rotation.y += delta * (0.05 + a * 0.3);
      meshRef.current.rotation.x += delta * (0.015 + a * 0.09);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.3, detail]} />
      <shaderMaterial ref={matRef} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} wireframe />
    </mesh>
  );
}

class GlBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  componentDidCatch() {
    this.setState({ failed: true });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function AuroraOrb({
  thinking = false,
  compact = false,
  className = "",
}: {
  /** Speeds up the morph + spin + glow — use while she's generating a reply. */
  thinking?: boolean;
  /** Lower-poly geometry for small renders (chat-bubble size). */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <GlBoundary>
        <Canvas
          camera={{ position: [0, 0, 3.3], fov: 42 }}
          dpr={[1, compact ? 1.5 : 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        >
          <Suspense fallback={null}>
            <Orb thinking={thinking} detail={compact ? 2 : 4} />
          </Suspense>
        </Canvas>
      </GlBoundary>
    </div>
  );
}

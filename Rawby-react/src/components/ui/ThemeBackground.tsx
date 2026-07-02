// Per-theme cinematic backdrop — custom WebGL shader per accent, with an
// optional real-video mode (Settings → "Cinematic video background").
//   0 amber  → molten-gold flow
//   1 green  → forest depth / light shafts
//   2 azure  → ocean wave + caustics
//   3 rose   → upward ember drift
// A custom accent uses the flow scene tinted by the generated palette.
// Falls back to the .aurora-layer gradient if WebGL is unavailable.
import { useRef, useEffect, useMemo, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme, nearestPresetAccent, type Accent } from "../../store/theme";
import { useSettings } from "../../store/settings";

// ─── Accent → shader mode ────────────────────────────────────────────────────
const ACCENT_MODE: Record<string, number> = {
  amber: 0,
  green: 1,
  azure: 2,
  rose:  3,
  custom: 0, // generic flow, tinted by the generated palette
};

function parseRgbVar(cssVar: string): THREE.Vector3 {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length >= 3 && parts.every(Number.isFinite)) {
    return new THREE.Vector3(parts[0] / 255, parts[1] / 255, parts[2] / 255);
  }
  return new THREE.Vector3(0.9, 0.58, 0.12); // amber fallback
}

// ─── Vertex shader — bypasses MVP; plane vertices are already in clip space ──
const vert = /* glsl */ `
attribute vec3 position;
varying   vec2 vUv;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
  vUv         = position.xy * 0.5 + 0.5;
}
`;

// ─── Fragment — four cinematic modes ─────────────────────────────────────────
const frag = /* glsl */ `
precision highp float;

varying vec2  vUv;
uniform float uTime;
uniform vec3  uColor;     /* accent --c-500 / 255 */
uniform vec3  uColorDeep; /* accent --c-700 / 255 */
uniform float uMode;

/* ── Noise helpers ── */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p  = p * 2.01 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

/* ── Mode 0: molten-gold flow (amber / custom) — same fbm domain-warp
   family as the other scenes so every accent feels consistent. ── */
vec3 modeAmber(vec2 uv) {
  vec2  d = vec2(uTime * 0.021, -uTime * 0.013);
  vec2  q = vec2(fbm(uv * 2.1 + d), fbm(uv * 2.1 + vec2(4.7, 2.3) - d));
  float n = fbm(uv * 2.4 + q * 0.75);

  /* slow diagonal silk bands drifting through the flow */
  float silk = fbm(vec2(uv.x * 1.4 + uv.y * 0.8 + uTime * 0.016,
                        uv.y * 2.2 - uTime * 0.008));

  float v = clamp(n * 0.68 + silk * 0.32, 0.0, 1.0);

  vec3 col = mix(vec3(0.03, 0.02, 0.008), uColorDeep * 0.58, v * 1.9);
  col      = mix(col, uColor,               clamp(v * 2.7 - 0.55, 0.0, 1.0));
  col      = mix(col, vec3(1.0, 0.95, 0.78), clamp(v * 4.6 - 3.4,  0.0, 1.0));
  return col;
}

/* ── Mode 1: forest depth (green) ── */
vec3 modeGreen(vec2 uv) {
  vec2  d = vec2(uTime * 0.017, uTime * 0.029);
  vec2  q = vec2(fbm(uv * 2.2 + d), fbm(uv * 2.2 + vec2(5.2,1.3) + d));
  float n = fbm(uv * 2.6 + q * 0.65);

  /* vertical light shafts */
  float shaft = pow(fbm(vec2(uv.x * 1.9, uv.y * 0.44 + uTime * 0.014)), 2.0);
  shaft      *= (1.0 - uv.y * 0.44);

  float v     = clamp(n * 0.72 + shaft * 0.28, 0.0, 1.0);

  vec3 col    = mix(vec3(0.01, 0.04, 0.01), uColorDeep * 0.62, v * 1.9);
  col         = mix(col, uColor,             clamp(v * 2.65 - 0.5, 0.0, 1.0));
  col         = mix(col, vec3(0.82,1.0,0.72), clamp(v * 4.3 - 3.1,  0.0, 1.0));
  return col;
}

/* ── Mode 2: ocean flow (azure) ── */
vec3 modeAzure(vec2 uv) {
  float w1 = fbm(vec2(uv.x * 3.2 + uTime * 0.062, uv.y * 1.7));
  float w2 = fbm(vec2(uv.x * 2.4 - uTime * 0.043, uv.y * 2.8 + 1.3));

  /* caustic shimmer */
  vec2  cUv    = uv + vec2(
    sin(uv.y * 9.5 + uTime * 0.10) * 0.021,
    cos(uv.x * 7.2 + uTime * 0.07) * 0.012
  );
  float caustic = pow(fbm(cUv * 5.9 + uTime * 0.053), 2.9) * 0.48;

  float v       = clamp(w1 * 0.52 + w2 * 0.32 + caustic * 0.16, 0.0, 1.0);

  vec3 col      = mix(vec3(0.0, 0.02, 0.09), uColorDeep * 0.52, v * 2.1);
  col           = mix(col, uColor,              clamp(v * 2.9 - 0.5,  0.0, 1.0));
  col           = mix(col, vec3(0.72,0.94,1.0), clamp(v * 4.8 - 3.2,  0.0, 1.0));
  return col;
}

/* ── Mode 3: ember drift (rose/red) ── */
vec3 modeRose(vec2 uv) {
  vec2  eUv = uv * vec2(2.6, 3.2);
  eUv.y    -= uTime * 0.10;   /* drift upward */

  float n1   = fbm(eUv);
  float n2   = fbm(eUv * 1.55 + vec2(3.1, 1.9));

  /* hot cells: bright where n1 high AND n2 low */
  float ember = clamp(pow(n1, 1.28) * (1.0 - n2) * 2.65, 0.0, 1.0);
  float heat  = fbm(uv * 1.9 + uTime * 0.011) * 0.30;

  float v     = clamp(ember * 0.76 + heat * 0.24, 0.0, 1.0);

  vec3 col    = mix(vec3(0.05, 0.01, 0.0),  uColorDeep * 0.74, v * 1.9);
  col         = mix(col, uColor,             clamp(v * 2.6 - 0.3,  0.0, 1.0));
  col         = mix(col, vec3(1.0,0.88,0.33), clamp(v * 4.9 - 3.3,  0.0, 1.0));
  return col;
}

void main() {
  vec3 col;
  if      (uMode < 0.5) col = modeAmber(vUv);
  else if (uMode < 1.5) col = modeGreen(vUv);
  else if (uMode < 2.5) col = modeAzure(vUv);
  else                  col = modeRose(vUv);

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── Inner scene (runs inside Canvas context) ────────────────────────────────
function ShaderScene() {
  const matRef  = useRef<THREE.RawShaderMaterial | null>(null);
  const accent  = useTheme((s) => s.accent);
  const customColor = useTheme((s) => s.customColor);
  const bgSpeed = useSettings((s) => s.bgSpeed);
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Build uniforms once; we mutate `.value` in-place (Three.js pattern)
  const uniforms = useMemo(
    () => ({
      uTime:      { value: 0 },
      uColor:     { value: parseRgbVar("--c-500") },
      uColorDeep: { value: parseRgbVar("--c-700") },
      uMode:      { value: ACCENT_MODE[accent] ?? 0 },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Accent / custom colour change → update shader colour + mode
  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uMode.value      = ACCENT_MODE[accent] ?? 0;
    m.uniforms.uColor.value     = parseRgbVar("--c-500");
    m.uniforms.uColorDeep.value = parseRgbVar("--c-700");
  }, [accent, customColor]);

  // Advance time (multiplier kept low = slow / cinematic feel)
  useFrame((_, delta) => {
    if (!matRef.current || reduced.current || reduceMotion) return;
    matRef.current.uniforms.uTime.value += delta * 0.055 * bgSpeed;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      {/* rawShaderMaterial = no Three.js glsl preamble injected */}
      <rawShaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Error boundary — catches WebGL init failure ──────────────────────────────
class GlBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  componentDidCatch() {
    this.props.onError();
    this.setState({ failed: true });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Which clip a given accent plays (custom picks the nearest preset's clip).
function videoAccent(accent: Accent, customColor: string): string {
  return accent === "custom" ? nearestPresetAccent(customColor) : accent;
}

// ─── Public component — fixed full-screen backdrop ────────────────────────────
export function ThemeBackground() {
  const [glError, setGlError] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const accent = useTheme((s) => s.accent);
  const customColor = useTheme((s) => s.customColor);
  const bgVideo = useSettings((s) => s.bgVideo);
  const bgDim = useSettings((s) => s.bgDim);

  // Re-try the video when the toggle flips back on (file may have been added).
  useEffect(() => {
    if (bgVideo) setVideoFailed(false);
  }, [bgVideo]);

  const useVideo = bgVideo && !videoFailed;
  const videoSrc = `/bg/${videoAccent(accent, customColor)}.mp4`;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "rgb(var(--bg))" }}
      aria-hidden="true"
    >
      {/* Fallback aurora gradient — shows through if WebGL unavailable */}
      <div className="aurora-layer" />

      {useVideo ? (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        !glError && (
          <GlBoundary onError={() => setGlError(true)}>
            <Canvas
              orthographic
              dpr={[1, 1.5]}
              gl={{ antialias: false, powerPreference: "low-power" }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              <ShaderScene />
            </Canvas>
          </GlBoundary>
        )
      )}

      {/* Veil — dims the backdrop to keep glass + text readable (user-tunable) */}
      <div
        className="absolute inset-0"
        style={{ background: `rgb(var(--bg) / ${bgDim})` }}
      />
      {/* Soft accent wash at top + edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 45% at 50% -12%, rgb(var(--c-500) / 0.12), transparent 60%), " +
            "radial-gradient(135% 110% at 50% 34%, transparent 42%, rgb(var(--bg) / 0.82) 100%)",
        }}
      />
    </div>
  );
}

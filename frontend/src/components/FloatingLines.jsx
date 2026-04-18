import React, { useEffect, useRef } from "react";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

const vertexShader = `
precision highp float;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

mat2 rotate(float r) {
    return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 getLineColor(float t) {
    if (lineGradientCount <= 0) return vec3(1.0);
    vec3 gradientColor;
    if (lineGradientCount == 1) {
        gradientColor = lineGradient[0];
    } else {
        float clampedT = clamp(t, 0.0, 0.9999);
        float scaled = clampedT * float(lineGradientCount - 1);
        int idx = int(floor(scaled));
        float f = fract(scaled);
        int idx2 = min(idx + 1, lineGradientCount - 1);
        gradientColor = mix(lineGradient[idx], lineGradient[idx2], f);
    }
    // Balanced for the older dark version
    return gradientColor * 0.7; 
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
    float time = iTime * animationSpeed;
    float x_offset   = offset;
    float x_movement = time * 0.12; 
    float amp         = sin(offset + time * 0.2) * 0.3;
    float y           = sin(uv.x + x_offset + x_movement) * amp;

    if (shouldBend) {
        vec2 d = screenUv - mouseUv;
        float influence = exp(-dot(d, d) * bendRadius);
        float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
        y += bendOffset;
    }
    float m = uv.y - y;
    return 0.012 / max(abs(m) + 0.008, 0.001);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    baseUv.y *= -1.0;
    if (parallax) baseUv += parallaxOffset;

    vec3 col = vec3(0.0);
    vec2 mouseUv = vec2(0.0);
    if (interactive) {
        mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
        mouseUv.y *= -1.0;
    }
    
    if (enableBottom) {
        for (int i = 0; i < 20; ++i) {
            if(i >= bottomLineCount) break;
            float fi = float(i);
            float t = fi / max(float(bottomLineCount - 1), 1.0);
            float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
            vec2 ruv = baseUv * rotate(angle);
            col += getLineColor(t) * wave(ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y), 1.5 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.6;
        }
    }

    if (enableMiddle) {
        for (int i = 0; i < 20; ++i) {
            if(i >= middleLineCount) break;
            float fi = float(i);
            float t = fi / max(float(middleLineCount - 1), 1.0);
            float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
            vec2 ruv = baseUv * rotate(angle);
            col += getLineColor(t) * wave(ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y), 2.0 + 0.15 * fi, baseUv, mouseUv, interactive);
        }
    }

    if (enableTop) {
        for (int i = 0; i < 20; ++i) {
            if(i >= topLineCount) break;
            float fi = float(i);
            float t = fi / max(float(topLineCount - 1), 1.0);
            float angle = topWavePosition.z * log(length(baseUv) + 1.0);
            vec2 ruv = baseUv * rotate(angle);
            ruv.x *= -1.0;
            col += getLineColor(t) * wave(ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y), 1.0 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.4;
        }
    }
    
    fragColor = vec4(col, 1.0);
}

void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex) {
  let value = hex.trim().replace("#", "");
  let r = 255,
    g = 255,
    b = 255;
  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }
  return new Vector3(r / 255, g / 255, b / 255);
}

export default function FloatingLines({
  linesGradient = ["#4f46e5", "#9333ea", "#2563eb"],
  enabledWaves = ["top", "middle", "bottom"],
  lineCount = 8,
  lineDistance = 6,
  topWavePosition,
  middleWavePosition,
  bottomWavePosition,
  animationSpeed = 0.6,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.1,
}) {
  const containerRef = useRef(null);
  const targetMouseRef = useRef(new Vector2(-1000, -1000));
  const currentMouseRef = useRef(new Vector2(-1000, -1000));
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0, 0));
  const currentParallaxRef = useRef(new Vector2(0, 0));

  const getVal = (val, type) => {
    if (typeof val === "number") return val;
    const idx = enabledWaves.indexOf(type);
    return val[idx] ?? (type === "distance" ? 0.1 : 6);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;
    let startTime = performance.now(); // High-res timer fix

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: animationSpeed },
      enableTop: { value: enabledWaves.includes("top") },
      enableMiddle: { value: enabledWaves.includes("middle") },
      enableBottom: { value: enabledWaves.includes("bottom") },
      topLineCount: { value: getVal(lineCount, "top") },
      middleLineCount: { value: getVal(lineCount, "middle") },
      bottomLineCount: { value: getVal(lineCount, "bottom") },
      topLineDistance: { value: getVal(lineDistance, "top") * 0.01 },
      middleLineDistance: { value: getVal(lineDistance, "middle") * 0.01 },
      bottomLineDistance: { value: getVal(lineDistance, "bottom") * 0.01 },
      topWavePosition: {
        value: new Vector3(
          topWavePosition?.x ?? 10.0,
          topWavePosition?.y ?? 0.5,
          topWavePosition?.rotate ?? -0.4,
        ),
      },
      middleWavePosition: {
        value: new Vector3(
          middleWavePosition?.x ?? 5.0,
          middleWavePosition?.y ?? 0.0,
          middleWavePosition?.rotate ?? 0.2,
        ),
      },
      bottomWavePosition: {
        value: new Vector3(
          bottomWavePosition?.x ?? 2.0,
          bottomWavePosition?.y ?? -0.7,
          bottomWavePosition?.rotate ?? 0.4,
        ),
      },
      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: interactive },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength },
      bendInfluence: { value: 0 },
      parallax: { value: parallax },
      parallaxStrength: { value: parallaxStrength },
      parallaxOffset: { value: new Vector2(0, 0) },
      lineGradient: {
        value: Array.from(
          { length: MAX_GRADIENT_STOPS },
          () => new Vector3(1, 1, 1),
        ),
      },
      lineGradientCount: { value: 0 },
    };

    if (linesGradient?.length > 0) {
      const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
      uniforms.lineGradientCount.value = stops.length;
      stops.forEach((hex, i) => {
        const color = hexToVec3(hex);
        uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
      });
    }

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new Mesh(new PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const setSize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
        1,
      );
    };

    setSize();
    window.addEventListener("resize", setSize);

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetMouseRef.current.set(
        x * renderer.getPixelRatio(),
        (rect.height - y) * renderer.getPixelRatio(),
      );
      targetInfluenceRef.current = 1.0;
    };

    if (interactive) {
      window.addEventListener("pointermove", handlePointerMove);
    }

    let raf;
    const animate = (time) => {
      if (!active) return;
      uniforms.iTime.value = (time - startTime) * 0.001; // Smooth movement ticker

      if (interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);
        currentInfluenceRef.current +=
          (targetInfluenceRef.current - currentInfluenceRef.current) *
          mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      active = false;
      window.removeEventListener("resize", setSize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    linesGradient,
    enabledWaves,
    lineCount,
    lineDistance,
    animationSpeed,
    interactive,
    parallax,
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-normal filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-violet-400 rounded-full mix-blend-normal filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-normal filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
}

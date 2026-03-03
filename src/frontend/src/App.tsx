import { MeshDistortMaterial, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Menu, Shield, TrendingUp, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiTelegram, SiYoutube } from "react-icons/si";
import type * as THREE from "three";

// ─── Candlestick Particle Canvas ───────────────────────────────────────────
interface Candle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  bodyHeight: number;
  wickHeight: number;
  isBull: boolean;
  opacity: number;
  fadeDir: number;
}

function CandlestickCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const candlesRef = useRef<Candle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createCandle = (): Candle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      width: Math.random() * 6 + 4,
      height: Math.random() * 30 + 15,
      bodyHeight: Math.random() * 15 + 8,
      wickHeight: Math.random() * 12 + 6,
      isBull: Math.random() > 0.45,
      opacity: Math.random() * 0.5 + 0.1,
      fadeDir: Math.random() > 0.5 ? 1 : -1,
    });

    candlesRef.current = Array.from({ length: 60 }, createCandle);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      candlesRef.current.forEach((c, i) => {
        c.x += c.vx;
        c.y += c.vy;
        c.opacity += c.fadeDir * 0.002;
        if (c.opacity > 0.6) c.fadeDir = -1;
        if (c.opacity < 0.05) c.fadeDir = 1;

        if (c.y < -80) {
          candlesRef.current[i] = {
            ...createCandle(),
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
          };
          return;
        }

        const color = c.isBull
          ? `rgba(212, 175, 55, ${c.opacity})`
          : `rgba(192, 57, 43, ${c.opacity})`;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        // Wick
        ctx.beginPath();
        ctx.moveTo(c.x + c.width / 2, c.y - c.wickHeight);
        ctx.lineTo(c.x + c.width / 2, c.y + c.bodyHeight + c.wickHeight);
        ctx.stroke();

        // Body
        ctx.fillRect(c.x, c.y, c.width, c.bodyHeight);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

// ─── 3D Bull Mesh ───────────────────────────────────────────────────────────
function BullMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    t.current += delta;
    meshRef.current.position.y = Math.sin(t.current * 0.8) * 0.15;
    meshRef.current.rotation.y = Math.sin(t.current * 0.4) * 0.15;
  });

  return (
    <group ref={meshRef as React.Ref<THREE.Group>}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.7]} />
        <meshStandardMaterial
          color="#b8860b"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0.7, 0.3, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.5]} />
        <meshStandardMaterial
          color="#c9962a"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      {/* Horn L */}
      <mesh position={[0.9, 0.72, 0.15]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.06, 0.4, 6]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.05} />
      </mesh>
      {/* Horn R */}
      <mesh position={[0.9, 0.72, -0.15]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.06, 0.4, 6]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.05} />
      </mesh>
      {/* Legs */}
      {(
        [
          { id: "fl", pos: [-0.35, -0.65, 0.22] as [number, number, number] },
          { id: "fr", pos: [0.35, -0.65, 0.22] as [number, number, number] },
          { id: "bl", pos: [-0.35, -0.65, -0.22] as [number, number, number] },
          { id: "br", pos: [0.35, -0.65, -0.22] as [number, number, number] },
        ] as const
      ).map(({ id, pos }) => (
        <mesh key={id} position={pos}>
          <boxGeometry args={[0.18, 0.5, 0.18]} />
          <meshStandardMaterial
            color="#b8860b"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[-0.7, 0.1, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.04, 0.01, 0.5, 6]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.05} />
      </mesh>
    </group>
  );
}

function BullScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.3} color="#d4af37" />
      <pointLight position={[3, 3, 3]} intensity={2} color="#ffd700" />
      <pointLight position={[-2, -1, 2]} intensity={0.8} color="#ff6b00" />
      <spotLight position={[0, 5, 0]} intensity={1.5} color="#d4af37" />
      <BullMesh />
    </Canvas>
  );
}

// ─── 3D Bear Mesh ───────────────────────────────────────────────────────────
function BearMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    t.current += delta;
    // Slower breathing
    const s = 1 + Math.sin(t.current * 0.6) * 0.03;
    meshRef.current.scale.set(s, s, s);
    meshRef.current.rotation.y = Math.sin(t.current * 0.3) * 0.12;
    meshRef.current.position.y = Math.sin(t.current * 0.9 + 1) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.75]} />
        <meshStandardMaterial
          color="#6b1c14"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0.65, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.55]} />
        <meshStandardMaterial color="#7d2218" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.6, 0.72, 0.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#5a1510" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.6, 0.72, -0.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#5a1510" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Snout */}
      <mesh position={[0.97, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.22]} />
        <meshStandardMaterial color="#4a1010" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Legs */}
      {(
        [
          { id: "fl", pos: [-0.35, -0.72, 0.24] as [number, number, number] },
          { id: "fr", pos: [0.35, -0.72, 0.24] as [number, number, number] },
          { id: "bl", pos: [-0.35, -0.72, -0.24] as [number, number, number] },
          { id: "br", pos: [0.35, -0.72, -0.24] as [number, number, number] },
        ] as const
      ).map(({ id, pos }) => (
        <mesh key={id} position={pos}>
          <boxGeometry args={[0.22, 0.5, 0.2]} />
          <meshStandardMaterial
            color="#6b1c14"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      {/* Claws accent */}
      <mesh position={[0, -0.97, 0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.04, 0.15, 4]} />
        <meshStandardMaterial color="#c0392b" metalness={1} roughness={0.05} />
      </mesh>
    </group>
  );
}

function BearScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.2} color="#c0392b" />
      <pointLight position={[-3, 3, 3]} intensity={2} color="#ff4444" />
      <pointLight position={[2, -1, 2]} intensity={0.8} color="#800000" />
      <spotLight position={[0, 5, 0]} intensity={1} color="#ff2d2d" />
      <BearMesh />
    </Canvas>
  );
}

// ─── TradingView Chart Widget ───────────────────────────────────────────────
interface TradingViewWidgetProps {
  symbol: string;
  containerId: string;
}

function TradingViewWidget({ symbol, containerId }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (
        typeof (window as unknown as Record<string, unknown>).TradingView !==
        "undefined"
      ) {
        const TV = (window as unknown as Record<string, unknown>)
          .TradingView as {
          widget: new (config: Record<string, unknown>) => undefined;
        };
        new TV.widget({
          autosize: true,
          symbol,
          interval: "D",
          timezone: "Asia/Kolkata",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0b0b0f",
          enable_publishing: false,
          hide_legend: true,
          container_id: containerId,
          withdateranges: false,
          hide_side_toolbar: true,
          backgroundColor: "rgba(11,11,15,0.8)",
          gridColor: "rgba(212,175,55,0.05)",
        });
      }
    };

    container.appendChild(script);

    return () => {
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [symbol, containerId]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      style={{ width: "100%", height: "100%", minHeight: "280px" }}
    />
  );
}

// ─── Intersection Observer Hook ────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Chart Card with Tilt Effect ───────────────────────────────────────────
interface ChartCardProps {
  title: string;
  subtitle: string;
  symbol: string;
  containerId: string;
  ocid: string;
  delay: number;
}

function ChartCard({
  title,
  subtitle,
  symbol,
  containerId,
  ocid,
  delay,
}: ChartCardProps) {
  const { ref, visible } = useReveal();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        ref={cardRef}
        data-ocid={ocid}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass-panel rounded-2xl overflow-hidden tilt-card"
        style={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(192,57,43,0.1)",
          transition:
            "transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Card header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}
        >
          <div>
            <h3
              className="font-bold text-lg tracking-wide"
              style={{ color: "#f0f0f0" }}
            >
              {title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#a0a0a0" }}>
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#ff2d2d" }}
            >
              Live
            </span>
          </div>
        </div>
        {/* Chart */}
        <div style={{ height: "280px", background: "rgba(11,11,15,0.6)" }}>
          <TradingViewWidget symbol={symbol} containerId={containerId} />
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 navbar-glass transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Logo + Brand */}
        <a
          data-ocid="navbar.logo_link"
          href="#hero"
          className="flex items-center gap-3 group"
          style={{ textDecoration: "none" }}
        >
          <div className="relative">
            <img
              src="/assets/uploads/ChatGPT-Image-Feb-27-2026-05_02_34-PM-1.png"
              alt="Trade Trigger India Logo"
              className="h-10 w-10 object-contain rounded-lg"
              style={{ filter: "drop-shadow(0 0 8px rgba(212,175,55,0.4))" }}
            />
          </div>
          <div>
            <div
              className="font-black text-base leading-tight tracking-wider uppercase"
              style={{ color: "#d4af37" }}
            >
              Trade Trigger
            </div>
            <div
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: "#a0a0a0" }}
            >
              India
            </div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ["Markets", "#dashboard"],
            ["Live Stream", "#livestream"],
            ["Telegram", "#telegram"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium tracking-wide transition-colors duration-200"
              style={{ color: "#a0a0a0", textDecoration: "none" }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#d4af37";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#a0a0a0";
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            data-ocid="navbar.watch_live_button"
            href="https://www.youtube.com/@tradetriggerindia"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-red-glow px-5 py-2 rounded-lg text-sm font-bold tracking-wide flex items-center gap-2"
            style={{ textDecoration: "none" }}
          >
            <span className="live-dot" />
            Watch Live
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#d4af37" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: "rgba(11,11,15,0.98)",
              borderTop: "1px solid rgba(212,175,55,0.12)",
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {[
                ["Markets", "#dashboard"],
                ["Live Stream", "#livestream"],
                ["Telegram", "#telegram"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium py-2"
                  style={{
                    color: "#f0f0f0",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(212,175,55,0.08)",
                  }}
                >
                  {label}
                </a>
              ))}
              <a
                data-ocid="navbar.watch_live_button"
                href="https://www.youtube.com/@tradetriggerindia"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-red-glow px-5 py-3 rounded-lg text-sm font-bold text-center"
                style={{ textDecoration: "none" }}
              >
                Watch Live
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero Section ───────────────────────────────────────────────────────────
function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        paddingTop: "80px",
        background: "#0b0b0f",
      }}
    >
      {/* Animated candlestick background */}
      <CandlestickCanvas />

      {/* Banner image atmospheric overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('/assets/uploads/ChatGPT-Image-Feb-27-2026-05_00_48-PM-2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
          zIndex: 0,
        }}
      />

      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(192,57,43,0.06) 0%, transparent 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Main hero layout */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-8 w-full"
        style={{
          position: "relative",
          zIndex: 1,
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center min-h-[calc(100vh-120px)]">
          {/* Left - Bull */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:flex flex-col items-center"
            style={{ height: "380px" }}
          >
            <div style={{ width: "100%", height: "320px" }}>
              <BullScene />
            </div>
            <div
              className="text-center mt-2"
              style={{
                background:
                  "linear-gradient(135deg, #b8960c, #d4af37, #f0d060)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Bull Market
            </div>
          </motion.div>

          {/* Center - Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-center flex flex-col items-center gap-6 py-12 lg:py-0"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="float-anim"
            >
              <img
                src="/assets/uploads/ChatGPT-Image-Feb-27-2026-05_02_34-PM-1.png"
                alt="TTI Logo"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 20px rgba(212,175,55,0.6))",
                  borderRadius: "16px",
                }}
              />
            </motion.div>

            {/* Heading */}
            <div>
              <h1
                className="hero-heading gold-shimmer"
                style={{ marginBottom: "0.4rem" }}
              >
                Trade Trigger
              </h1>
              <h1
                className="hero-heading"
                style={{
                  color: "#f0f0f0",
                  textShadow: "0 0 40px rgba(212,175,55,0.2)",
                }}
              >
                India
              </h1>
            </div>

            {/* Divider */}
            <div
              style={{
                width: "120px",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, #d4af37, #c0392b, transparent)",
              }}
            />

            {/* Tagline */}
            <p
              className="text-center leading-relaxed"
              style={{
                color: "#c0c0c0",
                fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
                fontStyle: "italic",
                letterSpacing: "0.04em",
                maxWidth: "340px",
              }}
            >
              Market Moves Fast.{" "}
              <span
                style={{
                  color: "#d4af37",
                  fontStyle: "normal",
                  fontWeight: 700,
                }}
              >
                We Move Smarter.
              </span>
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              {[
                { value: "10K+", label: "Members" },
                { value: "5Y+", label: "Experience" },
                { value: "Daily", label: "Signals" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="font-black text-xl"
                    style={{ color: "#d4af37" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: "#777" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              data-ocid="hero.cta_button"
              href="https://www.youtube.com/@tradetriggerindia"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-red-glow pulse-red px-8 py-4 rounded-xl font-bold tracking-wider text-base uppercase flex items-center gap-3"
              style={{ textDecoration: "none" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <SiYoutube size={20} />
              Watch Live Analysis
            </motion.a>

            {/* Sub-CTA */}
            <a
              href="https://t.me/+cSR99I4G5P4yY2I1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-2 transition-opacity duration-200 hover:opacity-100"
              style={{ color: "#888", textDecoration: "none", opacity: 0.7 }}
            >
              <SiTelegram size={16} style={{ color: "#d4af37" }} />
              Join Telegram for Live Signals
            </a>
          </motion.div>

          {/* Right - Bear */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:flex flex-col items-center"
            style={{ height: "380px" }}
          >
            <div style={{ width: "100%", height: "320px" }}>
              <BearScene />
            </div>
            <div
              className="text-center mt-2 font-bold text-sm tracking-widest uppercase"
              style={{
                color: "#c0392b",
                textShadow: "0 0 12px rgba(192,57,43,0.5)",
              }}
            >
              Bear Market
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "linear-gradient(to bottom, transparent, #0b0b0f)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ zIndex: 2 }}
        animate={{ y: [0, 10, 0] }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 1.8,
          ease: "easeInOut",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "40px",
            border: "2px solid rgba(212,175,55,0.3)",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            paddingTop: "6px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "8px",
              background: "#d4af37",
              borderRadius: "2px",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}

// ─── Dashboard Section ───────────────────────────────────────────────────────
function DashboardSection() {
  const { ref, visible } = useReveal();

  const charts = [
    {
      title: "Nifty 50",
      subtitle: "NSE India — Large Cap Index",
      symbol: "NSE:NIFTY",
      containerId: "tradingview_nifty",
      ocid: "dashboard.nifty_card",
    },
    {
      title: "Sensex",
      subtitle: "BSE India — Benchmark Index",
      symbol: "BSE:SENSEX",
      containerId: "tradingview_sensex",
      ocid: "dashboard.sensex_card",
    },
    {
      title: "Bitcoin",
      subtitle: "BINANCE — BTC/USDT Spot",
      symbol: "BINANCE:BTCUSDT",
      containerId: "tradingview_btc",
      ocid: "dashboard.btc_card",
    },
    {
      title: "Ethereum",
      subtitle: "BINANCE — ETH/USDT Spot",
      symbol: "BINANCE:ETHUSDT",
      containerId: "tradingview_eth",
      ocid: "dashboard.eth_card",
    },
  ];

  return (
    <section
      id="dashboard"
      className="section-padding relative"
      style={{
        background: "linear-gradient(180deg, #0b0b0f 0%, #0d0d12 100%)",
      }}
    >
      {/* Section accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), rgba(192,57,43,0.3), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Title */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div
            className="text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ color: "#c0392b" }}
          >
            Real-Time Data
          </div>
          <h2 className="section-title gold-text">Live Market Dashboard</h2>
          <div className="section-title-line" />
          <p className="mt-4 text-sm" style={{ color: "#888" }}>
            Track global markets in real time with professional-grade charts
          </p>
        </motion.div>

        {/* Chart grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charts.map((chart, i) => (
            <ChartCard key={chart.containerId} {...chart} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Live Stream Section ─────────────────────────────────────────────────────
function LiveStreamSection() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="livestream"
      className="section-padding relative"
      style={{
        background: "linear-gradient(180deg, #0d0d12 0%, #0b0b0f 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(192,57,43,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div
            className="text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ color: "#c0392b" }}
          >
            <span className="live-dot mr-2" />
            Live Now
          </div>
          <h2 className="section-title" style={{ color: "#f0f0f0" }}>
            Live Market <span className="gold-text">Session</span>
          </h2>
          <div className="section-title-line" />
        </motion.div>

        {/* Stream card */}
        <motion.div
          className="glass-panel rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* YouTube embed */}
          <div
            style={{
              position: "relative",
              paddingTop: "56.25%",
              background: "#0a0a0d",
              overflow: "hidden",
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              src="https://www.youtube.com/embed?listType=user_uploads&list=tradetriggerindia&autoplay=0"
              title="Trade Trigger India Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Footer of stream card */}
          <div
            className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(212,175,55,0.12)" }}
          >
            <div>
              <div className="font-bold text-lg" style={{ color: "#f0f0f0" }}>
                Trade Trigger India
              </div>
              <div className="text-sm mt-0.5" style={{ color: "#888" }}>
                Daily market analysis, live sessions &amp; educational content
              </div>
            </div>
            <a
              data-ocid="livestream.join_button"
              href="https://www.youtube.com/@tradetriggerindia"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-red-glow pulse-red px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap"
              style={{ textDecoration: "none" }}
            >
              <SiYoutube size={18} />
              Join Live on YouTube
            </a>
          </div>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {[
            {
              icon: <Zap size={18} />,
              label: "Real-time Analysis",
              desc: "Live commentary on market moves",
            },
            {
              icon: <TrendingUp size={18} />,
              label: "Chart Patterns",
              desc: "Technical analysis breakdowns",
            },
            {
              icon: <Shield size={18} />,
              label: "Risk Management",
              desc: "Learn proper position sizing",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-panel rounded-xl p-4 flex items-start gap-3"
            >
              <div
                style={{ color: "#d4af37", marginTop: "2px", flexShrink: 0 }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  className="font-semibold text-sm"
                  style={{ color: "#f0f0f0" }}
                >
                  {item.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#777" }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Telegram Section ────────────────────────────────────────────────────────
function TelegramSection() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="telegram"
      className="section-padding relative"
      style={{ background: "#0b0b0f" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-3xl mx-auto" ref={ref}>
        <motion.div
          className="glass-panel rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          style={{
            border: "1px solid rgba(212,175,55,0.25)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.7), 0 0 60px rgba(212,175,55,0.06)",
          }}
        >
          {/* Decorative corner accents */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "80px",
              height: "80px",
              borderTop: "2px solid rgba(212,175,55,0.3)",
              borderLeft: "2px solid rgba(212,175,55,0.3)",
              borderRadius: "16px 0 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "80px",
              height: "80px",
              borderBottom: "2px solid rgba(192,57,43,0.3)",
              borderRight: "2px solid rgba(192,57,43,0.3)",
              borderRadius: "0 0 16px 0",
            }}
          />

          {/* Telegram icon */}
          <motion.div
            className="telegram-glow pulse-gold inline-block mb-6"
            animate={{ y: [0, -6, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            <SiTelegram size={72} style={{ display: "block" }} />
          </motion.div>

          {/* Heading */}
          <h2
            className="font-black text-3xl sm:text-4xl tracking-wide uppercase mb-2"
            style={{ color: "#f0f0f0" }}
          >
            Join Official <span className="gold-shimmer">Telegram</span>
          </h2>

          {/* Subtext */}
          <p
            className="mt-3 text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: "#a0a0a0" }}
          >
            Get live market updates, buy/sell signals, intraday alerts &amp;
            expert analysis — delivered directly to your phone.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 my-8">
            {[
              { value: "10K+", label: "Members" },
              { value: "Daily", label: "Signals" },
              { value: "Free", label: "Access" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="font-black text-2xl"
                  style={{
                    background: "linear-gradient(135deg, #d4af37, #f0d060)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#666" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.a
            data-ocid="telegram.join_button"
            href="https://t.me/+cSR99I4G5P4yY2I1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold-glow inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-base uppercase tracking-wide"
            style={{ textDecoration: "none" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <SiTelegram size={20} />
            Get Live Market Updates
          </motion.a>

          <p className="mt-4 text-xs" style={{ color: "#555" }}>
            Free to join · No spam · Leave anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: "#07070a",
        borderTop: "1px solid rgba(212,175,55,0.12)",
        paddingTop: "3rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Top row */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/uploads/ChatGPT-Image-Feb-27-2026-05_02_34-PM-1.png"
                alt="TTI Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 6px rgba(212,175,55,0.3))",
                  borderRadius: "8px",
                }}
              />
              <div>
                <div
                  className="font-black text-sm uppercase tracking-widest"
                  style={{ color: "#d4af37" }}
                >
                  Trade Trigger India
                </div>
                <div className="text-xs" style={{ color: "#555" }}>
                  Financial Education Platform
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#555" }}>
              Empowering traders with real-time market insights, technical
              analysis, and educational content.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "#d4af37" }}
            >
              Quick Links
            </div>
            <div className="flex flex-col gap-2">
              {[
                ["Live Analysis", "https://www.youtube.com/@tradetriggerindia"],
                ["Telegram Channel", "https://t.me/+cSR99I4G5P4yY2I1"],
                ["Market Dashboard", "#dashboard"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                  className="text-xs transition-colors duration-200"
                  style={{ color: "#666", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = "#d4af37";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color = "#666";
                  }}
                >
                  → {label}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "#d4af37" }}
            >
              Follow Us
            </div>
            <div className="flex gap-4">
              <a
                data-ocid="footer.youtube_link"
                href="https://www.youtube.com/@tradetriggerindia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#888",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,0,0,0.12)";
                  el.style.borderColor = "rgba(255,45,45,0.3)";
                  el.style.color = "#ff4444";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(255,255,255,0.08)";
                  el.style.color = "#888";
                }}
              >
                <SiYoutube size={18} />
                <span className="text-xs font-medium">YouTube</span>
              </a>
              <a
                data-ocid="footer.telegram_link"
                href="https://t.me/+cSR99I4G5P4yY2I1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#888",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(212,175,55,0.1)";
                  el.style.borderColor = "rgba(212,175,55,0.3)";
                  el.style.color = "#d4af37";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(255,255,255,0.08)";
                  el.style.color = "#888";
                }}
              >
                <SiTelegram size={18} />
                <span className="text-xs font-medium">Telegram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Risk disclaimer */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            background: "rgba(192,57,43,0.05)",
            border: "1px solid rgba(192,57,43,0.15)",
          }}
        >
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "#c0392b" }}
          >
            ⚠ Risk Disclaimer
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#666" }}>
            This website is for educational purposes only. We do not provide
            investment advice or financial recommendations. Trading in stocks,
            F&amp;O, cryptocurrency, and other financial instruments involves
            substantial risk of loss and is not suitable for every investor.
            Past performance is not indicative of future results. Always consult
            a SEBI-registered financial advisor before making investment
            decisions. Trade Trigger India is not responsible for any financial
            losses incurred.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs" style={{ color: "#444" }}>
            © {new Date().getFullYear()} Trade Trigger India. All rights
            reserved.
          </div>
          <div className="text-xs" style={{ color: "#333" }}>
            Built with <span style={{ color: "#d4af37" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#555", textDecoration: "none" }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#d4af37";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#555";
              }}
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh" }}>
      {/* Global ambient effects */}
      <div className="ambient-glow-bottom" />
      <div className="ambient-glow-top" />

      <Navbar />
      <main>
        <HeroSection />
        <DashboardSection />
        <LiveStreamSection />
        <TelegramSection />
      </main>
      <Footer />
    </div>
  );
}

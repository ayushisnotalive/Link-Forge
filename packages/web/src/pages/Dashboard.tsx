import React, { useEffect, useRef, useState } from "react";

/**
 * Forge/Link Dashboard
 * Converted 1:1 from the provided static HTML into a React (TSX) component.
 * - Three.js ambient background animation preserved via a ref + effect.
 * - CreateLinkForm, LinkCard list, toggle/delete/copy actions, and the
 *   toast notifier are reimplemented with React state instead of direct DOM manipulation.
 */

type LinkStatus = "active" | "disabled";

interface LinkItem {
  id: string;
  shortUrl: string; // e.g. "forge.dev/k9x2m"
  targetUrl: string;
  status: LinkStatus;
  clicks: number;
  p95: string; // e.g. "12ms" or "--"
  region?: string;
  createdLabel: string;
  expiryLabel: string;
}

const INITIAL_LINKS: LinkItem[] = [
  {
    id: "k9x2m",
    shortUrl: "forge.dev/k9x2m",
    targetUrl:
      "https://github.com/developer/high-concurrency-distributed-cache-engine",
    status: "active",
    clicks: 1482,
    p95: "12ms",
    region: "US-East (82%)",
    createdLabel: "created 2h ago",
    expiryLabel: "expires in 14d",
  },
  {
    id: "doc-v2",
    shortUrl: "forge.dev/doc-v2",
    targetUrl:
      "https://internal-docs.infra.corp/specifications/orchestration-v2-final.pdf",
    status: "active",
    clicks: 640,
    p95: "18ms",
    region: "EU-Central (91%)",
    createdLabel: "created 3d ago",
    expiryLabel: "expires in 11d",
  },
  {
    id: "p7q8a",
    shortUrl: "forge.dev/p7q8a",
    targetUrl:
      "https://staging-app.forge-test.internal/auth/tokens/temporary-login?auth=98214",
    status: "disabled",
    clicks: 319,
    p95: "--",
    createdLabel: "disabled yesterday",
    expiryLabel: "paused",
  },
  {
    id: "perf-bench",
    shortUrl: "forge.dev/perf-bench",
    targetUrl:
      "https://grafana.telemetry.forge-network.io/d/link-perf/latency-and-egress-metrics?orgId=1",
    status: "active",
    clicks: 3892,
    p95: "9ms",
    region: "AP-Northeast (44%)",
    createdLabel: "created 5d ago",
    expiryLabel: "expires in 14d",
  },
];

const SPARKLINE_BARS: { height: number; label: string; peak?: boolean }[] = [
  { height: 28, label: "00:00 - 180 req" },
  { height: 35, label: "02:00 - 240 req" },
  { height: 20, label: "04:00 - 140 req" },
  { height: 40, label: "06:00 - 280 req" },
  { height: 65, label: "08:00 - 450 req" },
  { height: 82, label: "10:00 - 580 req" },
  { height: 94, label: "12:00 - 640 req" },
  { height: 100, label: "14:00 - 710 req", peak: true },
  { height: 88, label: "16:00 - 610 req" },
  { height: 70, label: "18:00 - 490 req" },
  { height: 48, label: "20:00 - 330 req" },
  { height: 32, label: "22:00 - 210 req" },
];

function barOpacityClass(idx: number, peak?: boolean): string {
  if (peak) return "bg-primary";
  // Roughly mirror the original mix of dim/mid/bright bars
  if (idx === 5) return "bg-primary/40";
  if (idx === 6) return "bg-primary/70";
  if (idx === 8) return "bg-primary/80";
  if (idx === 9) return "bg-primary/50";
  return "bg-[#212B36]";
}

export default function ForgeLinkDashboard() {
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  const [urlInput, setUrlInput] = useState(
    "https://github.com/developer/high-concurrency-distributed-cache-engine"
  );
  const [toast, setToast] = useState<{ text: string; visible: boolean }>({
    text: "Action completed",
    visible: false,
  });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const threeContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = (text: string) => {
    setToast({ text, visible: true });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2400);
  };

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard?.writeText(`https://${shortUrl}`);
    showToast(`Copied ${shortUrl}`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = urlInput.trim();
    if (!val) return;

    const slug = Math.random().toString(36).substring(2, 7);
    const shortUrl = `forge.dev/${slug}`;

    const newLink: LinkItem = {
      id: slug,
      shortUrl,
      targetUrl: val,
      status: "active",
      clicks: 0,
      p95: "--",
      createdLabel: "created just now",
      expiryLabel: "expires in 14d",
    };

    setLinks((prev) => [newLink, ...prev]);
    setUrlInput("");
    showToast(`Created https://${shortUrl}`);
  };

  const handleToggle = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const nextStatus: LinkStatus = l.status === "active" ? "disabled" : "active";
        showToast(nextStatus === "disabled" ? "Link disabled" : "Link activated");
        return { ...l, status: nextStatus };
      })
    );
  };

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast("Link purged from mesh");
  };

  // Three.js ambient background animation
  useEffect(() => {
    const container = threeContainerRef.current;
    if (!container) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const THREE_SRC = "https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js";

    function init() {
      // @ts-ignore - THREE is loaded globally via script tag
      const THREE = (window as any).THREE;
      if (!THREE || !container || cancelled) return;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 24;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x48b087, 1.8);
      dirLight.position.set(10, 15, 10);
      scene.add(dirLight);

      const dirLight2 = new THREE.DirectionalLight(0x2f5d50, 1.2);
      dirLight2.position.set(-10, -10, -5);
      scene.add(dirLight2);

      const group = new THREE.Group();
      scene.add(group);

      const geometries = [
        new THREE.OctahedronGeometry(0.8, 0),
        new THREE.BoxGeometry(0.7, 0.7, 0.7),
        new THREE.TetrahedronGeometry(0.9, 0),
      ];

      const materialAccent = new THREE.MeshPhongMaterial({
        color: 0x388e6c,
        shininess: 90,
        wireframe: false,
        transparent: true,
        opacity: 0.85,
      });

      const materialDark = new THREE.MeshPhongMaterial({
        color: 0x1e293b,
        shininess: 40,
        transparent: true,
        opacity: 0.7,
      });

      const materialWire = new THREE.MeshBasicMaterial({
        color: 0x48b087,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });

      const items: {
        mesh: any;
        rotSpeedX: number;
        rotSpeedY: number;
        floatSpeed: number;
        initY: number;
        seed: number;
      }[] = [];
      const count = 38;

      for (let i = 0; i < count; i++) {
        const geom = geometries[i % geometries.length];
        const mat = i % 3 === 0 ? materialAccent : i % 3 === 1 ? materialDark : materialWire;
        const mesh = new THREE.Mesh(geom, mat);

        const radius = 6 + Math.random() * 14;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.8;

        mesh.position.x = radius * Math.cos(theta) * Math.cos(phi);
        mesh.position.y = radius * Math.sin(phi);
        mesh.position.z = radius * Math.sin(theta) * Math.cos(phi) - 2;

        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        const rotSpeedX = (Math.random() - 0.5) * 0.015;
        const rotSpeedY = (Math.random() - 0.5) * 0.015;
        const floatSpeed = 0.001 + Math.random() * 0.002;
        const initY = mesh.position.y;

        items.push({ mesh, rotSpeedX, rotSpeedY, floatSpeed, initY, seed: Math.random() * 100 });
        group.add(mesh);
      }

      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      function onMouseMove(e: MouseEvent) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }
      window.addEventListener("mousemove", onMouseMove);

      function onResize() {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      let time = 0;
      let animationFrameId: number;

      function animate() {
        animationFrameId = requestAnimationFrame(animate);
        time += 0.015;

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        group.rotation.y = time * 0.05 + targetX * 0.4;
        group.rotation.x = targetY * 0.3;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          item.mesh.rotation.x += item.rotSpeedX;
          item.mesh.rotation.y += item.rotSpeedY;
          item.mesh.position.y = item.initY + Math.sin(time + item.seed) * 0.6;
        }

        renderer.render(scene, camera);
      }
      animate();

      cleanup = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    // Load three.js if not already present
    if ((window as any).THREE) {
      init();
    } else {
      const existing = document.querySelector(
        `script[src="${THREE_SRC}"]`
      ) as HTMLScriptElement | null;
      const script = existing ?? document.createElement("script");
      if (!existing) {
        script.src = THREE_SRC;
        document.head.appendChild(script);
      }
      script.addEventListener("load", init);
      cleanup = () => script.removeEventListener("load", init);
    }

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const activeCount = links.filter((l) => l.status === "active").length;
  const disabledCount = links.filter((l) => l.status === "disabled").length;

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface antialiased relative min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient Three.js background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40">
        <div ref={threeContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-14 w-full px-space-lg max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs font-label-code-lg text-label-code-lg tracking-tight">
              <span className="text-primary font-bold">forge</span>
              <span className="text-outline-variant font-normal">/</span>
              <span className="text-on-surface-variant font-normal">link</span>
              <div className="flex items-center ml-space-xs">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#73daae]"></span>
              </div>
            </div>
            <nav className="flex items-center gap-space-xs p-1 bg-surface-container-lowest/70 border border-outline-variant/20 rounded-lg">
              <a
                href="#"
                aria-current="page"
                className="px-3 py-1 rounded transition-colors bg-surface-container text-primary border border-outline-variant/60 font-medium"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="font-label-code-sm text-label-code-sm px-3 py-1 rounded transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
              >
                Analytics
              </a>
              <a
                href="#"
                className="font-label-code-sm text-label-code-sm px-3 py-1 rounded transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
              >
                Login
              </a>
              <a
                href="#"
                className="font-label-code-sm text-label-code-sm px-3 py-1 rounded transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
              >
                Signup
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs px-2.5 py-1 rounded bg-surface-container-lowest/80 border border-outline-variant/40">
              <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                v1.4.2
              </span>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <span className="font-label-code-sm text-label-code-sm text-primary">
                operational
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full pt-14">
        <div className="w-full max-w-[1440px] mx-auto px-space-lg py-space-lg">
          <div className="flex flex-col w-full">
            <div className="max-w-xl mx-auto px-6 py-10 relative z-10 w-full">
              {/* Top System Metrics Ticker */}
              <div className="mb-6 flex items-center justify-between text-label-code-sm font-label-code-sm text-on-surface-variant bg-surface-container-low px-3.5 py-1.5 rounded border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_#73daae]"></span>
                  <span className="text-on-surface font-medium">SESSION ROUTE</span>
                  <span className="text-outline-variant">/</span>
                  <span className="text-primary font-label-code-sm">edge-node-09</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-on-surface-variant">TTL SYNC: 100%</span>
                  <span className="text-outline-variant">|</span>
                  <span className="text-secondary font-label-code-sm">4 ACTIVE LINKS</span>
                </div>
              </div>

              {/* Header area */}
              <div className="mb-8 flex items-baseline justify-between">
                <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#48B087] shadow-[0_0_8px_#48B087]"></span>
                  Your links
                </h1>
                <button className="text-sm text-white/50 hover:text-white transition-colors duration-150">
                  Log out
                </button>
              </div>

              {/* CreateLinkForm */}
              <form
                onSubmit={handleCreate}
                className="mb-8 bg-[#12171D]/90 backdrop-blur-md border border-[#212B36] p-4 rounded-xl shadow-2xl transition-all focus-within:border-[#388E6C]/60 focus-within:shadow-[0_0_20px_rgba(56,142,108,0.15)]"
              >
                <div className="flex items-center gap-3 border-b border-[#212B36] pb-3">
                  <span className="font-mono text-sm text-[#48B087]/70 select-none">forge&gt;</span>
                  <input
                    className="flex-1 bg-transparent font-mono text-sm outline-none text-white placeholder:text-white/30 truncate"
                    placeholder="paste a long url"
                    required
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="text-sm font-medium text-[#48B087] hover:text-white transition-colors px-3 py-1 rounded bg-[#388E6C]/20 border border-[#388E6C]/40 hover:bg-[#388E6C]/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>shorten</span>
                    <span className="text-label-code-sm font-label-code-sm opacity-60 text-[10px]">↵</span>
                  </button>
                </div>
                {/* Quick Options Tray */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-label-code-sm font-label-code-sm text-on-surface-variant">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                      <span className="w-3.5 h-3.5 rounded-sm bg-surface-container-low border border-outline-variant/50 group-hover:border-primary flex items-center justify-center text-primary text-[10px]">
                        ✓
                      </span>
                      <span className="group-hover:text-on-surface">Auto-expire 14d</span>
                    </label>
                    <span className="text-outline-variant">·</span>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                      <span className="w-3.5 h-3.5 rounded-sm bg-surface-container-low border border-outline-variant/50 group-hover:border-primary flex items-center justify-center text-primary text-[10px]">
                        ✓
                      </span>
                      <span className="group-hover:text-on-surface">Geo-telemetry</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-outline">
                    <span>prefix:</span>
                    <span className="text-primary/90 font-medium">forge.dev/</span>
                  </div>
                </div>
              </form>

              {/* Links Section Meta Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#212B36]/60">
                <div className="flex items-center gap-2">
                  <span className="text-label-code-sm font-label-code-sm uppercase tracking-wider text-outline font-semibold">
                    Active Endpoints
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-code-sm text-label-code-sm text-primary">
                    {activeCount} Live
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-code-sm text-label-code-sm text-outline">
                    {disabledCount} Suspended
                  </span>
                </div>
                <div className="flex items-center gap-2 text-label-code-sm font-label-code-sm text-outline">
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  <span>sort: latest</span>
                </div>
              </div>

              {/* Links List */}
              <div className="space-y-3.5">
                {links.map((link) => {
                  const isActive = link.status === "active";
                  return (
                    <div
                      key={link.id}
                      className={`group bg-[#12171D]/90 backdrop-blur-sm border border-[#212B36] hover:border-[#388E6C]/50 rounded-xl p-4 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#0B0F12] ${
                        isActive ? "" : "bg-[#12171D]/60 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Left: Shortcode and Target */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                            <span
                              className={`font-mono text-sm font-semibold transition-colors ${
                                isActive
                                  ? "text-white group-hover:text-primary"
                                  : "text-white/60 line-through group-hover:no-underline"
                              }`}
                            >
                              {link.shortUrl}
                            </span>
                            <button
                              className={`transition-colors p-0.5 ${
                                isActive ? "text-white/40 hover:text-primary" : "text-white/20 hover:text-white/60"
                              }`}
                              title="Copy shortlink"
                              onClick={() => handleCopy(link.shortUrl)}
                            >
                              <span className="material-symbols-outlined text-[15px] align-middle">
                                content_copy
                              </span>
                            </button>

                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#48B087]/15 text-[#48B087] border border-[#48B087]/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#48B087] shadow-[0_0_6px_#48B087]"></span>
                                active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-white/5 text-white/40 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                                disabled
                              </span>
                            )}

                            <span className={`text-xs font-mono ${isActive ? "text-white/40" : "text-white/30"}`}>
                              {link.expiryLabel}
                            </span>
                          </div>

                          <p
                            className={`font-mono text-xs truncate transition-colors ${
                              isActive ? "text-white/40 hover:text-white/70" : "text-white/30"
                            }`}
                            title={link.targetUrl}
                          >
                            {link.targetUrl}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#212B36]/60 justify-end">
                          {isActive ? (
                            <button
                              className="text-xs font-medium text-white/70 hover:text-white px-2.5 py-1 rounded bg-[#212B36]/40 hover:bg-[#212B36] border border-[#212B36] transition-colors"
                              onClick={() => handleToggle(link.id)}
                            >
                              disable
                            </button>
                          ) : (
                            <button
                              className="text-xs font-medium text-[#48B087] hover:text-white px-2.5 py-1 rounded bg-[#388E6C]/20 hover:bg-[#388E6C]/30 border border-[#388E6C]/40 transition-colors"
                              onClick={() => handleToggle(link.id)}
                            >
                              enable
                            </button>
                          )}
                          <button
                            className="text-xs font-medium text-[#D8523A] hover:text-white px-2.5 py-1 rounded bg-[#D8523A]/10 hover:bg-[#D8523A] border border-[#D8523A]/30 transition-colors"
                            title="Delete link"
                            onClick={() => handleDelete(link.id)}
                          >
                            delete
                          </button>
                        </div>
                      </div>

                      {/* Telemetry micro bar */}
                      <div
                        className={`mt-3 pt-2.5 border-t border-[#212B36] flex items-center justify-between text-label-code-sm font-label-code-sm ${
                          isActive ? "text-white/40" : "text-white/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1 ${isActive ? "text-white/60" : ""}`}>
                            <span
                              className={`material-symbols-outlined text-[13px] ${
                                isActive ? "text-[#48B087]" : "text-white/30"
                              }`}
                            >
                              {isActive ? "trending_up" : "pause_circle"}
                            </span>
                            {link.clicks.toLocaleString()} clicks
                          </span>
                          <span>·</span>
                          <span>p95: {link.p95}</span>
                          {link.region && (
                            <>
                              <span>·</span>
                              <span className="hidden sm:inline">{link.region}</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">{link.createdLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Telemetry Activity Mini-Widget */}
              <div className="mt-8 p-4 rounded-xl bg-surface-container-low border border-[#212B36] flex flex-col gap-3">
                <div className="flex items-center justify-between font-label-code-sm text-label-code-sm">
                  <span className="text-white/70 font-medium">
                    Aggregated Routing Throughput (Past 24h)
                  </span>
                  <span className="text-primary font-mono">6,333 req / 100% SLA</span>
                </div>
                <div className="h-10 w-full flex items-end gap-1.5 pt-2">
                  {SPARKLINE_BARS.map((bar, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 transition-colors hover:bg-primary rounded-t-sm ${barOpacityClass(
                        idx,
                        bar.peak
                      )}`}
                      style={{ height: `${bar.height}%` }}
                      title={bar.label}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-outline">
                  <span>00:00 UTC</span>
                  <span>PEAK: 14:23 UTC (710 req/m)</span>
                  <span>NOW</span>
                </div>
              </div>

              {/* Floating Feedback Toast */}
              <div
                className={`fixed bottom-6 right-6 z-50 transform transition-all duration-200 pointer-events-none ${
                  toast.visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
                }`}
              >
                <div className="bg-surface-container-highest text-white text-xs font-mono px-3.5 py-2 rounded shadow-2xl border border-primary/40 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_#73daae]"></span>
                  <span>{toast.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full border-t border-outline-variant/20 bg-surface-container-lowest/90 mt-space-xl">
        <div className="w-full max-w-[1440px] mx-auto px-space-lg py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-code-sm text-label-code-sm text-on-surface-variant">
          <div className="flex items-center gap-space-md">
            <span>© 2025 Forge Engine. High-performance link infrastructure.</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <span className="text-primary">latency 14ms</span>
            <span className="text-outline-variant">|</span>
            <span>cluster: us-east-1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";

/**
 * Sign up page ("join.forge")
 * - Three.js ambient background animation preserved via a ref + effect.
 * - Password visibility toggle reimplemented with React state.
 */

export default function SignUp() {
  const [email, setEmail] = useState("new.developer@domain.io");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const threeContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface antialiased relative min-h-screen flex items-center justify-center">
      {/* Ambient Three.js background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40">
        <div ref={threeContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <main className="relative z-10 w-full max-w-lg px-space-md py-space-xl">
        <div className="flex flex-col w-full">
          <div className="relative w-full flex items-center justify-center py-space-md">
            {/* Subtle glow backdrop for clinical terminal elevation */}
            <div className="absolute -top-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            <form
              onSubmit={handleSubmit}
              className="relative w-full max-w-sm bg-surface-container-low/95 backdrop-blur-xl p-space-lg rounded-xl shadow-2xl transition-all"
            >
              {/* Card Top Bar / Metadata */}
              <div className="flex items-center justify-between mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    terminal
                  </span>
                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                    Sign up
                  </h1>
                </div>
                <span className="font-label-code-sm text-label-code-sm text-primary px-space-xs py-0.5 rounded bg-primary-container/20 tracking-wider">
                  join.forge
                </span>
              </div>

              {/* Input Group */}
              <div className="space-y-space-md">
                <div className="group relative">
                  <div className="flex justify-between items-center mb-space-xs">
                    <label className="block font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider">
                      EMAIL
                    </label>
                    <span className="font-label-code-sm text-label-code-sm text-outline opacity-0 group-focus-within:opacity-100 transition-opacity">
                      sys.identity
                    </span>
                  </div>
                  <div className="relative bg-surface-container rounded px-space-sm py-space-xs focus-within:bg-surface-container-high transition-colors">
                    <input
                      className="w-full bg-transparent py-1 font-label-code-lg text-label-code-lg text-on-surface placeholder:text-outline focus:outline-none"
                      placeholder="developer@domain.io"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group relative">
                  <div className="flex justify-between items-center mb-space-xs">
                    <label className="block font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider">
                      PASSWORD
                    </label>
                    <span className="font-label-code-sm text-label-code-sm text-outline opacity-0 group-focus-within:opacity-100 transition-opacity">
                      sha256.sec
                    </span>
                  </div>
                  <div className="relative bg-surface-container rounded px-space-sm py-space-xs focus-within:bg-surface-container-high transition-colors">
                    <input
                      className="w-full bg-transparent py-1 font-label-code-lg text-label-code-lg text-on-surface placeholder:text-outline focus:outline-none pr-8"
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute right-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      onClick={() => setShowPassword((s) => !s)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer Credentials Checklist Pill */}
              <div className="mt-space-md p-space-xs bg-surface-container-lowest/80 rounded flex items-center justify-between px-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                    SSO &amp; CLI keys supported
                  </span>
                </div>
                <span className="font-label-code-sm text-label-code-sm text-primary">v2.4.0</span>
              </div>

              {/* Submission Trigger */}
              <button
                className="mt-space-lg w-full bg-primary-container hover:bg-secondary-container text-on-surface font-body-md text-body-md font-medium py-2.5 rounded-lg shadow-lg transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-space-xs group"
                type="submit"
              >
                <span>Initialize Account</span>
                <span className="font-label-code-sm text-label-code-sm bg-surface-container-lowest/40 px-1.5 py-0.5 rounded text-on-surface opacity-80 group-hover:opacity-100">
                  Enter &#8629;
                </span>
              </button>

              {/* Sub-action / Navigation */}
              <p className="mt-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                Already have an account?{" "}
                
                  className="text-primary hover:text-primary-fixed font-medium inline-flex items-center gap-0.5 transition-colors"
                  href="#login"
                  Log in
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>

              </p>

              {/* Protocol Status Indicator */}
              <div className="mt-space-lg pt-space-sm flex items-center justify-between text-outline">
                <span className="font-label-code-sm text-[10px] tracking-widest uppercase">
                  ENCRYPTED END-TO-END
                </span>
                <div className="flex items-center gap-1 font-label-code-sm text-[10px]">
                  <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
                  <span>GATEWAY: US-EAST</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";

/**
 * Login page ("auth.v1")
 * - Three.js ambient background animation preserved via a ref + effect.
 * - Password visibility toggle reimplemented with React state.
 * - Remember-device checkbox reimplemented with React state.
 */

export default function Login() {
  const [email, setEmail] = useState("alex.chen@forge.sh");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

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
        <div className="flex flex-col w-full items-center justify-center">
          <div className="w-full max-w-sm relative group">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>

            <form
              onSubmit={handleSubmit}
              className="relative w-full bg-surface-container-low/95 backdrop-blur-md p-8 rounded-xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                    Log in
                  </h1>
                </div>
                <span className="font-label-code-sm text-label-code-sm text-primary bg-secondary-container/40 px-2 py-0.5 rounded">
                  auth.v1
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-code-sm text-label-code-sm text-outline tracking-wider uppercase">
                      EMAIL
                    </label>
                    <span className="font-label-code-sm text-label-code-sm text-on-surface-variant/40">
                      SYS_ID
                    </span>
                  </div>
                  <div className="relative flex items-center bg-surface-container-lowest/60 rounded px-3 py-2 transition-colors focus-within:bg-surface-container-lowest">
                    <span className="material-symbols-outlined text-outline text-lg mr-2 select-none">
                      alternate_email
                    </span>
                    <input
                      className="w-full bg-transparent font-label-code-md text-label-code-md text-on-surface placeholder:text-outline/40 outline-none"
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-code-sm text-label-code-sm text-outline tracking-wider uppercase">
                      PASSWORD
                    </label>
                    <a className="font-label-code-sm text-label-code-sm text-primary hover:underline" href="#">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative flex items-center bg-surface-container-lowest/60 rounded px-3 py-2 transition-colors focus-within:bg-surface-container-lowest">
                    <span className="material-symbols-outlined text-outline text-lg mr-2 select-none">
                      key
                    </span>
                    <input
                      className="w-full bg-transparent font-label-code-md text-label-code-md text-on-surface placeholder:text-outline/40 outline-none"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="text-outline hover:text-on-surface focus:outline-none flex items-center"
                      onClick={() => setShowPassword((s) => !s)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base select-none">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-surface-container-lowest text-primary accent-primary cursor-pointer"
                    type="checkbox"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Remember device
                  </span>
                </label>
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant/60">
                  TTL: 30d
                </span>
              </div>

              <button
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline-md text-body-md font-semibold py-2.5 px-4 rounded transition-all duration-150 shadow-md active:scale-[0.99] flex items-center justify-center space-x-2"
                type="submit"
              >
                <span>Authenticate</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full h-px bg-surface-container-highest"></div>
                <span className="absolute px-3 font-label-code-sm text-label-code-sm bg-surface-container-low text-on-surface-variant/70 uppercase">
                  or
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex items-center justify-center space-x-2 py-2 px-3 bg-surface-container hover:bg-surface-container-high rounded transition-colors text-on-surface"
                  type="button"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span className="font-label-code-sm text-label-code-sm">GitHub</span>
                </button>
                <button
                  className="flex items-center justify-center space-x-2 py-2 px-3 bg-surface-container hover:bg-surface-container-high rounded transition-colors text-on-surface"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">terminal</span>
                  <span className="font-label-code-sm text-label-code-sm">CLI SSO</span>
                </button>
              </div>

              <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
                No account?{" "}
                <a className="text-primary hover:underline font-medium" href="#">
                  Sign up
                </a>
              </p>

              <div className="pt-2 flex items-center justify-between text-on-surface-variant/40 font-label-code-sm text-label-code-sm">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  <span>edge-node:iad1</span>
                </span>
                <span>tls_v1.3</span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
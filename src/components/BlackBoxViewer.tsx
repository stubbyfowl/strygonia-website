import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  BLACKBOX_MODELS,
  addStudioLights,
  createShellMaterial,
  loadBlackboxStl,
} from "@/lib/blackboxModels";
import { images } from "@/assets/images";

const MONO = "var(--ark-mono)";

/* Interactive 360° viewer for the full BlackBox assembly. Auto-rotates until
   the user grabs it; zoom stays off so the page keeps the scroll wheel. */
export function BlackBoxViewer({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [grabbed, setGrabbed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setStatus("error");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      touchAction: "pan-y",
    });
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 1, 2000);
    addStudioLights(scene, 1.3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 2.15;

    const material = createShellMaterial();
    let disposed = false;

    loadBlackboxStl(BLACKBOX_MODELS.full)
      .then((geometry) => {
        if (disposed) return;
        scene.add(new THREE.Mesh(geometry, material));
        const sphere = new THREE.Sphere();
        (geometry.boundingBox ?? new THREE.Box3().setFromObject(scene)).getBoundingSphere(sphere);
        const distance = (sphere.radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.18;
        camera.position.set(distance * 0.55, distance * 0.42, distance * 0.78);
        controls.target.set(0, 0, 0);
        controls.update();
        setStatus("ready");
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(host);

    const onGrab = () => {
      controls.autoRotate = false;
      setGrabbed(true);
    };
    renderer.domElement.addEventListener("pointerdown", onGrab);

    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      controls.update();
      if (inView) renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onGrab);
      controls.dispose();
      material.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-md ${className}`}
      style={{ aspectRatio: "4 / 3.2", background: "radial-gradient(80% 70% at 50% 42%, rgba(168,203,232,0.09) 0%, rgba(6,8,12,0) 70%)" }}
    >
      <div ref={hostRef} className="absolute inset-0" style={{ cursor: grabbed ? "grabbing" : "grab" }} />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span style={{ fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ark-muted)" }}>
            Loading model…
          </span>
        </div>
      )}

      {status === "error" && (
        <img src={images.blackbox1} alt="BlackBox recorder module on a workbench" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {status === "ready" && (
        <span
          className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 pointer-events-none transition-opacity duration-500"
          style={{
            fontFamily: MONO,
            fontSize: "0.6rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ark-ink-dim)",
            border: "1px solid var(--ark-line)",
            background: "rgba(6,8,12,0.55)",
            backdropFilter: "blur(6px)",
            opacity: grabbed ? 0 : 1,
          }}
        >
          Drag to rotate · live 3D
        </span>
      )}
    </div>
  );
}

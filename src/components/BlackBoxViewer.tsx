import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { addStudioLights } from "@/lib/blackboxModels";
import { images } from "@/assets/images";

const BODY = "var(--ark-body)";

/* BlackBox Rev A board (from 3d/BlackBox_RevA.glb), compressed with gltf-transform:
   meshopt geometry, 1536px WebP textures, 18.2 MB -> 2.1 MB. In metres, Y-up. */
const MODEL_URL = `${import.meta.env.BASE_URL}models/blackbox-reva.glb`;

/* Interactive 360° viewer for the BlackBox Rev A board. Auto-rotates until
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
    // Reflections for the gold pads and clearcoat, plus the site's studio rig.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    addStudioLights(scene, 0.9);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 2.15;

    let disposed = false;
    let model: THREE.Object3D | null = null;

    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync(MODEL_URL)
      .then((gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.scale.setScalar(1000); // metres to millimetres, to suit the camera's near/far planes
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        model.position.sub(box.getCenter(new THREE.Vector3()));
        scene.add(model);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        // Closer than the bounding sphere needs: the board is flat, so even its diagonal stays inside the wide frame while it spins.
        const distance = (sphere.radius / Math.tan((camera.fov * Math.PI) / 360)) * 0.86;
        camera.position.copy(new THREE.Vector3(0.5, 0.62, 0.72).normalize().multiplyScalar(distance));
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
      model?.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const material of [mesh.material].flat()) {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
          material.dispose();
        }
      });
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
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
          <span style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 500, color: "var(--ark-muted)" }}>
            Loading model…
          </span>
        </div>
      )}

      {status === "error" && (
        <img src={images.blackbox1} alt="BlackBox Rev A PCB top view" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {status === "ready" && (
        <span
          className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 pointer-events-none transition-opacity duration-500"
          style={{
            fontFamily: BODY,
            fontSize: "0.75rem",
            fontWeight: 500,
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

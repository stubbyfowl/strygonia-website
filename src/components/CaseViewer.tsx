import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { addStudioLights } from "@/lib/blackboxModels";
import { CASE_COLOURS, type CaseColour } from "@/constants/catalog";

const BODY = "var(--ark-body)";

/* Case base and lid from the enclosure kit's render-stl files (mm, Z up, assembled, board
   centre at x/y 0, case floor at z 0). Rendered only, never linked for download. The board
   is the Rev A GLB; its underside sits 3.24 mm above the case floor. */
const BASE_URL = `${import.meta.env.BASE_URL}models/case/case-base.stl`;
const LID_URL = `${import.meta.env.BASE_URL}models/case/case-lid.stl`;
const BOARD_URL = `${import.meta.env.BASE_URL}models/blackbox-reva.glb`;
const BOARD_LIFT_MM = 3.24;
const CASE_HEIGHT_MM = 17;
const LID_OPEN_MM = 26;
const FINISH: Record<CaseColour, { roughness: number }> = { white: { roughness: 0.45 }, black: { roughness: 0.5 } };

export function CaseViewer({ colour, open, fallback }: { colour: CaseColour; open: boolean; fallback: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const openRef = useRef(open);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [grabbed, setGrabbed] = useState(false);

  openRef.current = open;

  useEffect(() => {
    const m = materialRef.current;
    if (!m) return;
    m.color.set(CASE_COLOURS[colour].hex);
    m.roughness = FINISH[colour].roughness;
  }, [colour]);

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
    renderer.toneMappingExposure = 1.15;
    Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%", touchAction: "pan-y" });
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 1, 2000);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    addStudioLights(scene, 0.8);

    // Everything is built in mm, then centred on the closed case.
    const assembly = new THREE.Group();
    assembly.position.y = -CASE_HEIGHT_MM / 2;
    scene.add(assembly);

    const material = new THREE.MeshStandardMaterial({ color: CASE_COLOURS[colour].hex, roughness: FINISH[colour].roughness, metalness: 0 });
    materialRef.current = material;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 2.2;

    const distance = (58 / Math.tan((camera.fov * Math.PI) / 360)) * 0.9;
    camera.position.copy(new THREE.Vector3(0.55, 0.55, 0.75).normalize().multiplyScalar(distance));

    let disposed = false;
    let lid: THREE.Mesh | null = null;
    let board: THREE.Object3D | null = null;
    const geometries: THREE.BufferGeometry[] = [];

    const loadStl = (url: string) =>
      new STLLoader().loadAsync(url).then((g) => {
        g.rotateX(-Math.PI / 2); // Z up -> three.js Y up
        g.computeVertexNormals();
        geometries.push(g);
        return g;
      });

    Promise.all([
      loadStl(BASE_URL),
      loadStl(LID_URL),
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(BOARD_URL),
    ])
      .then(([baseGeo, lidGeo, gltf]) => {
        if (disposed) return;
        assembly.add(new THREE.Mesh(baseGeo, material));
        lid = new THREE.Mesh(lidGeo, material);
        assembly.add(lid);
        board = gltf.scene;
        board.scale.setScalar(1000); // metres to mm
        board.position.y = BOARD_LIFT_MM;
        assembly.add(board);
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

    let lift = 0;
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!inView) return;
      // Ease the lid up or back down, and keep the whole thing centred while it's open.
      lift += ((openRef.current ? LID_OPEN_MM : 0) - lift) * 0.12;
      if (lid) lid.position.y = lift;
      assembly.position.y = -(CASE_HEIGHT_MM + lift) / 2;
      controls.update();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onGrab);
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      material.dispose();
      (board as THREE.Object3D | null)?.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const m of [mesh.material].flat()) {
          for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
          m.dispose();
        }
      });
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      host.removeChild(renderer.domElement);
    };
    // Colour changes update the shared material in place; the scene is built once.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: "4 / 3.2", background: "radial-gradient(80% 70% at 50% 42%, rgba(37,99,235,0.10) 0%, rgba(6,8,12,0) 70%)" }}>
      <div ref={hostRef} className="absolute inset-0" style={{ cursor: grabbed ? "grabbing" : "grab" }} />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 500, color: "var(--ark-muted)" }}>Loading model…</span>
        </div>
      )}
      {status === "error" && <img src={fallback} alt="BlackBox Case" className="absolute inset-0 w-full h-full object-cover" />}
      {status === "ready" && !grabbed && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 pointer-events-none" style={{ fontFamily: BODY, fontSize: "0.75rem", fontWeight: 500, color: "var(--ark-ink-dim)", border: "1px solid var(--ark-line)", background: "rgba(240,235,228,0.75)", backdropFilter: "blur(6px)" }}>
          Drag to rotate · live 3D
        </span>
      )}
    </div>
  );
}

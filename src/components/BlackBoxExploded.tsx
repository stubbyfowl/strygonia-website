import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { addStudioLights } from "@/lib/blackboxModels";
import { images } from "@/assets/images";

const DISPLAY = "var(--ark-display)";
const BODY = "var(--ark-body)";
const NORDIC = "var(--ark-nordic)";

/* Rev A board with an "Explode" clip (5 s): parts ripple up 0-2.75 s, then the board peels
   into its layers 2.5-4.7 s. Scroll scrubs the clip. From 3d/exploded/BlackBox_RevA_explode_web.glb. */
const MODEL_URL = `${import.meta.env.BASE_URL}models/blackbox-explode.glb`;

/* Parts called out with a pointer once they've lifted off the board. side: which way the label leans. */
const CALLOUTS = [
  { node: "U3", title: "STM32H743 microcontroller", body: "The brain. Runs the recording at 400 MHz.", side: -1 },
  { node: "U8", title: "INA226 power monitor", body: "Measures your board's current and voltage.", side: -1 },
  { node: "J5", title: "microSD slot", body: "Where the rolling recording is kept.", side: 1 },
  { node: "J1", title: "USB-C", body: "Power, and the link to the BlackBox Desktop App.", side: 1 },
];

export function BlackBoxExploded({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  /* The intro copy hands the frame to the model once the teardown starts —
     on narrow screens the lifted shell would otherwise sit behind the text. */
  // Full 0..1 range on purpose: motion hands opacity to a native ViewTimeline, and a
  // partial range leaves no keyframe at 1, so the browser fades the copy back in.
  const introOpacity = useTransform(scrollYProgress, [0, 0.05, 0.3, 1], [1, 1, 0, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.05, 0.3, 1], [0, 0, -24, -24]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  useEffect(() => {
    if (reducedMotion) {
      // Static exploded pose, no scroll choreography.
      progressRef.current = 0.85;
    }

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
    renderer.toneMappingExposure = 1.35;
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 1, 2000);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    // Light from above and to the side shows the traces under the solder mask.
    addStudioLights(scene, 1.1);

    const group = new THREE.Group();
    scene.add(group);
    let model: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let action: THREE.AnimationAction | null = null;
    let duration = 5;
    const targets: { obj: THREE.Object3D; showAt: number }[] = [];
    let disposed = false;

    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync(MODEL_URL)
      .then((gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.scale.setScalar(1000); // metres to millimetres
        group.add(model);
        const clip = gltf.animations.find((a) => a.name === "Explode") ?? gltf.animations[0];
        if (clip) {
          duration = clip.duration;
          mixer = new THREE.AnimationMixer(model);
          action = mixer.clipAction(clip);
          action.play();
          action.paused = true;
        }
        for (const c of CALLOUTS) {
          const obj = model.getObjectByName(c.node);
          const anim = obj?.userData.anim_s as [number, number] | undefined;
          targets.push({ obj: obj ?? model, showAt: anim ? anim[1] - 0.2 : 2.6 });
        }
        setStatus("ready");
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    const fit = { vHalf: Math.tan((camera.fov * Math.PI) / 360), hHalf: 0.3, w: 1, h: 1 };
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fit.hHalf = fit.vHalf * camera.aspect;
      fit.w = w;
      fit.h = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(host);

    const world = new THREE.Vector3();
    let frame = 0;
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (!inView) return;
      const p = progressRef.current;
      const t = Math.min(1, Math.max(0, (p - 0.04) / 0.88)) * duration;
      if (action && mixer) {
        action.time = t;
        mixer.update(0);
      }
      group.rotation.y = -0.45 + p * 0.9 + Math.sin(time / 4200) * 0.02;
      // Fit the 74 mm board side to side, and the stack as it grows.
      const z = Math.max((22 + 34 * p) / fit.vHalf, 48 / fit.hHalf) * 1.12;
      camera.position.set(0, z * 0.52, z);
      camera.lookAt(0, 6 + p * 16, 0);
      renderer.render(scene, camera);

      // Pointers: project each called-out part to the screen; fade in once it has lifted, out as the layers peel.
      targets.forEach((target, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        target.obj.getWorldPosition(world).project(camera);
        const x = (world.x * 0.5 + 0.5) * fit.w;
        const y = (-world.y * 0.5 + 0.5) * fit.h;
        const fade = Math.min(1, Math.max(0, (t - target.showAt) / 0.35)) * Math.min(1, Math.max(0, (4.5 - t) / 0.35));
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.opacity = String(reducedMotion ? 0 : fade);
      });
    };
    frame = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      mixer?.stopAllAction();
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
  }, [reducedMotion]);

  return (
    <section className="relative" style={{ background: "var(--ark-bg)" }}>
      <div ref={trackRef} style={{ height: reducedMotion ? "100vh" : "320vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* stage */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(70% 62% at 50% 46%, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 45%, rgba(232,220,200,0.0) 74%)" }}
          />
          <div ref={hostRef} className="absolute inset-0" aria-hidden={status !== "error"} />

          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <img
                src={images.blackbox3}
                alt="BlackBox Rev A PCB profile view"
                className="max-h-[70vh] w-auto max-w-full rounded-lg"
                style={{ border: "1px solid var(--ark-line)" }}
              />
            </div>
          )}

          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span style={{ fontFamily: BODY, fontSize: "0.82rem", fontWeight: 500, color: "var(--ark-muted)" }}>
                Loading assembly…
              </span>
            </div>
          )}

          {/* overlay copy */}
          <div className="absolute inset-0 pointer-events-none px-6 lg:px-10">
            <div className="max-w-6xl mx-auto h-full flex flex-col justify-between pt-28 pb-14">
              <motion.div className="max-w-xl" style={reducedMotion ? undefined : { opacity: introOpacity, y: introY }}>
                {eyebrow && (
                  <span style={{ fontFamily: NORDIC, fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ark-signal)", display: "block", marginBottom: "1.1rem" }}>
                    {eyebrow}
                  </span>
                )}
                <h2 className="ark-on-photo" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)", lineHeight: 0.98, color: "var(--ark-ink)", marginBottom: "0.9rem" }}>
                  {title}
                </h2>
                <p className="ark-on-photo" style={{ fontFamily: BODY, fontSize: "0.98rem", color: "var(--ark-ink-dim)", lineHeight: 1.7, maxWidth: "26rem" }}>
                  {subtitle}
                </p>
              </motion.div>
            </div>
          </div>

          {/* pointers to key parts, positioned every frame by the render loop */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden={status !== "ready"}>
            {CALLOUTS.map((c, i) => (
              <div key={c.node} ref={(el) => { labelRefs.current[i] = el; }} className="absolute left-0 top-0" style={{ opacity: 0, willChange: "transform, opacity" }}>
                <span className="absolute -left-[5px] -top-[5px] w-[10px] h-[10px] rounded-full" style={{ background: "#60a5fa", boxShadow: "0 0 0 4px rgba(96,165,250,0.25), 0 0 14px rgba(96,165,250,0.8)" }} />
                <span className="absolute top-0 h-px" style={{ width: 56, background: "rgba(147,197,253,0.7)", left: c.side > 0 ? 0 : -56, transform: `rotate(${c.side > 0 ? -28 : 28}deg)`, transformOrigin: c.side > 0 ? "left center" : "right center" }} />
                <div className="absolute w-[13.5rem] rounded-md px-3 py-2" style={{ top: -52, left: c.side > 0 ? 50 : undefined, right: c.side > 0 ? undefined : 50, textAlign: c.side > 0 ? "left" : "right", background: "rgba(10,14,22,0.82)", border: "1px solid rgba(96,165,250,0.35)", backdropFilter: "blur(6px)" }}>
                  <div style={{ fontFamily: BODY, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em", color: "#93c5fd" }}>{c.node}</div>
                  <div style={{ fontFamily: BODY, fontSize: "0.86rem", fontWeight: 600, color: "#f5f5f4", lineHeight: 1.25 }}>{c.title}</div>
                  <div style={{ fontFamily: BODY, fontSize: "0.76rem", color: "rgba(245,245,244,0.7)", lineHeight: 1.4, marginTop: 2 }}>{c.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* progress rail */}
          {!reducedMotion && (
            <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none" style={{ background: "var(--ark-line-soft)" }}>
              <motion.div className="h-full origin-left" style={{ scaleX: barScale, background: "var(--ark-signal)" }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

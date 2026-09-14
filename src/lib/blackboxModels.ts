import {
  DirectionalLight,
  HemisphereLight,
  MeshStandardMaterial,
  type BufferGeometry,
  type Scene,
} from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

/* BlackBox CAD exports, served from public/models. `full` is the complete
   assembly used by the interactive viewer; the rest are the individual parts
   the exploded view animates. */
export const BLACKBOX_MODELS = {
  full: `${import.meta.env.BASE_URL}models/blackbox-full.stl`,
  top: `${import.meta.env.BASE_URL}models/blackbox-top.stl`,
  circuit: `${import.meta.env.BASE_URL}models/blackbox-circuit.stl`,
  esp32: `${import.meta.env.BASE_URL}models/blackbox-esp32.stl`,
  bottomPlate: `${import.meta.env.BASE_URL}models/blackbox-bottom-plate.stl`,
} as const;

const cache = new Map<string, Promise<BufferGeometry>>();

/* The STLs are in metres, Z-up, and each part sits in its own local frame.
   Normalise every mesh the same way: centre it, convert to millimetres, and
   swing to three.js Y-up. Geometries are cached and shared across mounts —
   never dispose them from a component. */
export function loadBlackboxStl(url: string): Promise<BufferGeometry> {
  let pending = cache.get(url);
  if (!pending) {
    pending = new STLLoader().loadAsync(url).then((geometry) => {
      geometry.scale(1000, 1000, 1000);
      geometry.rotateX(-Math.PI / 2);
      geometry.center();
      geometry.computeBoundingBox();
      return geometry;
    });
    cache.set(url, pending);
  }
  return pending;
}

/* Shared studio lighting so the viewer and the exploded view read as the
   same product photography setup. `intensity` scales the whole rig. */
export function addStudioLights(scene: Scene, intensity = 1) {
  const hemi = new HemisphereLight(0xcfe4ff, 0x0a0e14, 0.85 * intensity);
  const key = new DirectionalLight(0xffffff, 1.7 * intensity);
  key.position.set(60, 110, 90);
  const rim = new DirectionalLight(0xa8cbe8, 0.9 * intensity);
  rim.position.set(-90, 45, -70);
  const fill = new DirectionalLight(0x7f9fbf, 0.35 * intensity);
  fill.position.set(0, -60, 40);
  scene.add(hemi, key, rim, fill);
}

export const createShellMaterial = () =>
  new MeshStandardMaterial({ color: 0x232935, roughness: 0.45, metalness: 0.2 });

export const createPcbMaterial = () =>
  new MeshStandardMaterial({ color: 0x16344c, roughness: 0.5, metalness: 0.3 });

export const createShieldMaterial = () =>
  new MeshStandardMaterial({ color: 0xaeb8c4, roughness: 0.28, metalness: 0.85 });

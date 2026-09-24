import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

declare global {
  interface Window { __ready?: boolean; lab?: unknown }
}

const params = new URLSearchParams(location.search);
const app = document.getElementById('app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(app.clientWidth, app.clientHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x30343f);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(3, 6, 5);
scene.add(sun);
scene.add(new THREE.GridHelper(10, 20, 0x888888, 0x555555));
scene.add(new THREE.AxesHelper(2));

const camera = new THREE.PerspectiveCamera(30, app.clientWidth / app.clientHeight, 0.1, 100);
const view = params.get('view') ?? 'front';
const views: Record<string, [number, number, number]> = {
  front: [0, 2.4, 12], back: [0, 2.4, -12], left: [12, 2.4, 0], right: [-12, 2.4, 0], top: [0, 14, 0.01], persp: [7, 5, 9],
};
camera.position.set(...views[view]);
camera.lookAt(0, 2.3, 0);

const draco = new DRACOLoader();
draco.setDecoderPath('libs/draco/');
const loader = new GLTFLoader();
loader.setDRACOLoader(draco);
const species = params.get('species') ?? 'blaziken';
loader.load(`assets/pokemon/${species}/model.glb`, (gltf) => {
  scene.add(gltf.scene);
  if (params.get('bones') === '1') {
    const helper = new THREE.SkeletonHelper(gltf.scene);
    (helper.material as THREE.LineBasicMaterial).depthTest = false;
    scene.add(helper);
  }
  const box = new THREE.Box3().setFromObject(gltf.scene);
  console.log('bbox', box.min.toArray().map((v) => v.toFixed(3)), box.max.toArray().map((v) => v.toFixed(3)));
  renderer.render(scene, camera);
  window.__ready = true;
});

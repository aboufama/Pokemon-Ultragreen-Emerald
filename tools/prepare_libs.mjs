// Copies runtime decoder libraries shipped inside npm packages into public/,
// so they always match the installed three.js version.
import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = resolve(ROOT, 'public/libs/draco');
await mkdir(dest, { recursive: true });
await cp(resolve(ROOT, 'node_modules/three/examples/jsm/libs/draco/gltf'), dest, { recursive: true });

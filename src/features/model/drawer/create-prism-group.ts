import * as THREE from 'three';
import type { GeomFile } from '../model';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Тёмный насыщенный градиент по HSL (от холодного синего к горячему красному).
 */
function getDarkHSLColor(t: number): THREE.Color {
  const hue = (1 - t) * 240; // от синего (240) к красному (0)
  const color = new THREE.Color();
  color.setHSL(hue / 360, 1.0, 0.6);
  return color;
}

export function createPrismGroup(
  geomFile: GeomFile,
  useColor: boolean,
  values: number[] | null,
  min: number,
  max: number,
  hasLayerAbove: boolean,
  hasLayerBelow: boolean
): THREE.Mesh {
  const { points, triangles } = geomFile;

  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const topMap = new Map<string, number>();
  const bottomMap = new Map<string, number>();
  const gray = new THREE.Color(0xBBBBBB);

  let vertexIndex = 0;
  let valueIdx = 0;

  const getKey = (x: number, y: number, z: number) => `${x}_${y}_${z}`;

  const pushVertex = (
    x: number,
    y: number,
    z: number,
    t: number,
    map: Map<string, number>
  ) => {
    const key = getKey(x, y, z);
    if (map.has(key)) return map.get(key)!;

    vertices.push(x, y, z);
    const c = useColor ? getDarkHSLColor(t) : gray;
    colors.push(c.r, c.g, c.b);

    const idx = vertexIndex++;
    map.set(key, idx);
    return idx;
  };

  for (const tri of triangles) {
    if (!tri) continue;
    const { p1, p2, p3, marker = 'n' } = tri;

    if (marker === 'h') continue;
    // if (marker === 't' && hasLayerAbove) continue;
    // if (marker === 'b' && hasLayerBelow) continue;
    // if (marker === 'a' && hasLayerAbove && hasLayerBelow) continue;

    const a = points[p1];
    const b = points[p2];
    const c = points[p3];

    const value = values?.[valueIdx++] ?? null;
    const t = value != null && isFinite(min) && isFinite(max)
      ? THREE.MathUtils.clamp((value - min) / (max - min), 0, 1)
      : 0.0;

    // Верх
    const i1 = pushVertex(a.x, a.y, a.zTop, t, topMap);
    const i2 = pushVertex(b.x, b.y, b.zTop, t, topMap);
    const i3 = pushVertex(c.x, c.y, c.zTop, t, topMap);
    indices.push(i1, i2, i3);

    // Низ
    const j1 = pushVertex(a.x, a.y, a.zBottom, t, bottomMap);
    const j2 = pushVertex(b.x, b.y, b.zBottom, t, bottomMap);
    const j3 = pushVertex(c.x, c.y, c.zBottom, t, bottomMap);
    indices.push(j3, j2, j1); // обратный порядок
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  // 🔧 Мерджим вершины и считаем нормали заново
  mergeVertices(geometry);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    flatShading: false, // обязательно!
    roughness: 0.9,
    metalness: 0.4,
    toneMapped: true,
  });

  return new THREE.Mesh(geometry, material);
}

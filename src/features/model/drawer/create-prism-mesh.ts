import * as THREE from 'three';
import type { GeomFile } from '../model';

export function createPrismMesh(
  geomFile: GeomFile,
  selectedColor: THREE.Color,
  paramValues?: number[],
  min?: number,
  max?: number
): THREE.Mesh {
  const { points, triangles } = geomFile;
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  let vertexIndex = 0;
  let valueIdx = 0;

  const baseBlue = new THREE.Color('#0000FF');

  const pushVertex = (x: number, y: number, z: number, value?: number) => {
    vertices.push(x, y, z);
    if (value != null && min != null && max != null) {
      const t = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
      const color = baseBlue.clone().lerp(selectedColor, t);
      colors.push(color.r, color.g, color.b);
    } else {
      colors.push(baseBlue.r, baseBlue.g, baseBlue.b);
    }
    return vertexIndex++;
  };

  for (const tri of triangles) {
    if (!tri || tri.marker === 'h') continue;

    const { p1, p2, p3 } = tri;
    const a = points[p1];
    const b = points[p2];
    const c = points[p3];
    const val = paramValues?.[valueIdx];

    // Верхняя и нижняя грани
    const i1 = pushVertex(a.x, a.y, a.zTop, val);
    const i2 = pushVertex(b.x, b.y, b.zTop, val);
    const i3 = pushVertex(c.x, c.y, c.zTop, val);
    indices.push(i1, i2, i3);

    const j1 = pushVertex(a.x, a.y, a.zBottom, val);
    const j2 = pushVertex(b.x, b.y, b.zBottom, val);
    const j3 = pushVertex(c.x, c.y, c.zBottom, val);
    indices.push(j3, j2, j1);

    // Боковые грани (6 треугольников)
    const pairs = [
      [a, b], [b, c], [c, a]
    ];

    for (const [from, to] of pairs) {
      const v1 = pushVertex(from.x, from.y, from.zTop, val);
      const v2 = pushVertex(to.x, to.y, to.zTop, val);
      const v3 = pushVertex(to.x, to.y, to.zBottom, val);
      const v4 = pushVertex(from.x, from.y, from.zBottom, val);
      indices.push(v1, v2, v3, v1, v3, v4);
    }

    valueIdx++;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  return new THREE.Mesh(geometry, material);
}

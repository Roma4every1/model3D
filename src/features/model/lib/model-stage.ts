import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ParsedModel, VoxelGeomFlat, VoxelParameterFlat, GeomFile } from '../model';
import { getGroupSelectedColor } from './color-utils';
import { createPrismGroup } from '../drawer/create-prism-group';
import { EventBus } from 'shared/lib';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';



export type ModelEventKind = 'selected-group' | 'selected-date' | 'selected-layers' | 'data-loaded'  | 'render-start' | 'render-end';

export interface ModelEventMap {
  'selected-date': string;
  'selected-group': string;
  'selected-layers': number[];
  'data-loaded': void;
  'render-start': void;
  'render-end': void;
}
export class ModelStage {
  canvas?: HTMLDivElement;
  initialized = false;

  private composer!: EffectComposer;
  private fxaaPass!: ShaderPass;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private layerMeshes = new Map<number, THREE.Mesh[]>();
  private modelGroup = new THREE.Group();
  private shiftGroup = new THREE.Group();

  private parsedModel?: ParsedModel;
  private geomFiles?: VoxelGeomFlat;
  private parameterData?: VoxelParameterFlat;

  private selectedGroup: string = '';
  private selectedDate: string = '';
  private selectedLayerIndices: number[] = [];


  private ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  private dirLight = new THREE.DirectionalLight(0xffffff, 1.2);

  private readonly eventBus = new EventBus<ModelEventKind, ModelEventMap>();

  public subscribe<T extends ModelEventKind>(e: T, cb: EventCallback<ModelEventMap[T]>) {
    this.eventBus.subscribe(e, cb);
  }

  public unsubscribe<T extends ModelEventKind>(e: T, cb: EventCallback<ModelEventMap[T]>) {
    this.eventBus.unsubscribe(e, cb);
  }


  constructor() {
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(2048, 2048);
    this.dirLight.shadow.camera.near = 0.1;
    this.dirLight.shadow.camera.far = 100000;
  }

  getSelectedLayers() {
    return this.selectedLayerIndices;
  }

  getSelectedGroup() {
    return this.selectedGroup;
  }

  getSelectedDate() {
    return this.selectedDate;
  }

   /** Надёжная привязка к DOM, вызывается из React-компонента. */
  attachTo(container: HTMLDivElement) {
    if (this.canvas === container && this.initialized) return;

    this.canvas = container;
    this.initialized = false; // переинициализировать
    this.init(container);

    if (this.parsedModel && this.geomFiles) {
      this.renderScene();
    }
  }

  /** Инициализация сцены (однократно). */
  init(container: HTMLDivElement) {
    if (this.initialized) return;
    this.initialized = true;

    this.canvas = container;
    container.innerHTML = '';

    this.scene.background = new THREE.Color(0xf0f0f0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true});
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 100000);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.material.uniforms['resolution'].value.set(
      1 / container.clientWidth,
      1 / container.clientHeight
    );
    this.composer.addPass(this.fxaaPass);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    if (!this.scene.children.includes(this.ambientLight)) {
      this.scene.add(this.ambientLight);
    }
    if (!this.scene.children.includes(this.dirLight)) {
      this.scene.add(this.dirLight);
    }

    this.controls.addEventListener('change', this.render);
    window.addEventListener('resize', this.handleResize);

  }

  async setData(
    parsedModel: ParsedModel,
    geomFiles: VoxelGeomFlat,
  ) {
    
    this.parsedModel = parsedModel;
    this.geomFiles = geomFiles;
    this.selectedLayerIndices = Array.from({ length: parsedModel.layers[0].prismLayers.count }, (_, i) => i);
    const bounds = computeBounds(this.parsedModel);
    const [cx, cy, cz] = bounds.center;
    const delta = Math.max(...bounds.size);

// Камера сзади, сверху и сбоку, под углом к центру
    this.camera.position.set(
      cx + delta,
      cy + delta,
      cz + delta
    );

    // Смотрит точно в центр модели
    this.controls.target.set(cx, cy, cz);
    this.controls.update();

    this.controls.update();

   const dirLight = this.scene.children.find(obj => obj instanceof THREE.DirectionalLight) as THREE.DirectionalLight;
    if (dirLight) {
    dirLight.position.set(
      cx + delta,
      cy,
      cz + delta
    );
    dirLight.shadow.camera.left = -delta;
    dirLight.shadow.camera.right = delta;
    dirLight.shadow.camera.top = delta;
    dirLight.shadow.camera.bottom = -delta;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = delta * 4;
    }

    // Центрируем модель
    this.shiftGroup = new THREE.Group();
    this.shiftGroup.position.set(-cx, -cy, -cz);
    this.modelGroup.scale.set(1, -1, this.parsedModel.zMultiply === -1 ? 10 : -10);
    this.modelGroup.rotation.x = Math.PI / 2;

    if (this.initialized && this.canvas) {
    await this.renderScene();
    }
    this.eventBus.publish('data-loaded', undefined);

  }

  public async setParameterData(
    paramData: VoxelParameterFlat,
    group: string,
    date: string
  ) {
    this.parameterData = paramData;
    this.selectedGroup = group;
    this.selectedDate = date;
    this.eventBus.publish('selected-group', group);
    this.eventBus.publish('render-start', undefined);
    const paramPrefix = `${group}_${date}`;
    const useColor = !!(this.selectedGroup && this.selectedDate && this.parameterData?.[paramPrefix]);
    const { min, max } = findGroupMinMax(this.parsedModel!, paramPrefix);

    for (const [layerIndex, meshes] of this.layerMeshes) {
      // if (!this.selectedLayerIndices.includes(layerIndex)) continue;
      const hasLayerAbove = this.selectedLayerIndices.includes(layerIndex + 1);
      const hasLayerBelow = this.selectedLayerIndices.includes(layerIndex - 1);
      const geomLayer = this.geomFiles?.[layerIndex];
      if (!geomLayer) continue;

      const keys = Object.keys(geomLayer);
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const cellKey = keys[i];
        const geomFile = geomLayer[cellKey];
        const values = paramData?.[paramPrefix]?.[layerIndex]?.[cellKey];
        const hasValues = values && values.length > 0 && isFinite(min) && isFinite(max);
        await new Promise(requestAnimationFrame);
        const newMesh = createPrismGroup(geomFile, useColor, hasValues ? values : null, min, max, hasLayerAbove,
      hasLayerBelow);

        // Заменяем geo + material без пересоздания объекта в сцене
        mesh.geometry.dispose();
        mesh.geometry = newMesh.geometry;

        if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
        else mesh.material.dispose();

        mesh.material = newMesh.material;
      }
    }
    this.eventBus.publish('render-end', undefined);
    this.render();
  }


  public async setSelectedGroup(group: string) {
    this.selectedGroup = group;
  }

  public async setSelectedDate(date: string) {
    this.selectedDate = date;
    this.eventBus.publish('selected-date', date);
  }

  public async setSelectedLayers(indices: number[]) {
    this.selectedLayerIndices = indices;

    for (const [layerIndex, meshList] of this.layerMeshes) {
      const visible = indices.includes(layerIndex);
      for (const mesh of meshList) {
        mesh.visible = visible;
      }
    }

    this.render(); // или await this.renderScene() — если нужна полная перерисовка
    this.eventBus.publish('selected-layers', indices);
  }

  async renderScene() {
  this.eventBus.publish('render-start', undefined);

  const { parsedModel, geomFiles, parameterData, selectedGroup, selectedDate } = this;
  if (!this.canvas || !parsedModel || !geomFiles ) return;
  
  const paramPrefix = `${selectedGroup}_${selectedDate}`;
  const useColor = !!(selectedGroup && selectedDate && parameterData?.[paramPrefix]);
  const { min, max } = findGroupMinMax(parsedModel, paramPrefix);

  for (const layerIndex of this.selectedLayerIndices) {
  const geomLayer = geomFiles[layerIndex];
  if (!geomLayer) continue;

  const hasLayerAbove = this.selectedLayerIndices.includes(layerIndex + 1);
  const hasLayerBelow = this.selectedLayerIndices.includes(layerIndex - 1);
  const layerMeshes: THREE.Mesh[] = [];

  for (const [cellKey, geomFile] of Object.entries(geomLayer)) {
    const values = parameterData?.[paramPrefix]?.[layerIndex]?.[cellKey];
    const hasValues = values && values.length > 0 && isFinite(min) && isFinite(max);
    await new Promise(requestAnimationFrame);

    const mesh = createPrismGroup(
      geomFile,
      useColor,
      hasValues ? values : null,
      min,
      max,
      hasLayerAbove,
      hasLayerBelow
    );

    layerMeshes.push(mesh);
    this.shiftGroup.add(mesh);
  }

  this.layerMeshes.set(layerIndex, layerMeshes);
}


  this.modelGroup.add(this.shiftGroup);
  this.scene.add(this.modelGroup);
  this.render();
  this.eventBus.publish('render-end', undefined);
}


  private render = () => {
    if (this.renderer && this.camera) {
      this.composer.render();
    }
  };

   handleResize = () => {
    if (!this.canvas || !this.camera || !this.renderer) return;
    this.fxaaPass.material.uniforms['resolution'].value.set(
      1 / this.canvas.clientWidth,
      1 / this.canvas.clientHeight
    );
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.render();
  };

}

function findGroupMinMax(parsedModel: ParsedModel, groupPrefix: string): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  for (const layer of parsedModel.layers) {
    for (const param of layer.prismParameters) {
      if (param.id.startsWith(groupPrefix)) {
        if (param.min < min) min = param.min;
        if (param.max > max) max = param.max;
      }
    }
  }

  return { min, max };
}

function computeBounds(model: ParsedModel): { center: [number, number, number]; size: [number, number, number] } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const layer of model.layers) {
    const { bounds } = layer;
    for (const pt of bounds.points) {
      minX = Math.min(minX, pt.x);
      maxX = Math.max(maxX, pt.x);
      minY = Math.min(minY, pt.y);
      maxY = Math.max(maxY, pt.y);
    }
    minZ = Math.min(minZ, bounds.zMin);
    maxZ = Math.max(maxZ, bounds.zMax);
  }

  return {
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    size: [maxX - minX, maxY - minY, maxZ - minZ],
  };
}

import * as THREE from 'three';
// import Stats from "three/examples/jsm/libs/stats.module";
// import {
//   GUI
// } from 'dat.gui';

//import shaders
import birdFS from './shaders/bird-FS.glsl'
import birdVS from './shaders/bird-VS.glsl'
import fragmentShaderPosition from './shaders/fragment-shader-position.glsl'
import fragmentShaderVelocity from './shaders/fragment-shader-velocity.glsl'
import GPUComputationRenderer from './distes/gpu-computation-renderer.js';

import {
  isInViewport,
  isSafari
} from './utils/function'
import BirdGeometry from './bird-geomertry';

export default class Birds {
  constructor(renderer, canvasContainer) {
    this.canvasContainer = canvasContainer
    this.renderer = renderer;
    this.mouse = {
      x: 0,
      y: 0
    }
    this.halfScreen = {
      w: this.canvasContainer.offsetWidth / 2,
      h: this.canvasContainer.offsetHeight / 2
    }
    this.BOUNDS = 800;
    this.BOUNDS_HALF = this.BOUNDS / 2;
    this.last = performance.now();
    this.WIDTH = 25;
    this.BIRDS = this.WIDTH * this.WIDTH;

    this.init()
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(75, this.canvasContainer.offsetWidth / this.canvasContainer.offsetHeight, 0.1, 3000)
    this.camera.position.z = 350;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xD8F2FF);
    this.scene.fog = new THREE.Fog(0xffffff, 100, 1000);
    if (!this.renderer) {
      this.renderer = new THREE.WebGLRenderer({
        // canvas: this.canvas,
        antialias: true,
      });
    }
    this.canvasContainer.appendChild(this.renderer.domElement)

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight);
    this.initComputeRenderer();
    // stats = new Stats();
    // container.appendChild(stats.dom);
    this.canvasContainer.style.touchAction = 'none';
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
    // const gui = new GUI();
    this.effectController = {
      separation: 20.0,
      alignment: 20.0,
      cohesion: 20.0,
      freedom: 0.75
    };
    this.valuesChanger();
    // gui controllers 👇
    // gui.add(this.effectController, 'separation', 0.0, 100.0, 1.0).onChange(valuesChanger);
    // gui.add(this.effectController, 'alignment', 0.0, 100, 0.001).onChange(valuesChanger);
    // gui.add(this.effectController, 'cohesion', 0.0, 100, 0.025).onChange(valuesChanger);
    // gui.close();
    this.initBirds();
  }

  // gui controllers 👇
  valuesChanger() {
    this.velocityUniforms['separationDistance'].value = this.effectController.separation;
    this.velocityUniforms['alignmentDistance'].value = this.effectController.alignment;
    this.velocityUniforms['cohesionDistance'].value = this.effectController.cohesion;
    this.velocityUniforms['freedomFactor'].value = this.effectController.freedom;
  };

  initBirds() {
    const geometry = new BirdGeometry(this.WIDTH);
    // For Vertex and Fragment
    this.birdUniforms = {
      'color': {
        value: new THREE.Color(0xff2200)
      },
      'texturePosition': {
        value: null
      },
      'textureVelocity': {
        value: null
      },
      'time': {
        value: 1.0
      },
      'delta': {
        value: 0.0
      }
    };

    // THREE.ShaderMaterial
    const material = new THREE.ShaderMaterial({
      uniforms: this.birdUniforms,
      vertexShader: birdVS,
      fragmentShader: birdFS,
      side: THREE.DoubleSide
    });
    const birdMesh = new THREE.Mesh(geometry, material);
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();
    this.scene.add(birdMesh);
  }

  initComputeRenderer() {
    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);
    if (isSafari()) {
      this.gpuCompute.setDataType(THREE.HalfFloatType);
    }
    const dtPosition = this.gpuCompute.createTexture();
    const dtVelocity = this.gpuCompute.createTexture();
    this.fillPositionTexture(dtPosition);
    this.fillVelocityTexture(dtVelocity);
    this.velocityVariable = this.gpuCompute.addVariable('textureVelocity', fragmentShaderVelocity, dtVelocity);
    this.positionVariable = this.gpuCompute.addVariable('texturePosition', fragmentShaderPosition, dtPosition);
    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);
    this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;
    this.positionUniforms['time'] = {
      value: 0.0
    };
    this.positionUniforms['delta'] = {
      value: 0.0
    };
    this.velocityUniforms['time'] = {
      value: 1.0
    };
    this.velocityUniforms['delta'] = {
      value: 0.0
    };
    this.velocityUniforms['testing'] = {
      value: 1.0
    };
    this.velocityUniforms['separationDistance'] = {
      value: 1.0
    };
    this.velocityUniforms['alignmentDistance'] = {
      value: 1.0
    };
    this.velocityUniforms['cohesionDistance'] = {
      value: 1.0
    };
    this.velocityUniforms['freedomFactor'] = {
      value: 1.0
    };
    this.velocityUniforms['predator'] = {
      value: new THREE.Vector3()
    };
    this.velocityVariable.material.defines.BOUNDS = this.BOUNDS.toFixed(2);
    this.velocityVariable.wrapS = THREE.RepeatWrapping;
    this.velocityVariable.wrapT = THREE.RepeatWrapping;
    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;
    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }
  }

  render() {
    const now = performance.now();
    let delta = (now - this.last) / 1000;
    if (delta > 1) delta = 1; // safety cap on large deltas
    this.last = now;
    this.positionUniforms['time'].value = now;
    this.positionUniforms['delta'].value = delta;
    this.velocityUniforms['time'].value = now;
    this.velocityUniforms['delta'].value = delta;
    this.birdUniforms['time'].value = now;
    this.birdUniforms['delta'].value = delta;
    this.velocityUniforms['predator'].value.set(0.5 * this.mouse.x / this.halfScreen.w, -0.5 * this.mouse.y / this.halfScreen.h, 0);
    this.mouse = {
      x: 10000,
      y: 10000
    }
    this.gpuCompute.compute();
    this.birdUniforms['texturePosition'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
    this.birdUniforms['textureVelocity'].value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    if (!isInViewport(this.canvasContainer)) return;
    this.render();
    // stats.update();
  }


  fillPositionTexture(texture) {
    const theArray = texture.image.data;
    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      const x = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
      const y = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
      const z = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
      theArray[k + 0] = x;
      theArray[k + 1] = y;
      theArray[k + 2] = z;
      theArray[k + 3] = 1;
    }
  }

  fillVelocityTexture(texture) {
    const theArray = texture.image.data;
    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      const x = Math.random() - 0.5;
      const y = Math.random() - 0.5;
      const z = Math.random() - 0.5;
      theArray[k + 0] = x * 10;
      theArray[k + 1] = y * 10;
      theArray[k + 2] = z * 10;
      theArray[k + 3] = 1;
    }
  }

  onWindowResize() {
    this.halfScreen = {
      w: this.canvasContainer.innerWidth / 2,
      h: this.canvasContainer.innerHeight / 2
    }
    this.camera.aspect = this.canvasContainer.offsetWidth / this.canvasContainer.offsetHeight
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight);
  }

  onPointerMove(event) {
    if (event.isPrimary === false) return;
    this.mouse = {
      x: event.clientX - this.halfScreen.w,
      y: event.clientY - this.halfScreen.h
    }
  }

}
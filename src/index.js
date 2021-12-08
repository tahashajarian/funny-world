import './style.css'
import Stats from "three/examples/jsm/libs/stats.module";
import * as THREE from 'three';
import {
	OrbitControls
} from 'three/examples/jsm/controls/OrbitControls'

class ThreeCanvases {
	constructor() {
		this.initCanvas();
		this.addCubes();
		this.addPlate();
		this.addLights();
		this.animate();

	}

	initCanvas() {
		this.canvasContainer = document.getElementById('canvas-earth-container')
		this.stats = Stats();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, this.canvasContainer.offsetWidth / this.canvasContainer.offsetHeight, 0.1, 1000)
		this.camera.position.z = 15
		this.camera.position.y = 2
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
		})
		this.canvasContainer.appendChild(this.renderer.domElement)
		this.renderer.setSize(this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.shadowMap.enabled = true;
		document.body.appendChild(this.stats.dom);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	}


	addCubes() {
		const cubeSize = 2;
		const r = 2;
		const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
		const material = new THREE.MeshPhysicalMaterial({
			color: 0x00ff00,
			// wireframe: true,
		});
		const centerCube = new THREE.Mesh(geometry, material);
		centerCube.castShadow = true;
		centerCube.receiveShadow = true;
		centerCube.position.set(0, 1, 0)
		this.cubes = new THREE.Group();

		for (let i = 0; i <= 5; i++) {
			const cube = new THREE.Mesh(geometry, material);
			cube.position.set(i + r, 1, i + r)
			this.cubes.add(cube)
		}

		this.cubes.add(centerCube)
		this.scene.add(this.cubes)
	}

	addPlate() {
		const geometry = new THREE.PlaneGeometry(30, 30);
		const material = new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			// wireframe: true,
		});
		const plane = new THREE.Mesh(geometry, material);
		plane.rotation.set(-Math.PI / 2, 0, 0)
		plane.castShadow = true;
		plane.receiveShadow = true;
		this.scene.add(plane)
	}

	addLights() {
		const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		hemiLight.color.setHSL(0.6, 1, 0.6);
		hemiLight.groundColor.setHSL(0.095, 1, 0.75);
		hemiLight.position.set(0, 50, 0);
		this.scene.add(hemiLight);
		const dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.color.setHSL(0.1, 1, 0.95);
		dirLight.position.set(-1, 1.75, 1);
		dirLight.position.multiplyScalar(30);
		this.scene.add(dirLight);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
	}

	animate() {
		requestAnimationFrame(() => {
			this.animate();
		})
		this.stats.update();
		this.renderer.render(this.scene, this.camera);
	}
}

const threeCanvases = new ThreeCanvases();
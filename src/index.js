import './style.css'
import Stats from "three/examples/jsm/libs/stats.module";
import * as THREE from 'three';
import {
	OrbitControls
} from 'three/examples/jsm/controls/OrbitControls'


const VS = `				
varying vec3 v_Normal;
	void main() {
		gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position , 1.0);
		v_Normal = normal;
	}
`

const FS = `
	varying vec3 v_Normal;
	uniform vec3 sphereColor;
	void main() {
		// gl_FragColor = vec4(v_Normal, 0.5);
		gl_FragColor = vec4(sphereColor, 1);
	}
`



class ThreeCanvases {
	constructor() {
		this.initCanvas();
		this.addCubes();
		this.addPlane();
		this.addLights();
		this.enableListeners();
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
			alpha: 0.5,
		})
		this.canvasContainer.appendChild(this.renderer.domElement)
		this.renderer.setSize(this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.shadowMap.enabled = true;
		document.body.appendChild(this.stats.dom);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.totalTime = 0.0;
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

		// for (let i = 0; i <= 5; i++) {
		// 	const cube = new THREE.Mesh(geometry, material);
		// 	cube.position.set(i + r, 1, i + r)
		// 	this.cubes.add(cube)
		// }

		this.cubes.add(centerCube)
		// this.scene.add(this.cubes)
	}

	addPlane() {
		const planeSize = 10;
		this.planeGeometry = new THREE.SphereBufferGeometry(5, 32, 32);
		// const material = new THREE.MeshPhongMaterial({
		// 	color: 0x0000ff,
		// 	side: THREE.DoubleSide,
		// 	// wireframe: true,
		// });
		this.sphereMaterial = new THREE.ShaderMaterial({
			color: 0x00ff00,
			vertexShader: VS,
			fragmentShader: FS,
			wireframe: false,
			uniforms: {
				sphereColor: {
					value: new THREE.Vector3(0, 0, 1)
				}
			}
		});
		this.plane = new THREE.Mesh(this.planeGeometry, this.sphereMaterial);
		this.plane.rotation.set(-Math.PI / 2, 0, 0)
		this.planePointes = this.planeGeometry.attributes.position.count;
		this.scene.add(this.plane);
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
		const now = Date.now() / 300;
		this.stats.update();
		this.renderer.render(this.scene, this.camera);
		// 	for (let i = 0; i < this.planePointes; i++) {
		// 		const x = this.planeGeometry.attributes.position.getX(i)
		// 		const y = this.planeGeometry.attributes.position.getY(i)
		// 		const sinX = Math.sin(x + now) * 0.5;
		// 		const cosY = Math.cos(y + now) * 0.5;

		// 		this.planeGeometry.attributes.position.setZ(i, sinX + cosY)
		// 		this.planeGeometry.attributes.position.needsUpdate = true;
		// 		this.planeGeometry.computeVertexNormals();
		// 	}
		const v = Math.sin(now) * 0.5 + 0.5
		const c1 = new THREE.Vector3(1, 0, 0);
		const c2 = new THREE.Vector3(0, 1, 0);
		const sphereColor = c1.lerp(c2, v);
		this.sphereMaterial.uniforms.sphereColor.value = sphereColor;
	}

	enableListeners() {
		window.addEventListener('resize', () => {
			this.renderer.setSize(this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight)
			this.camera.aspect = this.canvasContainer.offsetWidth / this.canvasContainer.offsetHeight
			this.camera.updateProjectionMatrix()
		})
	}
}

const threeCanvases = new ThreeCanvases();
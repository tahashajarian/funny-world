import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import vertexShaderAtmespher from './shaders/vertexAtmespher.glsl'
import fragmentShaderAtmespher from './shaders/fragmentAtmespher.glsl'
import gsap from 'gsap';
import {
	isInViewport
} from './utils/function';


export default class Earth {
	constructor(renderer, canvasContainer) {
		this.renderer = renderer
		this.canvasContainer = canvasContainer
		this.init()
		// this.canvas = document.querySelector('#canvas-earth');
	}

	init() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, this.canvasContainer.offsetWidth / this.canvasContainer.offsetHeight, 0.1, 1000)
		this.camera.position.z = 15
		if (!this.renderer) {
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				// canvas: this.canvas
			})
		}
		this.canvasContainer.appendChild(this.renderer.domElement)
		this.mouse = {
			x: 0,
			y: 0
		}
		this.renderer.setSize(this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.createEarth()
		this.addStarts()
		this.initEvents()
		this.createFog();
		this.createLight()
	}

	createEarth() {
		this.earth = new THREE.Mesh(
			new THREE.SphereGeometry(5, 50, 50),
			// new THREE.MeshBasicMaterial({
			//   // color: 0xff0000
			//   map: new THREE.TextureLoader().load(
			//     'assets/images/earth.jpg'
			//   )
			// }),
			new THREE.ShaderMaterial({
				vertexShader,
				fragmentShader,
				uniforms: {
					globeTexture: {
						value: new THREE.TextureLoader().load(
							'assets/images/earth.jpg'
						)
					}
				}
			})
		)
		this.atmespher = new THREE.Mesh(
			new THREE.SphereGeometry(5, 50, 50),
			// new THREE.MeshBasicMaterial({
			//   // color: 0xff0000
			//   map: new THREE.TextureLoader().load(
			//     'assets/images/earth.jpg'
			//   )
			// }),
			new THREE.ShaderMaterial({
				vertexShader: vertexShaderAtmespher,
				fragmentShader: fragmentShaderAtmespher,
				blending: THREE.AdditiveBlending,
				side: THREE.BackSide,
				uniforms: {
					globeTexture: {
						value: new THREE.TextureLoader().load(
							'assets/images/earth.jpg'
						)
					}
				},
				transparent: true
			})
			
		)

		const materialClouds = new THREE.MeshLambertMaterial({

			map: new THREE.TextureLoader().load("assets/images/cloud.png"),
			transparent: true
		});

		this.meshClouds = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50), materialClouds);
		this.meshClouds.scale.set(1.02, 1.02, 1.02);
		this.meshClouds.rotation.z = 0.41;
		// this.scene.add(meshClouds);


		this.atmespher.scale.set(1.2, 1.2, 1.2);
		this.earthGroup = new THREE.Group();
		this.earthGroup.add(this.earth, this.atmespher, this.meshClouds)
		this.scene.add(this.earthGroup)
		// this.scene.add(this.earth)
		// this.scene.add(this.atmespher)
	}

	createLight() {
		this.dirLight = new THREE.HemisphereLight(0xffffff);
		this.dirLight.position.set(-1, 0, 1).normalize();
		this.scene.add(this.dirLight);
	}

	addStarts() {
		const startGeometry = new THREE.BufferGeometry();
		const startMaterial = new THREE.PointsMaterial({
			color: 0xffffff
		})
		const starVertices = []

		for (let i = 0; i < 10000; i++) {
			const x = (Math.random() - 0.5) * 2000;
			const y = (Math.random() - 0.5) * 2000;
			const z = (Math.random() - 0.5) * 2000;
			// const z = -(Math.random()) * 3500;
			starVertices.push(x, y, z)
		}
		startGeometry.setAttribute(
			'position', new THREE.Float32BufferAttribute(starVertices, 3)
		)
		this.stars = new THREE.Points(startGeometry, startMaterial);
		this.scene.add(this.stars)
	}

	createFog() {
		this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
	}

	initEvents() {
		window.addEventListener(
			"resize",
			this.onWindowResize.bind(this),
			false
		);
		window.addEventListener(
			"mousemove",
			this.onMouseOver.bind(this),
			false
		);
	}


	animate() {

		if (!isInViewport(this.canvasContainer)) return;


		this.renderer.render(this.scene, this.camera)
		this.earth.rotation.x += 0.0004;
		this.earth.rotation.y += 0.0004;
		this.meshClouds.rotation.x += 0.0004;
		this.meshClouds.rotation.y += 0.0008;
		this.stars.rotation.x += 0.00001;
		this.stars.rotation.y += 0.00001;
		this.stars.rotation.z += 0.00001;

		//
		// this.earthGroup.rotation.x = this.mouse.y
		gsap.to(
			this.earthGroup.rotation, {
				y: this.mouse.x * 0.5,
				x: -this.mouse.y * 0.5,
				duration: 2
			}
		)
		this.earthGroup.rotation.y = this.mouse.x * 0.5
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	onMouseOver({
		clientX,
		clientY
	}) {
		this.mouse = {
			x: (clientX / innerWidth) * 2 - 1,
			y: (clientY / innerHeight) * 2 + 1
		}
	}

}
import Earth from './earth'
import Birds from './birds'
import './style.css'

import Stats from "three/examples/jsm/libs/stats.module";


import * as THREE from 'three';





class ThreeCanvases {
	constructor() {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
		})
		this.stats = Stats();
		this.birdCanvas = document.querySelector('#canvas-birds-container');
		this.earthCanvas = document.querySelector('#canvas-earth-container');
		this.initCanvas();
		this.animate();
		document.body.appendChild(this.stats.dom);

	}
	initCanvas() {
		this.earth = new Earth(undefined, this.earthCanvas);
		this.birds = new Birds(undefined, this.birdCanvas);
	}
	animate() {
		requestAnimationFrame(() => {
			this.animate();
		})
		this.stats.update();
		this.birds.animate();
		this.earth.animate();
		// this.renderer.render(this.birds.scene, this.birds.camera)
		// this.renderer.render(this.earth.scene, this.earth.camera)

	}
}

const threeCanvases = new ThreeCanvases();
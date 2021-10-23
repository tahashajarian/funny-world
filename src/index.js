import Earth from './earth'
import Birds from './birds'
import './style.css'
import {
	isInViewport
} from './utils/function';

import * as THREE from 'three';





class ThreeCanvases {
	constructor() {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
		})
		this.birdCanvas = document.querySelector('#canvas-birds-container');
		this.earthCanvas = document.querySelector('#canvas-earth-container');
		this.initCanvas();
		this.animate();
	}
	initCanvas() {
		this.earth = new Earth(undefined, this.earthCanvas);
		this.birds = new Birds(undefined, this.birdCanvas);
	}
	animate() {
		requestAnimationFrame(() => {
			this.animate();
		})
		this.birds.animate();
		this.earth.animate();
		// this.renderer.render(this.birds.scene, this.birds.camera)
		// this.renderer.render(this.earth.scene, this.earth.camera)

	}
}

const threeCanvases = new ThreeCanvases();
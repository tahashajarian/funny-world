import * as THREE from 'three';

export default cubeCreator = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });
  const Cube = new THREE.Mesh(geometry, material);
  return Cube;
}
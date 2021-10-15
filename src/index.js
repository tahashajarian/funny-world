import * as THREE from 'three';
import './style.css';
import cloud from './cloud.png'

function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = 'Hello Taha';
  const image = new Image();
  image.src = cloud;
  element.append(image)
  return element;
}

document.body.appendChild(component());
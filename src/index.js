import * as THREE from 'three';
import './style.css';
// import cloud from 'assets/images/cloud.png'

function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = 'Hello Taha ';
  element.className = 'text-red-500';
  const image = new Image();
  image.src = 'assets/images/cloud.png';
  element.append(image)
  return element;
}

document.body.appendChild(component());
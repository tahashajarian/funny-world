varying vec4 vColor;
varying float z;

uniform vec3 color;

void main() {
				// Fake colors for now
    float z2 = 0.2 + (1000. - z) / 1000. * vColor.x - 0.2;
    gl_FragColor = vec4(z2, z2, z2, 1.);

}

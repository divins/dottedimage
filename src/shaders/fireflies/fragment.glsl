uniform vec3 uColor;
uniform float uPositionBasedColor;

varying vec3 vPosition;

void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - (0.05 * 2.0);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // gl_PointCoord gives us the UVs of the Point
    vec3 color = mix(uColor, vPosition, uPositionBasedColor);
    gl_FragColor = vec4(color, strength);
}
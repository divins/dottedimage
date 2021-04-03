uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += sin(modelPosition.z * 100.0 + uTime) * aScale * 0.7 * 0.2;
    modelPosition.x += sin(modelPosition.z * 100.0 + uTime * 5.0) * aScale * 0.008;
    modelPosition.z += cos(modelPosition.z * 100.0 + uTime * 5.0) * aScale * 0.005;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;
    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / -viewPosition.z);
}
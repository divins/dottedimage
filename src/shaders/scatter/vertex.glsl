varying vec3 vPosition;
uniform float uTime;
attribute vec3 aRandomness;
uniform float uScale;

void main() {

    vec3 newPosition = position;

    newPosition.y += aRandomness.x * 0.01;
    newPosition.x += aRandomness.y * 0.01;
    newPosition.z += aRandomness.z * 0.005;

    float time = uTime * 4.0;

    newPosition.y += sin(time * aRandomness.x) * 0.01;
    newPosition.x += cos(time * aRandomness.y) * 0.01;
    newPosition.z += cos(time * aRandomness.z) * 0.005;

    newPosition.x *= uScale + (sin(newPosition.y * 4.0 + time) * (1.0 - uScale));
    newPosition.y *= uScale + (cos(newPosition.z * 4.0 + time) * (1.0 - uScale));
    newPosition.z *= uScale + (cos(newPosition.x * 4.0 + time) * (1.0 - uScale));

    newPosition *= uScale;

    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
    //gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 8.0 / -mvPosition.z;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    // newPosition.x = 0.0; // flat skull!

    
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    //gl_PointSize = 8.0/ viewPosition.z;

    vPosition = position;
}
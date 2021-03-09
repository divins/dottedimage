uniform float uSize;
attribute float aScale;
uniform float uTime;
uniform float uZDisplacement;

varying vec3 vColor;

void main(){
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.z += sin(aScale * 10.0 - uTime) * uZDisplacement;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Size
    if(uZDisplacement == 0.0){
        gl_PointSize = uSize * aScale * abs(sin(aScale * 10.0 - uTime*0.5));
    } else {
        gl_PointSize = uSize * aScale;
    }

    vColor = color;
}
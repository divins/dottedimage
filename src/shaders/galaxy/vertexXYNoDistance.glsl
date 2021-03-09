uniform float uSize;
attribute float aScale;
uniform float uTime;
attribute vec3 aRandomness;
uniform float uSpinVelocity;

varying vec3 vColor;

void main(){
    /**
    * Position
    */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xy);
    float angleOffset = (1.0 / distanceToCenter) * uTime * uSpinVelocity;
    angle += angleOffset;

    // Tube
    modelPosition.x = cos(angle);
    modelPosition.y = sin(angle);

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    /**
    * Size
    */
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = color;
}
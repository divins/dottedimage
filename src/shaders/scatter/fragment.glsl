varying vec3 vPosition;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
    vec3 color = vec3(1.0, 0.0, 0.0);
    color = vec3(1.0, 1.0, 0.0);
    color.g = 0.0;
    color.b = 1.0;

    color = vPosition;

    float normalizedPosition = vPosition.z * 0.5 + 0.5;
    color = mix(uColor1, uColor2, normalizedPosition);
    float alpha = vPosition.z * 0.5 + 0.5;
    alpha = alpha * 0.5 + 0.15;

    gl_FragColor = vec4(color, alpha);
}
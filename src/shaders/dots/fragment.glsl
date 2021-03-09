varying vec3 vColor;

void main(){
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 5.0);
    strength = step(0.5, strength);

    vec3 color = vec3(strength) * vColor;

    gl_FragColor = vec4(color, 1.0);
}
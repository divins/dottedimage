varying float vElevation;
uniform sampler2D uTexture;
uniform float uTextureMultiplier;

void main(){
    vec4 textureColor = texture2D(uTexture, vec2(0.0, vElevation * uTextureMultiplier));

    /* vec3 color = vec3(vElevation + 0.5);
    float alpha = mod(vElevation * 30.0, 1.0);
    alpha = step(0.9, alpha);
    gl_FragColor = vec4(color, alpha); */

    gl_FragColor = textureColor;
}
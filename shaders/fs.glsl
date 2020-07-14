#version 300 es

precision mediump float;

in vec4 finalColor;
in vec2 uvFS;
in vec3 specular;
out vec4 outColor;



uniform sampler2D u_texture;



void main() {
    vec4 color = vec4(finalColor.rgb, 0.9);
    vec4 outColorfs = texture(u_texture,uvFS) * color;
    outColor = outColorfs + vec4(specular,0.0);
    

}
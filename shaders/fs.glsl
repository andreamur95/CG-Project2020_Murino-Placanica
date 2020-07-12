#version 300 es

precision mediump float;

in vec2 uvFS;
in vec3 fsNormal;

out vec4 outColor;

uniform sampler2D u_texture;
uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color 


void main() {
    vec3 nNormal = normalize(fsNormal); // usa la normalize function perché possono succedere schifezze nel passaggio
    vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirection,nNormal);

    outColor =  vec4(clamp(lambertColor, 0.0, 1.0),1.0) * texture(u_texture, uvFS) ;
    

}
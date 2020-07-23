#version 300 es

precision mediump float;

in vec4 finalColor; 
in vec2 uvFS;
in vec3 specular;

out vec4 outColor;



uniform sampler2D u_texture; // the texture of the object



void main() {
    
    //this is the finalColor accounting for the ambient and the diffuse terms where we add the alpha value.
    vec4 color = vec4(finalColor.rgb, 0.9);  
    vec4 outColorfs = texture(u_texture,uvFS) * color; // we consider the texture in addition to the color of the object

    /* finally we compute the final color by adding the specular component received by the vertex shader in addition to the
        the ones already present */
    outColor = outColorfs + vec4(specular,0.0);
    

}
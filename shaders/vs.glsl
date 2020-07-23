#version 300 es
// The attributes
in vec3 a_position;
in vec3 inNormal;
in vec2 a_uv;

// These are varyings we pass to the fragment shader
out vec4 finalColor;
out vec2 uvFS;
out vec3 specular;

// Here we have the uniforms
uniform mat4 matrix; // this is the worldviewprojection matrix

uniform mat4 worldmatrix; // the world matrix

/* Since we have scale modifications on the object instead of use directly the world matrix, we use its inverse transpose */
uniform mat4 nMatrix; // matrix to transform normals

uniform vec3 specularColor; // specular color
uniform float SpecShine; // specular shining constant
uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightDirection; // directional light direction vector
uniform vec3 lightColor; //directional light color for diffuse
uniform vec3 ambientLightcolor; // ambient light color

uniform vec3 eyePos; //viewer position


void main() {
    /* Since we are in World space, we have to transform vertex position and vertex normals in world space since they
                                            are usually in local space                                                */
    
    vec3 fsNormal = mat3(nMatrix) * inNormal; // Here we transform the normals
    uvFS = a_uv;

    /*  DIFFUSE */
    vec3 diffuse = mDiffColor * clamp(dot(normalize(fsNormal), lightDirection), 0.0, 1.0);

    /*  SPECULAR */
    //in world space eyePos = [cx,cy,cz] so eyeDir = normalize(eyePos -inPosition)
    //inPosition is in object space, so we have to pass a world matrix to multiply
	vec3 eyeDir = normalize(eyePos - (worldmatrix * vec4(a_position,1.0)).xyz);
    /* We compute the reflected vector by using the built-in function reflect, we add a minus because GLSL reflect
        in the opposite way                                                                                         */
	vec3 reflectDir = normalize(-reflect(lightDirection, fsNormal));
    
    /* this is the computation of the specular light that we pass to the fragment shader in which we compute the intensity
    of the specular reflection                                                                  */
    specular = specularColor * pow(clamp(dot(eyeDir, reflectDir), 0.0, 1.0), SpecShine);
    // we pass to the fragment shader the color accounting for the ambient light and the diffuse one
    finalColor = vec4(clamp((diffuse * lightColor) + ambientLightcolor, 0.0, 1.0),1.0);

    gl_Position = matrix * vec4(a_position, 1.0);
}

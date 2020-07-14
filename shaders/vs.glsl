#version 300 es

in vec3 a_position;
in vec3 inNormal;
in vec2 a_uv;

//out vec3 fsNormal;
out vec4 finalColor;
out vec2 uvFS;
out vec3 specular;

uniform mat4 matrix;
//uniform mat4 nMatrix;
uniform mat4 worldviewmatrix;
uniform mat4 worldviewmatrix_t;
uniform vec3 specularColor;
uniform float SpecShine;
uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color 
uniform vec3 ambientLightcolor;

void main() {
    // gl_Position is a special variable 
    // the Vertex Shader
    // is responsible for setting it 
    vec3 fsNormal = mat3(worldviewmatrix_t) * inNormal;
    uvFS = a_uv;
    // diffuse 
    vec3 diffuse = mDiffColor * clamp(dot(normalize(fsNormal), lightDirection), 0.0, 1.0);

    // specular
    //in camera space eyePos = [0,0,0] so eyeDir = normalize(-inPosition)
    //inPosition è in object space quindi dobbiamo passare una matrice worldview da moltiplicare
	vec3 eyeDir = normalize( - (worldviewmatrix * vec4(a_position,1.0)).xyz);
	vec3 reflectDir = normalize(-reflect(lightDirection, fsNormal));
    specular = specularColor * pow(clamp(dot(eyeDir, reflectDir), 0.0, 1.0),SpecShine);
    finalColor = vec4(clamp((diffuse * lightColor) + ambientLightcolor, 0.0, 1.0),1.0);
    gl_Position = matrix * vec4(a_position, 1.0);
}
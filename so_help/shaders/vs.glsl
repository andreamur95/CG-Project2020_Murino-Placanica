#version 300 es

in vec3 a_position;
in vec3 inNormal;
in vec2 a_uv;

out vec3 fsNormal;
out vec2 uvFS;

uniform mat4 matrix;
uniform mat4 nMatrix;

void main() {
    // gl_Position is a special variable 
    // the Vertex Shader
    // is responsible for setting it 
    fsNormal = mat3(nMatrix) * inNormal;
    uvFS = a_uv;
    gl_Position = matrix * vec4(a_position,1.0);
}
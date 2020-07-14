#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec3 a_position;
in vec2 a_uv;

out vec2 uvFS;

uniform mat4 matrix;
// all shaders have a main function
void main() {

  uvFS = a_uv;
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = matrix * vec4(a_position,1.0);
}
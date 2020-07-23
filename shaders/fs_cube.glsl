#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// the input is actually the output of the vertex shader

in vec3 pos_col;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant 
  outColor = vec4(0.2, 0.8, 1.0 , 1.5-pos_col.y); 
  // we modify alpha with interpolation of the y-position
}
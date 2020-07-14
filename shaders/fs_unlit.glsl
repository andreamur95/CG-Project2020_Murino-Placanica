#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

in vec2 uvFS;
out vec4 outColor;

uniform sampler2D u_texture;

// we need to declare an output for the fragment shader


void main() {
  // Just set the output to a constant 
  outColor = texture(u_texture, uvFS);
}
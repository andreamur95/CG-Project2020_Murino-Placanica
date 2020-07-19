#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// the input is actually the output of the vertex shader

in vec3 pos_col;

// we need to declare an output for the fragment shader
// può essere usato al posto del frag_color, l'importante è che però sia un vec4!!
out vec4 outColor;

void main() {
  // Just set the output to a constant 
  outColor = vec4(0.2, 0.8, 1.0 , 1.5-pos_col.y); 
  // red e green è dato da pos_col, mentre il blue è dato dalla somma della x e della y, infine alpha è 1
}
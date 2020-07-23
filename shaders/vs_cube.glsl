#version 300 es


// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
// "in" specify that we are specifying the attribute
in vec3 a_position;

out vec3 pos_col; // this is our varying variable (used to color vertex by interpolation)

uniform mat4 matrix;

// all shaders have a main function
void main() {


  pos_col = a_position;

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  // it is the position of the vertex in CLIP SPACE COORDINATES
  gl_Position = matrix * vec4(a_position, 1.0); // a_position is composed by 3 elements.
  //  gl_position is defined as vec4 because it is in clipSpace (x,y,z,w), so that we have to be coherent.
 
}
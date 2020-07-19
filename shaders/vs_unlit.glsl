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
  gl_Position = matrix * vec4(a_position, 1.0); // questa volta dobbiamo creare il vec4 perché a_position è fatto da 3 elementi
  // ricorda che gl_position è definito come un vec4 perché è in clipSpace (x,y,z,w) ecco perchè devi rimanere coerente!
  // il terzo elemento è la z-coordinate e l'ultimo elemento è w 
}
var program0;
var program1;
var gl;
var shaderDir;
var baseDir;
var boatModel;
var rockModel;
var rock2Model;

var vaos = new Array();
var textures = new Array();
var modelStr = Array();
var modelTexture = Array();

modelStr[0] = 'Assets/Boat/Boat.obj';
modelStr[1] = 'Assets/Rocks/Rock1/rock1.obj';
modelStr[2] = 'Assets/Rocks/Rock2/Rock_1.obj';

modelTexture[0] = 'Assets/Boat/textures/boat_diffuse.bmp';
modelTexture[1] = 'Assets/Rocks/Rock1/textures/rock_low_Base_Color.png';
modelTexture[2] = 'Assets/Rocks/Rock2/Rock_1_Tex/Rock_1_Base_Color.jpg';

/***********************************************************************************************/

class Item {
  x; y; z;
  Rx; Ry; Rz;
  S;

  vertices;
  normals;
  indices;
  texCoords;

  materialColor;


  constructor(x, y, z, Rx, Ry, Rz, S) {

    this.x = x;
    this.y = y;
    this.z = z;
    this.Rx = Rx;
    this.Ry = Ry;
    this.Rz = Rz;
    this.S = S;



  }

  buildWorldMatrix() {
    return utils.MakeWorld(this.x, this.y, this.z, this.Rx, this.Ry, this.Rz, this.S);

  }


  setAttr(objectVertices, objectNormals, objectIndices, objectTexCoords) {
    this.vertices = objectVertices;
    this.normals = objectNormals;
    this.indices = objectIndices;
    this.texCoords = objectTexCoords;

  }

  setMaterialColor(materialColorArray) {
    this.materialColor = materialColorArray;

  }


}


function main() {

  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);



  var lastUpdateTime = (new Date).getTime();

  var rock = new Item(4.0, 0.0, 0.7, 0.0, 0.0, 0.0, 1.0 / 10.0);
  var boat = new Item(0.0, -1.5, 0.0, 90.0, 45.0, 0.0, 1.0 / 500.0);
  var rock2 = new Item(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0 / 10);

  var aspect_ratio = gl.canvas.width * 1.0 / gl.canvas.height;

  /* FLOOR */
  var floorPositions = [
    -0.3, 0.8 * aspect_ratio, -1.0,
    0.3, 0.8 * aspect_ratio, -1.0,
    1.5, -1.0 * aspect_ratio, -1.0,
    -1.5, -1.0 * aspect_ratio, -1.0
  ];

  var floorIndices = [0, 1, 2, 3];

  

  /* Load corresponding information from the models */

  boat.setAttr(boatModel.vertices, boatModel.vertexNormals, boatModel.indices, boatModel.textures);
  rock.setAttr(rockModel.vertices, rockModel.vertexNormals, rockModel.indices, rockModel.textures);
  rock2.setAttr(rock2Model.vertices, rock2Model.vertexNormals, rock2Model.indices, rock2Model.textures);
  boat.setMaterialColor([1.0, 1.0, 1.0]); // set material color for boat
  rock.setMaterialColor([1.0, 1.0, 1.0]); // set material color for rock
  rock2.setMaterialColor([1.0, 1.0, 1.0]);

  var object = [];
  object[0] = boat;
  object[1] = rock;
  object[2] = rock2;


  //define directional light
  var dirLightAlpha = -utils.degToRad(60);
  var dirLightBeta = -utils.degToRad(120);

  var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
  Math.sin(dirLightAlpha),
  Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
  ];

  var directionalLightColor = [1.0, 1.0, 1.0];


  /* Retrieve the position of the attributes and uniforms */

  var positionAttributeLocation = new Array();
  var uvAttributeLocation = new Array();
  var matrixLocation = new Array();
  var textLocation = new Array();
  var normalAttributeLocation = new Array();
  var materialDiffColorHandle = new Array();
  var lightDirectionHandle = new Array();
  var lightColorHandle = new Array();
  var normalMatrixPositionHandle = new Array();

  positionAttributeLocation[0] = gl.getAttribLocation(program0, "a_position");
  uvAttributeLocation[0] = gl.getAttribLocation(program0, "a_uv");
  matrixLocation[0] = gl.getUniformLocation(program0, "matrix");
  textLocation[0] = gl.getUniformLocation(program0, "u_texture");
  normalAttributeLocation[0] = gl.getAttribLocation(program0, "inNormal");
  materialDiffColorHandle[0] = gl.getUniformLocation(program0, 'mDiffColor');
  lightDirectionHandle[0] = gl.getUniformLocation(program0, 'lightDirection');
  lightColorHandle[0] = gl.getUniformLocation(program0, 'lightColor');
  normalMatrixPositionHandle[0] = gl.getUniformLocation(program0, 'nMatrix');

  positionAttributeLocation[1] = gl.getAttribLocation(program1, "a_position");
  matrixLocation[1] = gl.getUniformLocation(program1, "matrix");
  var colorLocation = gl.getUniformLocation(program1, "u_color");


  objectWorldMatrix = new Array();

  objectWorldMatrix[0] = boat.buildWorldMatrix(); //boat WorldMatrix
  objectWorldMatrix[1] = rock.buildWorldMatrix(); //rock WorlMatrix
  objectWorldMatrix[2] = rock2.buildWorldMatrix();


  var perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
  var viewMatrix = utils.MakeView(0.0, 0.0, 3.0, 0.0, 0.0);


  /* SET BUFFERS FOR THE FLOOR */

  vaos[4] = gl.createVertexArray();
  gl.bindVertexArray(vaos[4]);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorPositions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[1]);


  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(positionAttributeLocation[1], 3, gl.FLOAT, false, 0, 0);

  /* SET BUFFERS FOR THE BOAT AND THE ROCKS */

  for (i = 0; i < object.length; i++) {

    vaos[i] = gl.createVertexArray();
    gl.bindVertexArray(vaos[i])

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object[i].vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation[0]);
    gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object[i].texCoords), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttributeLocation[0]);
    gl.vertexAttribPointer(uvAttributeLocation[0], 2, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object[i].indices), gl.STATIC_DRAW);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object[i].normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation[0]);
    gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

    textures[i] = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[i]);

    image = new Image();
    image.crossOrigin = "anonymous";
    image.src = baseDir + modelTexture[i];

    image.onload = function (texture, image) {
      return function () {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
    }(textures[i], image);

  }

  drawScene();

  function animate() {
    var currentTime = (new Date).getTime();
    if (lastUpdateTime != null) {
      console.log(currentTime - lastUpdateTime);
      var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
      rock.z += 0.01;
      rock.Rx += 0.01;
      rock.Ry += 0.01;
      rock.Rz -= 0.01;
      //item.Rz += deltaC;
    }

    /* depending on which object we want to animate we change the worldmatrix of the object */
    //objectWorldMatrix[0] = utils.MakeWorld(0.0, item.y, item.z, item.Rx, item.Ry, item.Rz, item.S);

    objectWorldMatrix[1] = rock.buildWorldMatrix();

    
    //objectWorldMatrix[1] = rock.buildWorldMatrix();
    //objectWorldMatrix[2] = rock2.buildWorldMatrix();
    lastUpdateTime = currentTime;
  }

  function drawScene() {

    //animate();

    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // DRAW THE FLOOR
    gl.useProgram(program1);
    

    var color = [0.0, 0.0, 0.3, 1.0];
    gl.uniform4fv(colorLocation, color);

    gl.bindVertexArray(vaos[4]);
    gl.drawElements(gl.TRIANGLE_FAN, floorIndices.length, gl.UNSIGNED_SHORT, 0);

    // DRAW THE OBJECTS IN THE SCENE

    for (i = 0; i < object.length; ++i) {
      gl.useProgram(program0);
      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, objectWorldMatrix[i]);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(projectionMatrix));

      gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(objectWorldMatrix[i]))));

      gl.uniform3fv(materialDiffColorHandle[0], object[i].materialColor);
      gl.uniform3fv(lightColorHandle[0], directionalLightColor);
      gl.uniform3fv(lightDirectionHandle[0], directionalLight);


      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.uniform1i(textLocation[i], textures[i]);


      gl.bindVertexArray(vaos[i]);
      gl.drawElements(gl.TRIANGLES, object[i].indices.length, gl.UNSIGNED_SHORT, 0);

    }

    window.requestAnimationFrame(drawScene);
  }


}

async function init() {

  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";

  var canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }

  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program0 = utils.createProgram(gl, vertexShader, fragmentShader);

  });

  await utils.loadFiles([shaderDir + 'vs_unlit.glsl', shaderDir + 'fs_unlit.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    program1 = utils.createProgram(gl, vertexShader, fragmentShader);
  });



  //###################################################################################
  //This loads the obj model in the boatModel variable
  var boatObjStr = await utils.get_objstr(baseDir + modelStr[0]);
  boatModel = new OBJ.Mesh(boatObjStr);
  //###################################################################################

  //###################################################################################
  //This loads the obj model in the rockModel variable
  var rockObjStr = await utils.get_objstr(baseDir + modelStr[1]);
  rockModel = new OBJ.Mesh(rockObjStr);
  //###################################################################################

  //###################################################################################
  //This loads the obj model in the rockModel variable
  var rock2ObjStr = await utils.get_objstr(baseDir + modelStr[1]);
  rock2Model = new OBJ.Mesh(rock2ObjStr);
  //###################################################################################


  main();
}



window.onload = init;
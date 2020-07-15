var program0;
var program1;
var gl;
var shaderDir;
var baseDir;
var lastUpdateTime;

var boatModel;
var rockModel;
var rock2Model;
var oceanModel;

//floor
var floorPositions;
var floorIndices;
var floorTextureCoordinates;



var object = [];

//attributes and uniforms
var positionAttributeLocation = Array();
var uvAttributeLocation = Array();
var matrixLocation = Array();
var textLocation = Array();
var normalAttributeLocation = Array();
var normalMatrixPositionHandle = Array();
var worldViewMatrixLocation = Array();
var worldViewMatrixLocation_transpose = Array();

var materialDiffColorHandle = Array();
var lightDirectionHandle = Array();
var lightColorHandle = Array();
var ambientLightcolorHandle = Array();
var specularColorHandle = Array();
var specShineHandle = Array();


var vaos = new Array();
var textures = new Array();
var modelStr = Array();
var modelTexture = Array();

//matrices
var viewMatrix;
var perspectiveMatrix;

//lights
//define directional light
var dirLightAlpha = -utils.degToRad(180);
var dirLightBeta = -utils.degToRad(100);
var directionalLight;
var directionalLightColor;
var ambientLight = [0.5, 0.5, 0.5];
var specularColor = [0.0, 0.0, 0.0];
var specShine = 0.0;

//camera
var cx = 0;
var cy = 0;
var cz = 1;
var camAngle = 0;
var camElev = 5;

//boat kinematics
var linearDir = 0;
var linearVel = 0;
var velX = 0;
var velZ = 0;
var maxLinearVel = 0.01;
var linearAcc = 0.0001;
var linearDrag = 0.005;

var turningDir = 0;
var angularVel = 0.0;
var maxAngularVel = 0.2;
var angularAcc = 0.01;
var angularDrag = 0.01;

modelStr[0] = 'Assets/Boat/Boat.obj';
modelStr[1] = 'Assets/Rocks/Rock1/rock1.obj';
modelStr[2] = 'Assets/Rocks/Rock2/Rock_1.obj';
modelStr[3] = 'Assets/ocean-obj/ocean.obj';
//modelStr[3] = 'Assets/ocean2/hdri-ca-sky.obj';

modelTexture[0] = 'Assets/Boat/textures/boat_diffuse.bmp';
modelTexture[1] = 'Assets/Rocks/Rock1/textures/rock_low_Base_Color.png';
modelTexture[2] = 'Assets/Rocks/Rock2/Rock_1_Tex/Rock_1_Base_Color.jpg';
modelTexture[3] = 'Assets/ocean-obj/woter.jpg';
//modelTexture[3] = 'Assets/ocean2/CA-Sky-2016-04-15-11-30-am.jpg';

modelTexture[4] = 'Assets/Sea/sea.jpg'

var nFrame = 0;


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

//objects
var rock = new Item(1.0, -0.5, -3.0, 0.0, 0.0, 0.0, 1.0 / 20.0);
var boat = new Item(0.0, -0.15, 0.0, 90.0, 0.0, 0.0, 1.0 / 1000.0);
var rock2 = new Item(-1.0, -0.4, -3, -30.0, 0.0, 0.0, 1.0 / 10.0);
var ocean = new Item(0.0, -0.02, 0.0, 90.0, 0.0, 0.0, 100.0);

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function main() {

  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  setFloorCoord();
  /* Load corresponding information from the models */
  object[0] = boat;
  object[1] = rock;
  object[2] = rock2;
  object[3] = ocean;

  boat.setAttr(boatModel.vertices, boatModel.vertexNormals, boatModel.indices, boatModel.textures);
  boat.setMaterialColor([1.0, 1.0, 1.0]); // set material color for boat

  rock.setAttr(rockModel.vertices, rockModel.vertexNormals, rockModel.indices, rockModel.textures);
  rock.setMaterialColor([1.0, 1.0, 1.0]); // set material color for rock

  rock2.setAttr(rock2Model.vertices, rock2Model.vertexNormals, rock2Model.indices, rock2Model.textures);
  rock2.setMaterialColor([1.0, 1.0, 1.0]);

  ocean.setAttr(oceanModel.vertices, oceanModel.vertexNormals, oceanModel.indices, oceanModel.textures);
  ocean.setMaterialColor([1.0, 1.0, 1.0]);



  directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
  Math.sin(dirLightAlpha),
  Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
  ];
  directionalLightColor = [1.0, 1.0, 1.0];

  /* Retrieve the position of the attributes and uniforms */
  getShadersPos()

  objectWorldMatrix = Array();

  objectWorldMatrix[0] = boat.buildWorldMatrix(); //boat WorldMatrix
  objectWorldMatrix[1] = rock.buildWorldMatrix(); //rock WorlMatrix
  objectWorldMatrix[2] = rock2.buildWorldMatrix();
  objectWorldMatrix[3] = ocean.buildWorldMatrix();


  perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
  viewMatrix = utils.MakeView(0.0, 1.0, 1.0, 15.0, 0.0);

  setBuffers();
  drawScene();

}

async function init() {

  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";

  var canvas = document.getElementById("c");


  lastUpdateTime = (new Date).getTime();

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
  var rock2ObjStr = await utils.get_objstr(baseDir + modelStr[2]);
  rock2Model = new OBJ.Mesh(rock2ObjStr);
  //###################################################################################

  var oceanObjStr = await utils.get_objstr(baseDir + modelStr[3]);
  oceanModel = new OBJ.Mesh(oceanObjStr);

  initControls(canvas);

  main();
}



function getShadersPos() {
  positionAttributeLocation[0] = gl.getAttribLocation(program0, "a_position");
  uvAttributeLocation[0] = gl.getAttribLocation(program0, "a_uv");
  matrixLocation[0] = gl.getUniformLocation(program0, "matrix");
  worldViewMatrixLocation[0] = gl.getUniformLocation(program0, "worldviewmatrix");
  worldViewMatrixLocation_transpose[0] = gl.getUniformLocation(program0, "worldviewmatrix_t");
  textLocation[0] = gl.getUniformLocation(program0, "u_texture");
  normalAttributeLocation[0] = gl.getAttribLocation(program0, "inNormal");
  normalMatrixPositionHandle[0] = gl.getUniformLocation(program0, 'nMatrix');

  materialDiffColorHandle[0] = gl.getUniformLocation(program0, 'mDiffColor');
  lightDirectionHandle[0] = gl.getUniformLocation(program0, 'lightDirection');
  lightColorHandle[0] = gl.getUniformLocation(program0, 'lightColor');
  ambientLightcolorHandle[0] = gl.getUniformLocation(program0, 'ambientLightcolor');
  specularColorHandle[0] = gl.getUniformLocation(program0, 'specularColor');
  specShineHandle[0] = gl.getUniformLocation(program0, 'SpecShine');

  positionAttributeLocation[1] = gl.getAttribLocation(program1, "a_position");
  matrixLocation[1] = gl.getUniformLocation(program1, "matrix");
  uvAttributeLocation[1] = gl.getAttribLocation(program1, "a_uv");
  textLocation[1] = gl.getUniformLocation(program1, "u_texture");
  //var colorLocation = gl.getUniformLocation(program1, "u_color");
}

function setBuffers() {

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

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorTextureCoordinates), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation[1]);
  gl.vertexAttribPointer(uvAttributeLocation[1], 2, gl.FLOAT, false, 0, 0);

  textures[4] = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[4]);

  image = new Image();
  image.crossOrigin = "anonymous";
  image.src = baseDir + modelTexture[4];

  image.onload = function (texture, image) {
    return function () {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      // Check if the image is a power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    };
  }(textures[4], image);

  for (let i = 0; i < object.length; i++) {

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
        // Check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          // Yes, it's a power of 2. Generate mips.
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
      };
    }(textures[i], image);

  }
}

function setFloorCoord() {
  var aspect_ratio = gl.canvas.width * 1.0 / gl.canvas.height;

  /* FLOOR */
  floorPositions = [
    -500.0, 500.0, -0.1,
    500.0, 500.0, -0.1,
    -500.0, -500.0, -0.1,
    500.0, -500.0, -0.1

  ];

  floorIndices = [0, 1, 2, 3];

  floorTextureCoordinates =
    [0, 0,
      0, 1,
      1, 0,
      0, 1,
      1, 1,
      1, 0,
    ]
}

function drawObjects() {
  for (let i = 0; i < object.length; ++i) {
    gl.useProgram(program0);
    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, objectWorldMatrix[i]);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
    gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(worldViewMatrixLocation_transpose[0], gl.FALSE, utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix))));
    gl.uniformMatrix4fv(worldViewMatrixLocation[0], gl.FALSE, utils.transposeMatrix(viewWorldMatrix));
    gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(objectWorldMatrix[i]))));

    gl.uniform3fv(materialDiffColorHandle[0], object[i].materialColor);
    gl.uniform3fv(lightColorHandle[0], directionalLightColor);
    gl.uniform3fv(lightDirectionHandle[0], directionalLight);
    gl.uniform3fv(ambientLightcolorHandle[0], ambientLight);
    gl.uniform3fv(specularColorHandle[0], specularColor);
    gl.uniform1f(specShineHandle[0], specShine);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[i]);
    gl.uniform1i(textLocation[0], textures[i]);


    gl.bindVertexArray(vaos[i]);
    gl.drawElements(gl.TRIANGLES, object[i].indices.length, gl.UNSIGNED_SHORT, 0);

  }

  //draw the floor
  gl.useProgram(program1);

  var floorWorldMatrix = utils.MakeWorld(0.0, -0.47, 0.0, 0, 90, 0.0, 5.5);
  var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, floorWorldMatrix);
  var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocation[1], gl.FALSE, utils.transposeMatrix(projectionMatrix));

  //var color = [0.0, 0.0, 0.3, 1.0];
  //gl.uniform4fv(colorLocation, color);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[4]);
  gl.uniform1i(textLocation[1], textures[4]);

  gl.bindVertexArray(vaos[4]);
  //gl.drawElements(gl.TRIANGLE_STRIP, floorIndices.length, gl.UNSIGNED_SHORT, 0);
}

var counter = 0;

function animate(item) {
  var currentTime = (new Date).getTime();
  if (lastUpdateTime != null) {
    boatDynamic(currentTime);
    var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
    //item.z += deltaC/100;


    //item.Rz += deltaC;
  }

  /* depending on which object we want to animate we change the worldmatrix of the object */
  //objectWorldMatrix[0] = utils.MakeWorld(0.0, item.y, item.z, item.Rx, item.Ry, item.Rz, item.S);
  counter += 0.005;
  //item.z = counter % 2;
  //item.y = counter;

  //(0, -1, 2, 45, 0)
  //item.z -= 0.002;
  viewMatrix = utils.MakeView(cx + item.x, cy + 1, 2 + item.z, camElev, 0);

  //<---- la barca si muove verso la z negativa
  //item.y += 0.002;

  objectWorldMatrix[0] = item.buildWorldMatrix();


  //objectWorldMatrix[1] = rock.buildWorldMatrix();
  //objectWorldMatrix[2] = rock2.buildWorldMatrix();
  lastUpdateTime = currentTime;
}

function drawScene() {

  animate(boat);

  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  

  // DRAW THE OBJECTS IN THE SCENE
  drawObjects();

  window.requestAnimationFrame(drawScene);
}

//controls
var keys = [];
var vz = 0.0;
var rvy = 0.0;

var keyFunctionDown = function (e) {
  if (!keys[e.keyCode]) {
    keys[e.keyCode] = true;
    switch (e.keyCode) {
      case 37: //LEFT ARROW KEY DOWN
        turningDir = - 1;
        break;

      case 39: //RIGHT ARROW KEY DOWN
        turningDir = + 1;
        break;

      case 38: //UP ARROW KEY DOWN
        linearDir = + 1;
        break;

      case 40: //DOWN ARROW KEY DOWN
        linearDir = - 1;

        break;

      //camera controls
      case 87:
        camElev += 5;
        console.log(camElev)
        break;
      case 83:
        camElev -= 5;
        console.log(camElev)
        break;
    }
  }
}

var keyFunctionUp = function (e) {
  if (keys[e.keyCode]) {
    keys[e.keyCode] = false;
    switch (e.keyCode) {
      case 37: //LEFT ARROW KEY UP
        turningDir = 0;
        break;
      case 39: //RIGHT ARROW KEY UP
        turningDir = 0;
        break;
      case 38: //UP ARROW KEY UP
        linearDir = 0;
        break;
      case 40: //DOWN ARROW KEY DOWN
        linearDir = 0;
        break;
    }
  }
}

function initControls(canvas) {
  window.addEventListener("keyup", keyFunctionUp, false);
  window.addEventListener("keydown", keyFunctionDown, false);


}


function boatDynamic(currentTime) {
  //console.log(linearVel);
  //boat turning
  angularVel += turningDir * angularAcc;
  if (Math.abs(angularVel) >= maxAngularVel)
    angularVel = Math.sign(angularVel) * maxAngularVel;

  //angular velocity degradation
  angularVel = angularVel * (1 - angularDrag);

  boat.Rx += angularVel;

  //boat speed
  linearVel += linearDir * linearAcc;
  if (Math.abs(linearVel) >= maxLinearVel)
    linearVel = Math.sign(linearVel) * maxLinearVel;

  //linear vel degradation
  linearVel = linearVel * (1 - linearDrag)

  //linear velocity axis decomposition
  velX = - linearVel * Math.cos(utils.degToRad(boat.Rx));
  velZ = - linearVel * Math.sin(utils.degToRad(boat.Rx));



  boat.x += velX;
  boat.z += velZ;


  //simple boat "wobbling" around its y axis, must be implemented better
  if (Math.random() > 0.8) {
    boat.Ry += Math.sin(utils.degToRad(currentTime)) / 8;
  }

}


function dirLightChange(value, type) {
  if (type == 'alpha')
    dirLightAlpha = -utils.degToRad(value);
  else
    dirLightBeta = -utils.degToRad(value);

  directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
  Math.sin(dirLightAlpha),
  Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
  ];
  drawObjects();


}

function onColorChange(value, type) {
  let result = HEX2RGB(value);
  var r = result[0] / 255.0;
  var g = result[1] / 255.0;
  var b = result[2] / 255.0;
  if (type == 'ambient')
    ambientLight = [r, g, b];
  else if (type == 'directional')
    directionalLightColor = [r, g, b];
  else if (type == 'material')
    boat.setMaterialColor([r, g, b]);
  else
    specularColor = [r, g, b];
  drawObjects();
}

function onSpecShineChange(value) {
  specShine = value;
  drawObjects();
}


window.onload = init;



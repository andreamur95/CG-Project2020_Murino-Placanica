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
var lost = false;


var cubeMaterialColor = [0.0, 0.0, 0.5];
var cubeWorldMatrix = utils.MakeWorld(0.0, -0.15, 0.0, 90.0, 0.0, 0.0, 50.0);
var cubeNormalMatrix = utils.invertMatrix(utils.transposeMatrix(cubeWorldMatrix));

var object = [];

//attributes and uniforms
var positionAttributeLocation = Array();
var uvAttributeLocation = Array();
var matrixLocation = Array();
var textLocation = Array();
var normalAttributeLocation = Array();
var normalMatrixPositionHandle = Array();
var worldMatrixLocation = Array();


var materialDiffColorHandle = Array();
var lightDirectionHandle = Array();
var lightColorHandle = Array();
var ambientLightcolorHandle = Array();
var specularColorHandle = Array();
var specShineHandle = Array();
var eyePositionHandle = Array();


var vaos = new Array();
var textures = new Array();
var modelStr = Array();
var modelTexture = Array();

//matrices
var viewMatrix;
var perspectiveMatrix;

//lights
//define directional light
var dirLightAlpha = -utils.degToRad(322);
var dirLightBeta = -utils.degToRad(91);
var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
Math.sin(dirLightAlpha),
Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
];
var directionalLightColor = [1.0, 1.0, 1.0];
var ambientLight = [0.807843137254902, 0.792156862745098, 0.792156862745098];
var specularColor = [0.5, 0.5, 0.5];
var specShine = 100;

//camera
var cx;
var cy;
var cz;
var camAngle;
var camElev;

//boat kinematics
var linearDir = 0;
var linearVel = 0;
var velX = 0;
var velZ = 0;
var maxLinearVel = 0.04;
var linearAcc = 0.0002;
var linearDrag = 0.005;

var turningDir = 0;
var angularVel = 0.0;
var maxAngularVel = 0.3;
var angularAcc = 0.01;
var angularDrag = 0.01;



boatStr = 'Assets/Boat/Boat.obj';
rock1Str = 'Assets/Rocks/Rock1/rock1.obj';
rock2Str = 'Assets/Rocks/Rock2/Rock_1.obj';
oceanStr = 'Assets/ocean-obj/ocean.obj';

//modelStr[3] = 'Assets/ocean2/hdri-ca-sky.obj';

boatText = 'Assets/Boat/textures/boat_diffuse.bmp';
rock1Text = 'Assets/Rocks/Rock1/textures/rock_low_Base_Color.png';
rock2Text = 'Assets/Rocks/Rock2/Rock_1_Tex/Rock_1_Base_Color.jpg';
oceanText = 'Assets/ocean-obj/woter.jpg';

//modelTexture[3] = 'Assets/ocean2/CA-Sky-2016-04-15-11-30-am.jpg';


//modelTexture[4] = 'Assets/sky/crate.png';


var nFrame = 0;
var pageReady = false;


/***********************************************************************************************/

class Item {
  x; y; z;
  Rx; Ry; Rz;
  S;

  vertices;
  normals;
  indices;
  texCoords;

  worldMatrix;

  materialColor;

  modelStr;
  modelTexture;


  constructor(x, y, z, Rx, Ry, Rz, S, modelStr, modelTexture) {

    this.x = x;
    this.y = y;
    this.z = z;
    this.Rx = Rx;
    this.Ry = Ry;
    this.Rz = Rz;
    this.S = S;
    this.modelStr = modelStr;
    this.modelTexture = modelTexture;
    this.radius = 0.25;

    this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, this.Rx, this.Ry, this.Rz, this.S);


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

var boat = new Item(0.0, -0.15, 0.0, 90.0, 0.0, 0.0, 1.0 / 1000.0, boatStr, boatText);
var ocean = new Item(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, oceanStr, oceanText);
var ocean2 = new Item(0.0, 0.0, -9.5, 0.0, 0.0, 0.0, 5.0, oceanStr, oceanText);
var ocean3 = new Item(0.0, 0.0, -19.0, 0.0, 0.0, 0.0, 5.0, oceanStr, oceanText);
var rocks = [];

function createRocks() {

  let min = -5;
  let max = +5;

  for (i = 0; i < 5; i++) {
    rock1 = new Item((Math.random() * (max - min) + min), -0.15, (Math.random() * (max - min) + min), 0.0, 0.0, 0.0, 1.0 / 20.0, rock1Str, rock1Text);
    rock2 = new Item((Math.random() * (max - min) + min), -0.15, (Math.random() * (max - min) + min), 0.0, 0.0, 0.0, 1.0 / 5.0, rock2Str, rock2Text);


    rock1.setAttr(rockModel.vertices, rockModel.vertexNormals, rockModel.indices, rockModel.textures);
    rock1.setMaterialColor([1.0, 1.0, 1.0]);

    rock2.setAttr(rock2Model.vertices, rock2Model.vertexNormals, rock2Model.indices, rock2Model.textures);
    rock2.setMaterialColor([1.0, 1.0, 1.0]);


    rocks.push(rock1);
    rocks.push(rock2);
    object.push(rock1);
    object.push(rock2);


  }

  console.log(rocks);
  console.log(object);





}



function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function main() {
  document.getElementById("t").style.visibility = "hidden";

  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  boat.setAttr(boatModel.vertices, boatModel.vertexNormals, boatModel.indices, boatModel.textures);
  boat.setMaterialColor([1.0, 1.0, 1.0]); // set material color for boat  

  ocean.setAttr(oceanModel.vertices, oceanModel.vertexNormals, oceanModel.indices, oceanModel.textures);
  ocean.setMaterialColor([1.0, 1.0, 1.0]);

  ocean2.setAttr(oceanModel.vertices, oceanModel.vertexNormals, oceanModel.indices, oceanModel.textures);
  ocean2.setMaterialColor([1.0, 1.0, 1.0]);

  ocean3.setAttr(oceanModel.vertices, oceanModel.vertexNormals, oceanModel.indices, oceanModel.textures);
  ocean3.setMaterialColor([1.0, 1.0, 1.0]);

  /* Load corresponding information from the models */
  object[0] = boat;
  object[1] = ocean;
  object[2] = ocean2;
  object[3] = ocean3;

  createRocks();
  /* Retrieve the position of the attributes and uniforms */
  getShadersPos()



  perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

  cx = 0.0;
  cy = 0.0;
  cz = 2.5;
  camElev = 15.0;
  camAngle = 0.0;


  viewMatrix = utils.MakeView(cx + boat.x, cy + 1, 2 + boat.z, camElev, 0);

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
  var boatObjStr = await utils.get_objstr(baseDir + boatStr);
  boatModel = new OBJ.Mesh(boatObjStr);
  //###################################################################################

  //###################################################################################
  //This loads the obj model in the rockModel variable
  var rockObjStr = await utils.get_objstr(baseDir + rock1Str);
  rockModel = new OBJ.Mesh(rockObjStr);
  //###################################################################################

  //###################################################################################
  //This loads the obj model in the rockModel variable
  var rock2ObjStr = await utils.get_objstr(baseDir + rock2Str);
  rock2Model = new OBJ.Mesh(rock2ObjStr);
  //###################################################################################

  var oceanObjStr = await utils.get_objstr(baseDir + oceanStr);
  oceanModel = new OBJ.Mesh(oceanObjStr);

  initControls(canvas);

  main();
}



function getShadersPos() {
  positionAttributeLocation[0] = gl.getAttribLocation(program0, "a_position");
  uvAttributeLocation[0] = gl.getAttribLocation(program0, "a_uv");
  matrixLocation[0] = gl.getUniformLocation(program0, "matrix");
  worldMatrixLocation[0] = gl.getUniformLocation(program0, "worldmatrix");

  textLocation[0] = gl.getUniformLocation(program0, "u_texture");

  normalAttributeLocation[0] = gl.getAttribLocation(program0, "inNormal");
  normalMatrixPositionHandle[0] = gl.getUniformLocation(program0, 'nMatrix');

  eyePositionHandle[0] = gl.getUniformLocation(program0, "eyePos");

  materialDiffColorHandle[0] = gl.getUniformLocation(program0, 'mDiffColor');
  lightDirectionHandle[0] = gl.getUniformLocation(program0, 'lightDirection');
  lightColorHandle[0] = gl.getUniformLocation(program0, 'lightColor');
  ambientLightcolorHandle[0] = gl.getUniformLocation(program0, 'ambientLightcolor');
  specularColorHandle[0] = gl.getUniformLocation(program0, 'specularColor');
  specShineHandle[0] = gl.getUniformLocation(program0, 'SpecShine');

  positionAttributeLocation[1] = gl.getAttribLocation(program1, "a_position");
  matrixLocation[1] = gl.getUniformLocation(program1, "matrix");

  //var colorLocation = gl.getUniformLocation(program1, "u_color");
}

function setBuffers() {

  /* SET BUFFERS FOR THE FLOOR */


  vaos[100] = gl.createVertexArray();
  gl.bindVertexArray(vaos[100]);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[1]);
  gl.vertexAttribPointer(positionAttributeLocation[1], 3, gl.FLOAT, false, 0, 0);




  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);







  for (let i = 0; i < object.length; i++) {
    gl.useProgram(program0);
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
    image.src = baseDir + object[i].modelTexture;

    image.onload = function (texture, image) {
      return function () {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);

      };
    }(textures[i], image);

  }
  pageReady = true;
  pageLoader();
}






function drawObjects() {

  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //draw the cube environment
  gl.useProgram(program1);

  var viewWorldCubeMatrix = utils.multiplyMatrices(viewMatrix, cubeWorldMatrix);
  var projectionCubeMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldCubeMatrix);
  gl.uniformMatrix4fv(matrixLocation[1], gl.FALSE, utils.transposeMatrix(projectionCubeMatrix));

  gl.bindVertexArray(vaos[100]);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);




  for (let i = 0; i < object.length; ++i) {
    gl.useProgram(program0);
    var worldViewMatrix = utils.multiplyMatrices(viewMatrix, object[i].worldMatrix);
    var worldViewProjection = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
    gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(worldViewProjection));
    gl.uniformMatrix4fv(worldMatrixLocation[0], gl.FALSE, utils.transposeMatrix(object[i].worldMatrix));

    var objNormalMatrix = utils.invertMatrix(utils.transposeMatrix(object[i].worldMatrix));
    gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(objNormalMatrix));

    gl.uniform3fv(materialDiffColorHandle[0], object[i].materialColor);
    gl.uniform3fv(lightColorHandle[0], directionalLightColor);
    gl.uniform3fv(lightDirectionHandle[0], directionalLight);
    gl.uniform3fv(ambientLightcolorHandle[0], ambientLight);
    gl.uniform3fv(specularColorHandle[0], specularColor);
    gl.uniform1f(specShineHandle[0], specShine);
    gl.uniform3f(eyePositionHandle[0], cx, cy, cz);



    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[i]);
    gl.uniform1i(textLocation[0], textures[i]);


    gl.bindVertexArray(vaos[i]);
    gl.drawElements(gl.TRIANGLES, object[i].indices.length, gl.UNSIGNED_SHORT, 0);

  }




}

var counter = 0;

function animate(item) {
  var currentTime = (new Date).getTime();
  if (lastUpdateTime != null) {
    rocks.forEach(rock => circleCollision(boat, rock));
    rockPlacement();
    oceanPlacement();
    boatDynamic(currentTime);
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
  for (let i = 0; i < object.length; i++) {
    object[i].worldMatrix = object[i].buildWorldMatrix();
  }



  //objectWorldMatrix[1] = rock.buildWorldMatrix();
  //objectWorldMatrix[2] = rock2.buildWorldMatrix();
  lastUpdateTime = currentTime;
}

function drawScene() {

  if (!lost)
    animate(boat);

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

      case 38: {
        linearDir = + 1;
        const element = document.getElementById("chbx");
        /* When the player starts playing, also the music start */
        if (element.checked != true) {
          element.checked = true;
          const e = new Event("change");
          element.dispatchEvent(e);
        }


        break;
      }

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

  // Need to correctly tune the translation of the cube along the boat translation

  cubeWorldMatrix = utils.multiplyMatrices(cubeWorldMatrix, utils.MakeTranslateMatrix(velZ / 50.0, 0.0, 0.0));


  //simple boat "wobbling" around its y axis, must be implemented better
  if (Math.random() > 0.8) {
    boat.Ry += Math.sin(utils.degToRad(currentTime)) / 8;
  }

}


function dirLightChange(value, type) {
  console.log(value);
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
  console.log(value)
  specShine = value;

  drawObjects();
}

function circleCollision(obj1, obj2) {
  let dx = obj1.x - obj2.x;
  let dz = obj1.z - obj2.z;

  let distance = Math.sqrt(dx * dx + dz * dz);
  //collision happening
  if (distance < obj1.radius + obj2.radius) {
    console.log("HIT");
    lost = true;
    document.getElementById("Lost").style.visibility = "visible";
    const element = document.getElementById("chbx");
    if (element.checked) {
      element.checked = false;
      const e = new Event("change");
      element.dispatchEvent(e);
    }


  }
}



function rockPlacement() {
  let min = - 5;
  let max = + 5;
  let drawDistance = 10
  console.log(rocks);
  rocks.forEach(rock => {
    if (rock.z > boat.z + 2) {
      rock.z = boat.z - drawDistance;
      rock.x = Math.random() * (max - min) + min;
    }
  })
}

function oceanPlacement() {

  if (boat.z < ocean.z - 9.5) {
    console.log("true");
    ocean.z -= 28.5;

  }

  if (boat.z < ocean2.z - 9.5) {
    console.log("true");
    ocean2.z -= 28.5;

  }

  if (boat.z < ocean3.z - 9.5) {
    console.log("true");
    ocean3.z -= 28.5;

  }


}


window.onload = init;



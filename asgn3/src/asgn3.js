// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; // use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      vec4 color1 = texture2D(u_Sampler0, v_UV);
      gl_FragColor = color1 * u_FragColor;
    } else {
      gl_FragColor = vec4(1, .2, .2, 1); // Error, reddish
    }
  }`;

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;

let u_FragColor;
let u_Size;

let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log("Failed to get the storage location of u_ProjectionMatrix");
      return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log("Failed to get the storage location of u_Sampler0");
      return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log("Failed to get the storage location of u_Sampler1");
      return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
      console.log("Failed to get the storage location of u_Sampler2");
      return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log("Failed to get the storage location of u_whichTexture");
      return false;
    }

    // Set an initial value for this matrix to identify
    let identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals Related to UI
let g_globalAngle = -45;
let g_globalPitch = 0;

let g_bodyAnimation = false;
let g_animationEvent = false;

let g_prev_x = 0;
let g_prev_y = 0;

// Body Angles
let g_bodyAngleX = 0;
let g_bodyAngleY = 0;

// Right Side Angles
let g_rightArmAngle = 0;
let g_rightPawAngle = 0;

// Left Side Angles
let g_leftArmAngle = 0;
let g_leftPawAngle = 0;

// Body X-Y Shifts
let g_bodyMove = 0;
let g_rightArmMove = 0;
let g_leftArmMove = 0;
let g_rightPawMove = 0;
let g_leftPawMove = 0;

// OBJ Loader
let g_OBJ = new OBJ();

function addActionsForHTMLUI() {
    // Button Events
    document.getElementById("aniBodyOffButton").onclick = function() {g_bodyAnimation = false;};
    document.getElementById("aniBodyOnButton").onclick = function() {g_bodyAnimation = true;};
  }

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHTMLUI();

    initTextures();
    g_OBJ.readOBJFile();
    // Register function (event handler) to be called on a mouse press
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) {click(ev)} }
    document.onkeydown = keydown;
    // Specify the color for clearing <canvas>
    gl.clearColor(0.424, 0.49, 0.235, 1.0);

    requestAnimationFrame(tick);
}

function initTextures() {
  let image0 = new Image();
  if (!image0) {
    console.log("Failed to create the image object");
    return false;
  }

  let image1 = new Image();
  if (!image1) {
    console.log("Failed to create the image object");
    return false;
  }

  let image2 = new Image();
  if (!image2) {
    console.log("Failed to create the image object");
    return false;
  }
  
  // Register the event handler to be called on loading an image
  image0.onload = function() { sendTextureToTEXTURE0(image0); };
  // Tell the browser to load an image
  image0.src = '../img/sky.jpg';

  image1.onload = function() { sendTextureToTEXTURE1(image1); };
  // Tell the browser to load an image
  image1.src = '../img/wheat.jpg';

  image2.onload = function() { sendTextureToTEXTURE2(image2); };
  image2.src = '../img/vampire_miku.jpg';

  return true;
}

function sendTextureToTEXTURE0(image0) {
  let texture0 = gl.createTexture();
  if (!texture0) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture0);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image0);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log("Finished sendTextureToTEXTURE0()");
}

function sendTextureToTEXTURE1(image1) {
  let texture1 = gl.createTexture();
  if (!texture1) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable the texture unit 1
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log("Finished sendTextureToTEXTURE1()");
}

function sendTextureToTEXTURE2(image2) {
  let texture2 = gl.createTexture();
  if (!texture2) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log("Finished sendTextureToTEXTURE2()");
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime; 

  // Update animation angles
  updateAnimationAngles();
  
  // Drawing everything
  renderAllShapes();

  // Tell the browser to update again when it's time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_bodyAnimation) {
      g_bodyAngleX = (5*Math.sin(5*g_seconds));
      g_bodyMove = (0.01*Math.sin(3*g_seconds));
    } else if (g_animationEvent) {
      g_bodyAngleX = (5*Math.sin(7*g_seconds));
      g_bodyMove = (0.1*Math.sin(3*g_seconds));

      g_rightArmAngle = (3*Math.cos(5*g_seconds));
      g_rightArmMove = (0.05*Math.sin(5*g_seconds));

      g_leftArmAngle = -(3*Math.cos(5*g_seconds));
      g_leftArmMove = -(0.05*Math.sin(5*g_seconds));
      
      g_rightPawAngle = (10*Math.sin(5*g_seconds));

      g_leftPawAngle = -(10*Math.sin(5*g_seconds));
    }
}

let g_camera = new Camera();
let g_fov = 60;
let g_size = 32;
let g_foxY = ((Math.random()*100)%g_size/4)-1;
let g_foxX = ((Math.random()*100)%g_size/4)-1;
let g_foxZ = ((Math.random()*100)%g_size/4)-1;
let g_addedElements = [];

let g_foundFox = false;

perlin.seed();
let g_map = [];
for (let x = 0; x < 1; x += 1/g_size) {
  let row = [];
  for (let y = 0; y < 1; y += 1/g_size) {
    let intensity = Math.round(perlin.get(x, y)*25);
    row.push(intensity);
  }
  g_map.push(row);
}

function resetFoxPosition() {
  g_foxY = ((Math.random()*100)%g_size/2)-1;
  g_foxX = ((Math.random()*100)%g_size/2)-1;
  g_foxZ = ((Math.random()*100)%g_size/2)-1;
}

let interval = window.setInterval(resetFoxPosition, 1000);

function drawMap() {
  for (let x = 0; x < g_size; x++) {
    for (let y = 0; y < g_size; y++) {
      let body = new Cube();
      body.textureNum = 1;
      body.color = [1, 1, 1, 1];
      body.matrix.setTranslate(0, -g_size/3, 0);
      body.matrix.translate(x-g_size/2, g_map[x][y], y-g_size/2);
      body.render();
    }
  }

  g_addedElements.forEach(element => {
    let body = new Cube();
    body.textureNum = 2;
    body.color = [1, 1, 1, 1];
    body.matrix.setTranslate(element[0], element[1], element[2]);
    body.render();
  });
}

function renderAllShapes() {
    let startTime = performance.now();

    // Pass the projection matrix to u_ProjectionMatrix
    let projMat = new Matrix4();
    projMat.setPerspective(g_fov, 1*canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix to u_ViewMatrix
    let viewMat = new Matrix4();
    viewMat.setLookAt(
      g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2], 
      g_camera.at.elements[0],g_camera.at.elements[1],g_camera.at.elements[2], 
      g_camera.up.elements[0],g_camera.up.elements[1],g_camera.up.elements[2]); 
      // eye, at , up
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to u_ModelMatrix attribute
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalPitch, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw maze
    drawMap();

    // Draw skybox
    let sky = new Cube();
    sky.color = [1, 1, 1, 1];
    sky.textureNum = 0;
    sky.matrix.scale(g_size, g_size, g_size);
    sky.matrix.translate(-0.5, -0.5, -0.500001);
    sky.render();

    g_OBJ.model_matrix.setTranslate(1, 1, 1);
    g_OBJ.model_matrix.translate(g_foxX, g_foxY, g_foxZ);
    g_OBJ.render();

    let ocean = new Cube();
    ocean.color = [68/256, 109/256, 154/256, 1];
    ocean.textureNum = -2;
    ocean.matrix.scale(g_size, g_size, g_size);
    ocean.matrix.translate(-0.500001, -1.2+(0.1)*(Math.sin(g_seconds)), -0.500002);
    ocean.render();

    let duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "fps");
}

function sendTextToHTML(text, htmlID) {
    let htmlEL = document.getElementById(htmlID);
    if (!htmlEL) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
    }
    htmlEL.innerHTML = text;
}

// Code for camera panning up/down from: https://people.ucsc.edu/~jbrowne2/asgn3/World.html
function click(ev) {
    if (ev.shiftKey && !g_animationEvent) {
      g_animationEvent = true;
      return;
    } else if (ev.shiftKey && g_animationEvent) {
      g_animationEvent = false;
      return;
    }

    let cur_x = ev.clientX; // x coordinate of a mouse pointer
    let cur_y = ev.clientY; // y coordinate of a mouse pointer

    let factor = 100/canvas.height; // 100/400 -> 1/4?
    let change_x = factor*(cur_x - g_prev_x);
    let change_y = factor*(cur_y - g_prev_y);
    if (change_x > 0) {
        g_camera.turnRight();
    } else if (change_x < 0) {
        g_camera.turnLeft();
    }
    if (change_y < 0) {
        g_camera.turnUp();
    } else if (change_y > 0) {
        g_camera.turnDown();
    }

    g_prev_x = cur_x; 
    g_prev_y = cur_y;
}

function keydown(ev) {
  if (ev.keyCode==87 || ev.keyCode==38) { // w or ^
    g_camera.moveForward();
  } else if (ev.keyCode==65 || ev.keyCode==37) { // a or <
    g_camera.moveLeft();
  } else if (ev.keyCode==68 || ev.keyCode==39) { // d or >
    g_camera.moveRight();
  } else if (ev.keyCode==83 || ev.keyCode==40) { // s or v (down)
    g_camera.moveBackward();
  } else if (ev.keyCode==81) { // q
    g_camera.turnLeft();
  } else if (ev.keyCode==69) { // e
    g_camera.turnRight();
  } else if (ev.keyCode==90) { // z
    g_camera.moveUp();
  } else if (ev.keyCode==67) { // c
    g_camera.moveDown();
  } else if (ev.keyCode==16) {
    g_addedElements.push([Math.round(g_camera.eye.elements[0]), Math.round(g_camera.eye.elements[1]), Math.round(g_camera.eye.elements[2])]);
  } else if (ev.keyCode==13) { // enter 
    g_addedElements.pop();
  } 

  renderAllShapes();
}
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
    // gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; // use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
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

// code from: https://people.ucsc.edu/~adion/Andre_Dion_Assignment_2/asg2.html
function setupGLBuffer() {
    // Create a buffer object
    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
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

function addActionsForHTMLUI() {
    // Button Events
    document.getElementById("aniBodyOffButton").onclick = function() {g_bodyAnimation = false;};
    document.getElementById("aniBodyOnButton").onclick = function() {g_bodyAnimation = true;};

    // Joint Slider Events 
    document.getElementById("bodyAngleSlide").addEventListener('mousemove', function() { g_bodyAngleX = this.value; renderAllShapes(); }); 
    document.getElementById("rightArmSlide").addEventListener('mousemove', function() { g_rightArmAngle = this.value; renderAllShapes(); });
    document.getElementById("leftArmSlide").addEventListener('mousemove', function() { g_leftArmAngle = this.value; renderAllShapes(); }); 
 
    document.getElementById("rightPawSlide").addEventListener('mousemove', function() { g_rightPawAngle = this.value; renderAllShapes(); }); 
    document.getElementById("leftPawSlide").addEventListener('mousemove', function() { g_leftPawAngle = this.value; renderAllShapes(); }); 

    // Camera Angle Slider Events
    document.getElementById("angleslide").addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById("pitchslide").addEventListener('mousemove', function() { g_globalPitch = this.value; renderAllShapes(); });
  }

function main() {
    setupWebGL();
    setupGLBuffer();
    connectVariablesToGLSL();
    addActionsForHTMLUI();

    initTextures();

    // Register function (event handler) tobe called on a mouse press
    canvas.onmousedown = function(ev) { [g_prev_x, g_prev_y] = convertCoordinatesEventToGL(ev); click(ev); };
    canvas.onmousemove = function(ev) { if (ev.buttons==1) {click(ev)} }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.424, 0.49, 0.235, 1.0);

    requestAnimationFrame(tick);
}

function initTextures() {
  let image = new Image();
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }
  
  // Register the event handler to be called on loading an image
  image.onload = function() { sendTextureToTEXTURE0(image); };
  // Tell the browser to load an image
  image.src = '../img/sky.jpg';

  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  console.log("Finished loadTexture()");
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

function renderAllShapes() {
    let startTime = performance.now();

    // Pass the projection matrix to u_ProjectionMatrix
    let projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix to u_ViewMatrix
    let viewMat = new Matrix4();
    viewMat.setLookAt(0,0,3,  0,0,-100,  0,1,0); // eye, at , up
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to u_ModelMatrix attribute
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalPitch, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Colors
    let black = [0.278, 0.2, 0.212, 1];
    let features = [0.29, 0.122, 0.2, 1, 1];
    let underside = [0.659, 0.584, 0.502, 1];
    let offwhite = [0.812, 0.741, 0.675, 1];

    // Joints
    let bodyCoordinatesMat;
    let headCoordinatesMat;

    let faceCoordinatesMat;
    let dotDimensionsMat;

    let rightArmCoordinatesMat;
    let rightArmDimensionsMat;

    let leftArmCoordinatesMat;
    let leftArmDimensionsMat;

    // Draw body cube
    let body = new Cube();
    body.color = black;
    body.textureNum = 0;
    body.matrix.translate(-0.2, -0.2, -0.2);
    // Rotate the body from side to side
    body.matrix.rotate(-g_bodyAngleX, 0, 1, 0);
    body.matrix.translate(g_bodyMove, 0, 0);
    // Save coordinates to allow child objects
    bodyCoordinatesMat = new Matrix4(body.matrix);
    // Scale body
    body.matrix.scale(0.7, 0.5, 0.5);
    body.render();

    // == HEAD ====================
    // Draw the neck cube
    let neck = new Cube();
    neck.color = black;
    // Attach the neck to the main body
    neck.matrix = new Matrix4(bodyCoordinatesMat);
    neck.matrix.translate(-0.2, 0, 0);
    neck.matrix.scale(0.3, 0.6, 0.5);
    neck.render();

    // Draw the head cube
    let head = new Cube();
    head.color = black;
    // Attach the head to the main body
    head.matrix = new Matrix4(bodyCoordinatesMat);
    head.matrix.translate(-0.4, 0.3, 0.05);
    // Save coordinates to allow child objects
    headCoordinatesMat = new Matrix4(head.matrix);
    head.matrix.scale(0.35, 0.3, 0.4);
    head.render();

    // Draw the face cube
    let face = new Cube();
    face.color = underside;
    // Attach the face to the head
    face.matrix = new Matrix4(headCoordinatesMat);
    face.matrix.translate(-0.05, 0.0001, 0.1);
    // Save coordinates to allow child objects
    faceCoordinatesMat = new Matrix4(face.matrix);
    face.matrix.scale(0.15, 0.15, 0.2);
    face.render();

    // == FEATURES (EYES/NOSE) ==================
    let nose = new Cube();
    nose.color = features;
    // Attach nose to the face
    nose.matrix = new Matrix4(faceCoordinatesMat);
    nose.matrix.translate(-0.005, 0.10001, 0.08);
    nose.matrix.scale(0.05, 0.05, 0.05);
    dotDimensionsMat = new Matrix4(nose.matrix);
    nose.render();

    let leftEye = new Cube();
    leftEye.color = offwhite;
    leftEye.matrix = dotDimensionsMat;
    leftEye.matrix.translate(0.9, 0.7, 2.5);
    leftEye.render();

    let rightEye = new Cube();
    rightEye.color = offwhite;
    rightEye.matrix = new Matrix4(leftEye.matrix);
    rightEye.matrix.translate(0, 0, -5.2);
    rightEye.render();

    // == EARS =======================
    let rightEar = new Pyramid();
    rightEar.color = black;
    rightEar.matrix = new Matrix4(headCoordinatesMat);
    rightEar.matrix.scale(0.05, 0.1, 0.1);
    rightEar.matrix.translate(0.5, 2.5, 0.25);
    rightEar.render();

    let leftEar = new Pyramid();
    leftEar.color = black;
    leftEar.matrix = new Matrix4(rightEar.matrix);
    leftEar.matrix.translate(0, 0, 2.5);
    leftEar.render();

    // == LEGS ==============================
    // Draw front right
    let frontRightArm = new Cube();
    frontRightArm.color = black;
    // Attach front right arm to the main body
    frontRightArm.matrix = new Matrix4(bodyCoordinatesMat);
    frontRightArm.matrix.translate(0.01, -0.3, 0);
    // Animate the arm
    frontRightArm.matrix.rotate(-g_rightArmAngle, 0, 0, 1);
    frontRightArm.matrix.translate(0, g_rightArmMove, 0);
    // Save coordinates to allow child objects
    rightArmCoordinatesMat = new Matrix4(frontRightArm.matrix);
    frontRightArm.matrix.scale(0.2, 0.4, 0.2);
    // Save the dimensions of the arm in order to duplicate it
    rightArmDimensionsMat = new Matrix4(frontRightArm.matrix);
    frontRightArm.render();

    // Draw back right
    let backRightArm = new Cube();
    backRightArm.color = black;
    // Copy the dimensions of the arm
    backRightArm.matrix = rightArmDimensionsMat;
    backRightArm.matrix.translate(2, 0, 0);
    backRightArm.render();

    // Draw front left
    let frontLeftArm = new Cube();
    frontLeftArm.color = black;
    // Attach front left arm to the main body
    frontLeftArm.matrix = new Matrix4(bodyCoordinatesMat);
    frontLeftArm.matrix.translate(0.01, -0.3, 0.3);
    // Animate the arm
    frontLeftArm.matrix.rotate(-g_leftArmAngle, 0, 0, 1);
    frontLeftArm.matrix.translate(0, g_leftArmMove, 0);
    // Save coordinates to allow child objects
    leftArmCoordinatesMat = new Matrix4(frontLeftArm.matrix);
    frontLeftArm.matrix.scale(0.2, 0.4, 0.2);
    // Save the dimensions of the arm in order to duplicate it
    leftArmDimensionsMat = new Matrix4(frontLeftArm.matrix);
    frontLeftArm.render();

    // Draw back left
    let backLeftArm = new Cube();
    backLeftArm.color = black;
    // Copy the dimensions of the arm
    backLeftArm.matrix = leftArmDimensionsMat;
    backLeftArm.matrix.translate(2, 0, 0);
    backLeftArm.render();

    // == PAWS =================
    // Draw front right paw
    let frontRightPaw = new Cube();
    // Attach the paw to the arm
    frontRightPaw.matrix = new Matrix4(rightArmCoordinatesMat);
    frontRightPaw.matrix.translate(-0.05, 0.01, 0.001);
    // Rotate the paw up and down
    frontRightPaw.matrix.rotate(g_rightPawAngle, 0, 0, 1);
    frontRightPaw.matrix.translate(0, g_rightPawMove, 0);
    frontRightPaw.matrix.scale(.2, .1, .19);
    frontRightPaw.render(black);

    // Draw front left paw
    let frontLeftPaw = new Cube();
    // Attach the paw to the arm
    frontLeftPaw.matrix = new Matrix4(leftArmCoordinatesMat);
    frontLeftPaw.matrix.translate(-0.05, 0.01, 0.001);
    // Rotate the paw up and down
    frontLeftPaw.matrix.rotate(g_leftPawAngle, 0, 0, 1);
    frontLeftPaw.matrix.translate(0, g_leftPawMove, 0);
    frontLeftPaw.matrix.scale(.2, .1, .19);
    frontLeftPaw.render(black);

    // Draw back right paw
    let backRightPaw = new Cube();
    // Attach the paw to the arm
    backRightPaw.matrix = new Matrix4(rightArmCoordinatesMat);
    backRightPaw.matrix.translate(0.35, 0.01, 0.001);
    // Rotate the paw up and down
    backRightPaw.matrix.rotate(g_rightPawAngle, 0, 0, 1);
    backRightPaw.matrix.translate(0, g_rightPawMove, 0);
    backRightPaw.matrix.scale(.2, .1, .19);
    backRightPaw.render(black);

    let backLeftPaw = new Cube();
    // Attach the paw to the arm
    backLeftPaw.matrix = new Matrix4(leftArmCoordinatesMat);
    backLeftPaw.matrix.translate(0.35, 0.01, 0.001);
    // Rotate the paw up and down
    backLeftPaw.matrix.rotate(g_leftPawAngle, 0, 0, 1);
    backLeftPaw.matrix.translate(0, g_leftPawMove, 0);
    backLeftPaw.matrix.scale(.2, .1, .19);
    backLeftPaw.render(black);

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

// from https://people.ucsc.edu/~adion/Andre_Dion_Assignment_2/asg2.html
function click(ev) {
    if (ev.shiftKey && !g_animationEvent) {
      g_animationEvent = true;
      return;
    } else if (ev.shiftKey && g_animationEvent) {
      g_animationEvent = false;
      return;
    }

    let [cur_x, cur_y] = convertCoordinatesEventToGL(ev);
    
    let change_x = cur_x - g_prev_x;
    g_globalAngle += 180 * change_x; 
    g_globalAngle %= 360; 
    if (g_globalAngle <= 0) {
      g_globalAngle += 360;
    }

    let change_y = cur_y - g_prev_y;
    g_globalPitch += 180 * change_y; 
    g_globalPitch %= 360; 
    if (g_globalPitch <= 0) {
      g_globalPitch += 360;
    }

    g_prev_x = cur_x; 
    g_prev_y = cur_y;
}

// Extract the event click and convert it to WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}
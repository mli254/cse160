// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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

    // Set an initial value for this matrix to identify
    let identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals Related to UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_globalAngle = -45;
let g_globalPitch = 0;

let g_bodyAngle = 0;
let g_frontArmAngle = 0;
let g_pawAngle = 0;

let g_bodyAnimation = false;
let g_frontArmAnimation = false;
let g_pawAnimation = false;
let g_animationEvent = false;

let g_prev_x = 0;
let g_prev_y = 0;

function addActionsForHTMLUI() {
    // Button Events
    document.getElementById("aniBodyOffButton").onclick = function() {g_bodyAnimation = false;};
    document.getElementById("aniBodyOnButton").onclick = function() {g_bodyAnimation = true;};
    
    document.getElementById("aniFrontArmOffButton").onclick = function() {g_frontArmAnimation = false;};
    document.getElementById("aniFrontArmOnButton").onclick = function() {g_frontArmAnimation = true;};
    document.getElementById("aniPawOffButton").onclick = function() {g_pawAnimation = false;};
    document.getElementById("aniPawOnButton").onclick = function() {g_pawAnimation = true;};

    // Joint Slider Events 
    document.getElementById("bodyAngleSlide").addEventListener('mousemove', function() { g_bodyAngle = this.value; renderAllShapes(); }); 
    document.getElementById("frontArmSlide").addEventListener('mousemove', function() { g_frontArmAngle = this.value; renderAllShapes(); }); 
    document.getElementById("pawSlide").addEventListener('mousemove', function() { g_pawAngle = this.value; renderAllShapes(); }); 

    // Camera Angle Slider Events
    document.getElementById("angleslide").addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById("pitchslide").addEventListener('mousemove', function() { g_globalPitch = this.value; renderAllShapes(); });
  }

function main() {
    setupWebGL();
    setupGLBuffer();
    connectVariablesToGLSL();
    addActionsForHTMLUI();

    // Register function (event handler) tobe called on a mouse press
    canvas.onmousedown = function(ev) { [g_prev_x, g_prev_y] = convertCoordinatesEventToGL(ev); click(ev); };
    canvas.onmousemove = function(ev) { if (ev.buttons==1) {click(ev)} }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
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
      g_bodyAngle = (5*Math.sin(7*g_seconds));
    }
  
    if (g_frontArmAnimation) {
      g_frontArmAngle = (3*Math.sin(5*g_seconds));
    }

    if (g_pawAnimation) {
      g_pawAngle = (10*Math.sin(5*g_seconds));
    }
}

function renderAllShapes() {
    let startTime = performance.now();

    // Pass the matrix to u_ModelMatrix attribute
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalPitch, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Colors
    let black = [0.29, 0.122, 0.2, 1, 1];
    let underside = [0.69, 0.51, 0.592, 1];

    // Joints
    let bodyCoordinatesMat;
    let headCoordinatesMat;
    let armCoordinatesMat;
    let armDimensionsMat;

    // Draw body cube
    let body = new Cube();
    body.color = black;
    body.matrix.setTranslate(-0.2, -0.2, 0.0);
    // Rotate the body from side to side
    body.matrix.rotate(-g_bodyAngle, 0, 1, 0);
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
    neck.matrix.translate(-0.2, 0.15, 0);
    // Rotate

    neck.matrix.scale(0.4, 0.4, 0.5);
    neck.render();

    // Draw the head cube
    let head = new Cube();
    head.color = black;
    // Attach the head to the main body
    head.matrix = new Matrix4(bodyCoordinatesMat);
    head.matrix.translate(-0.4, 0.3, 0.05);
    // Rotate the head

    // Save coordinates to allow child objects
    headCoordinatesMat = new Matrix4(head.matrix);
    head.matrix.scale(0.35, 0.3, 0.4);
    head.render();

    // Draw the face cube
    

    // == LEGS ==============================
    // Draw front right
    let frontRightArm = new Cube();
    frontRightArm.color = black;
    // Attach front right arm to the main body
    frontRightArm.matrix = bodyCoordinatesMat;
    frontRightArm.matrix.translate(0.01, -0.3, 0);
    // Save coordinates to allow child objects
    armCoordinatesMat = new Matrix4(frontRightArm.matrix);
    frontRightArm.matrix.scale(0.2, 0.4, 0.2);
    // Rotate the arm up and down
    frontRightArm.matrix.rotate(-g_frontArmAngle, 0, 0, 1);
    // Save the dimensions of the arm in order to duplicate it
    armDimensionsMat = new Matrix4(frontRightArm.matrix);
    frontRightArm.render();

    // Draw front left
    let frontLeftArm = new Cube();
    frontLeftArm.color = black;
    // Copy the dimensions of the arm
    frontLeftArm.matrix = armDimensionsMat;
    frontLeftArm.matrix.translate(0, 0, 1.5);
    // Rotate the arm up and down
    frontLeftArm.matrix.rotate(-g_frontArmAngle, 0, 0, 1);
    frontLeftArm.render();

    // Draw front right paw
    let frontRightPaw = new Cube();
    // Attach the paw to the arm
    frontRightPaw.matrix = armCoordinatesMat;
    frontRightPaw.matrix.translate(-0.05, 0.00, 0.001);
    // Rotate the paw up and down
    frontRightPaw.matrix.rotate(-g_pawAngle, 0, 0, 1);
    frontRightPaw.matrix.scale(.2, .1, .2);
    // Save the dimensions of the paw to be copied later
    let pawDimensionsMat = new Matrix4(frontRightPaw.matrix);
    frontRightPaw.render(underside);

    // Draw front left paw
    let frontLeftPaw = new Cube();
    // Copy dimensions of the paw
    frontLeftPaw.matrix = pawDimensionsMat;
    frontLeftPaw.matrix.translate(0, 0, 1.4899);
    // Rotate the paw up and down
    frontLeftPaw.matrix.rotate(-g_pawAngle, 0, 0, 1);
    frontLeftPaw.render(underside);

    // test pyramid
    // let pyramid = new Pyramid();
    // pyramid.color = [1, 1, 1, 1];
    // pyramid.matrix.setScale(0.5, .3, .15);
    // pyramid.render();

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
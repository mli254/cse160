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
let g_globalAngle = 0;
let g_globalPitch = 0;

let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_animationEvent = false;

let g_prev_x = 0;
let g_prev_y = 0;

function addActionsForHTMLUI() {
    // Button Events
    document.getElementById("aniYellowOffButton").onclick = function() {g_yellowAnimation = false;};
    document.getElementById("aniYellowOnButton").onclick = function() {g_yellowAnimation = true;};
    document.getElementById("aniMagentaOffButton").onclick = function() {g_magentaAnimation = false;};
    document.getElementById("aniMagentaOnButton").onclick = function() {g_magentaAnimation = true;};

    // Joint Slider Events 
    document.getElementById("yellowslide").addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); }); 
    document.getElementById("magentaslide").addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); }); 

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
    if (g_yellowAnimation) {
      g_yellowAngle = (15*Math.sin(3*g_seconds));
    }

    if (g_magentaAnimation) {
      g_magentaAngle = (45*Math.sin(3*g_seconds));
    }
}

function renderAllShapes() {
    let startTime = performance.now();

    // Pass the matrix to u_ModelMatrix attribute
    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalPitch, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Draw body cube
    let body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.setTranslate(-.25, -.75, 0.0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, .3, .5);
    body.render();

    // Draw left cube
    let leftArm = new Cube();
    leftArm.color = [1, 1, 0, 1];
    leftArm.matrix.setTranslate(0, -.5, 0.0);
    leftArm.matrix.rotate(-5, 1, 0, 0);

    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);

    let yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25, .7, .5);
    leftArm.matrix.translate(-.5, 0, 0);
    leftArm.render();

    // test box
    let box = new Cube();
    // box.color = [1, 0, 1, 1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0, 0.65, 0);

    box.matrix.rotate(-g_magentaAngle, 0, 0, 1);

    box.matrix.scale(.3, .3, .3);
    box.matrix.translate(-.5, 0, -0.001);
    box.render([1, 0, 1, 1]);

    // test pyramid
    let pyramid = new Pyramid();
    pyramid.color = [1, 1, 1, 1];
    pyramid.matrix.setScale(0.3, .65, .5);
    pyramid.render();

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
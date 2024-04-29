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
let u_Size;
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
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals Related to UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegmentNumber = 5;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;

function addActionsForHTMLUI() {
    // Button Events
    // document.getElementById("clearButton").onclick = function() {g_shapesList = []; renderAllShapes(); };

    // document.getElementById("pointButton").onclick = function() {g_selectedType = POINT};
    // document.getElementById("triButton").onclick = function() {g_selectedType = TRIANGLE};
    // document.getElementById("circButton").onclick = function() {g_selectedType = CIRCLE};

    // // Color Slider Events
    // document.getElementById("redslide").addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
    // document.getElementById("greenslide").addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
    // document.getElementById("blueslide").addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});
    
    // // Size/Segment Slider Events
    // document.getElementById("sizeslide").addEventListener('mouseup', function() {g_selectedSize = this.value;});
    // document.getElementById("segslide").addEventListener('mouseup', function() {g_selectedSegmentNumber = this.value;});
    
    // Joint Slider Events 
    document.getElementById("yellowslide").addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); }); 
    document.getElementById("magentaslide").addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); }); 

    // Camera Angle Slider Events
    document.getElementById("angleslide").addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHTMLUI();

    // Register function (event handler) tobe called on a mouse press
    // canvas.onmousedown = click;
    // canvas.onmousemove = function(ev) { if (ev.buttons==1) {click(ev)} }
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    renderAllShapes();
}

function renderAllShapes() {
    var startTime = performance.now();

    // Pass the matrix to u_ModelMatrix attribute
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Draw body cube
    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.setTranslate(-.25, -.75, 0.0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, .3, .5);
    body.render();

    // Draw left cube
    var leftArm = new Cube();
    leftArm.color = [1, 1, 0, 1];
    leftArm.matrix.setTranslate(0, -.5, 0.0);
    leftArm.matrix.rotate(-5, 1, 0, 0);
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25, .7, .5);
    leftArm.matrix.translate(-.5, 0, 0);
    leftArm.render();

    // test box
    var box = new Cube();
    box.color = [1, 0, 1, 1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0, 0.65, 0);
    box.matrix.rotate(-g_magentaAngle, 0, 0, 1);
    box.matrix.scale(.3, .3, .3);
    box.matrix.translate(-.5, 0, -0.001);
    box.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "fps");
}

function sendTextToHTML(text, htmlID) {
    var htmlEL = document.getElementById(htmlID);
    if (!htmlEL) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
    }
    htmlEL.innerHTML = text;
}

// var g_shapesList = [];

// function click(ev) {
//   let [x, y] = convertCoordinatesEventToGL(ev);

//   // Create and store the new shape
//   let point;
//   if (g_selectedType==POINT) {
//     point = new Point();
//   } else if (g_selectedType==TRIANGLE) {
//     point = new Triangle();
//   } else if (g_selectedType==CIRCLE) {
//     point = new Circle();
//     point.segments = g_selectedSegmentNumber;
//   }
//   point.position = [x, y];
//   point.color = g_selectedColor.slice();
//   point.size = g_selectedSize;

//   g_shapesList.push(point);

//   // Draw every shape that is supposed to be on the Canvas
//   renderAllShapes();
// }

// // Extract the event click and convert it to WebGL coordinates
// function convertCoordinatesEventToGL(ev) {
//     var x = ev.clientX; // x coordinate of a mouse pointer
//     var y = ev.clientY; // y coordinate of a mouse pointer
//     var rect = ev.target.getBoundingClientRect();

//     x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
//     y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

//     return([x, y]);
// }
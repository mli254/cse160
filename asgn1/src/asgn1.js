// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const ERASE = 3;

// Globals Related to UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegmentNumber = 5;

function addActionsForHTMLUI() {
    // Button Events
    document.getElementById("clearButton").onclick = function() {g_shapesList = []; points = []; renderAllShapes(); };
    document.getElementById("eraseButton").onclick = function() {g_selectedType = ERASE; };


    document.getElementById("pointButton").onclick = function() {g_selectedType = POINT};
    document.getElementById("triButton").onclick = function() {g_selectedType = TRIANGLE};
    document.getElementById("circButton").onclick = function() {g_selectedType = CIRCLE};

    // Color Slider Events
    document.getElementById("redslide").addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
    document.getElementById("greenslide").addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
    document.getElementById("blueslide").addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});
    
    // Size/Segment Slider Events
    document.getElementById("sizeslide").addEventListener('mouseup', function() {g_selectedSize = this.value;});
    document.getElementById("segslide").addEventListener('mouseup', function() {g_selectedSegmentNumber = this.value;});

}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHTMLUI();

    // Register function (event handler) tobe called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if (ev.buttons==1) {click(ev)} }
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
var points = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new shape
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else if (g_selectedType==CIRCLE) {
    point = new Circle();
    point.segments = g_selectedSegmentNumber;
  } else {
    point = new Eraser();
    points.push(x);
    points.push(y);
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;

  g_shapesList.push(point);

  // Draw every shape that is supposed to be on the Canvas
  renderAllShapes();
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

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var point_len = points.length;
    for (var i = 1; i < point_len; i++) {
      drawLine([points[i-3], points[i-2], points[i-1], points[i]], g_selectedSize);
    }
}
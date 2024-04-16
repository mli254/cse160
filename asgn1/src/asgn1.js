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
const SYMM = 3;

// Globals Related to UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegmentNumber = 5;

function addActionsForHTMLUI() {
    // Button Events
    document.getElementById("clearButton").onclick = function() {g_shapesList = []; points = []; renderAllShapes(); };
    document.getElementById("symmButton").onclick = function() {g_selectedType = SYMM; };
    document.getElementById("drawButton").onclick = drawPicture;

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
      drawLine([points[i-3], points[i-2], points[i-1], points[i]], g_selectedSize, g_selectedColor);
    }
}

function drawPicture() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    var r = 15.0;
    var rgba = [92.2/100, 72.9/100, 20.4/100, 1.0]
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // ---- BACKGROUND
    drawTriangle([-1, 1, 1, -1, 1, 1]);
    rgba = [92.2/100, 60/100, 20.4/100, 1.0]
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle([-1, 1, 1, -1, -1, -1]);

    // ---- BACK HAIR
    rgba = [84.7/100, 92.5/100, 95.3/100, 1.0]
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    drawTriangle([-4/r, -2/r, 10/r, -3/r, -4/r, -14/r]);


    // ---- NECK
    rgba = [67.1/100, 32.2/100, 21.2/100, 1.0]
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    drawTriangle([0/r, -5/r, 1/r, -5/r, 1/r, -8/r]);
    drawTriangle([0/r, -10/r, 1/r, -10/r, 1/r, -8/r]);

    // ---- SKIN
    rgba = [1.0, 0.8, 0.667, 1.0];
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    drawTriangle([-4/r, 7/r, -4/r, 2/r, 3/r, 2/r]);
    drawTriangle([-4/r, 2/r, -5/r, 0/r, 1/r, 0/r]);
    drawTriangle([-4/r, 2/r, 1/r, 0/r, 1/r, 2/r]);
    drawTriangle([-6/r, -1/r, -5/r, 0/r, -4/r, -2/r]);
    drawTriangle([-4/r, -2/r, -3/r, -5/r, 1/r, -2/r]);
    drawTriangle([1/r, 0/r, -5/r, 0/r, -4/r, -2/r]);
    drawTriangle([1/r, 0/r, 1/r, -2/r, -4/r, -2/r]);
    drawTriangle([-3/r, -5/r, -2/r, -6/r, 1/r, -5/r]);
    drawTriangle([-3/r, -5/r, 1/r, -2/r, 1/r, -5/r]);

    // ---- CLOTHES
    rgba = [51.4/100, 46.3/100, 61.2/100, 1.0]
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    drawTriangle([-5/r, -15/r, 7/r, -3/r, 13/r, -15/r])
    drawTriangle([-1/r, -10/r, 0/r, -10/r, -1/r, -11/r])

    // ---- HAIR
    rgba = [1.0, 1.0, 1.0, 1.0];

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Draw
    drawTriangle([-8/r, 4/r, -7/r, 8/r, -6/r, 4/r]);
    drawTriangle([-7/r, 8/r, -5/r, 10/r, -5/r, 8/r]);
    drawTriangle([-7/r, 6/r, -6/r, 6/r, -6/r, 4/r]);
    drawTriangle([-8/r, 4/r, -7/r, 8/r, -4/r, 8/r]);
    drawTriangle([-1/r, 12/r, -5/r, 10/r, -1/r, 10/r]);
    drawTriangle([-5/r, 7/r, -6/r, 4/r, -5/r, 3/r]);
    drawTriangle([-5/r, 7/r, -5/r, 3/r, -2/r, 3/r]);
    drawTriangle([-5/r, 10/r, -2/r, 10/r, -2/r, 3/r]);
    drawTriangle([-5/r, 10/r, -5/r, 7/r, -2/r, 3/r]);
    drawTriangle([-1/r, 12/r, 2/r, 12/r, 1/r, 3/r]);
    drawTriangle([-1/r, 12/r, -2/r, 5/r, 0/r, 3/r]);
    drawTriangle([-5/r, 10/r, -1/r, 12/r, -2/r, 5/r]);
    drawTriangle([-1/r, 12/r, 1/r, 3/r, 0/r, 3/r]);
    drawTriangle([2/r, 12/r, 1/r, 3/r, 10/r, 9/r]);
    drawTriangle([11/r, 7/r, 1/r, 3/r, 10/r, 9/r]);
    drawTriangle([11/r, 7/r, 1/r, 3/r, 11/r, -7/r]);
    drawTriangle([11/r, -7/r, 7/r, -9/r, 13/r, -12/r]);
    drawTriangle([4/r, -9/r, 7/r, -9/r, 7/r, -11/r]);
    drawTriangle([1/r, 3/r, 1/r, -10/r, 4/r, -9/r]);
    drawTriangle([1/r, 3/r, 4/r, -9/r, 7/r, -9/r]);
    drawTriangle([1/r, 3/r, 11/r, -7/r, 7/r, -9/r]);
    drawTriangle([0/r, -15/r, 1/r, -10/r, 1/r, -15/r]);
    drawTriangle([4/r, -9/r, 1/r, -10/r, 4/r, -15/r]);
    drawTriangle([1/r, -15/r, 1/r, -10/r, 4/r, -15/r]);
    // ----  EYE
    drawTriangle([-2/r, 2/r, -3/r, 1/r, 0/r, 1/r]);
    
    // ---- EYELID
    rgba = [98.8/100, 69.8/100, 59.6/100, 1.0]
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle([-1/r, 4/r, -2/r, 2/r, 0/r, 1/r]);
    // ---- FLOWER
    rgba = [51.4/100, 46.3/100, 61.2/100, 1.0]
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    drawDiamond(4, 7, r);
    drawDiamond(6, 9, r);
    drawDiamond(8, 7, r);
    drawDiamond(6, 5, r);
  }

  function drawDiamond(coordx, coordy, r) {
    drawTriangle([coordx/r, coordy/r, (coordx-1)/r, (coordy-1)/r, coordx/r, (coordy-2)/r]);
    drawTriangle([coordx/r, coordy/r, (coordx+1)/r, (coordy-1)/r, coordx/r, (coordy-2)/r]);
  }
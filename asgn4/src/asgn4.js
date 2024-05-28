// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position; // gives position in world coordinates
  }`

// Fragment shader program
// CREDIT: referenced code from https://gold-mari.github.io/160-Asgn-4/src/asg4.html for how to determine the spotlight angle
var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform bool u_pointLightOn;
  uniform bool u_spotLightOn;
  uniform vec3 u_pointLightPos;
  uniform vec3 u_spotLightPos;
  uniform vec3 u_spotLightAt;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); // using normal
    } else if (u_whichTexture == -2) {
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

    // Declare composite lighting color
    vec4 totalLight = vec4(0,0,0,1);

    // Point Light
    if (u_pointLightOn) {
        vec3 lightVector = u_pointLightPos-vec3(v_VertPos);
        float r = length(lightVector);

        // N dot L
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N,L), 0.0);

        // Reflection
        vec3 R = reflect(-L, N);
        
        // eye
        vec3 F = normalize(u_cameraPos-vec3(v_VertPos));

        // Specular
        float specular = pow(max(dot(F, R), 0.0), 10.0);

        vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;

        totalLight += vec4(specular+diffuse+ambient, 1.0);
    }

    // Spot Light
    if (u_spotLightOn) {
      vec3 lightVector = u_spotLightPos-vec3(v_VertPos);
      vec3 directionVector = u_spotLightPos - u_spotLightAt;
      vec3 D = normalize(directionVector);

      float r = length(lightVector);

      // N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);
      float angle = degrees(acos(dot(D, L)));

      // Reflection
      vec3 R = reflect(-L, N);
      
      // eye
      vec3 F = normalize(u_cameraPos-vec3(v_VertPos));

      // Specular
      float specular = pow(max(dot(F, R), 0.0), 10.0);

      vec3 diffuse = vec3(gl_FragColor) * nDotL;
      vec3 totalSpotLight = specular+diffuse;

      float constraint = 15.0;
      if (angle < constraint) {
        float angleNorm = angle/constraint;
        float amt = angleNorm*angleNorm*angleNorm;
        totalSpotLight = (1.0-amt)*totalSpotLight;
        totalLight += vec4(totalSpotLight, 1.0);
      }  
    }
    gl_FragColor = totalLight;

  }`

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;

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
let u_pointLightPos;
let u_spotLightPos;
let u_spotLightAt;
let u_cameraPos;
let u_pointLightOn;
let u_spotLightOn;

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

    // Get the storage location of a_Position
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

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
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

    u_pointLightPos = gl.getUniformLocation(gl.program, 'u_pointLightPos');
    if (!u_pointLightPos) {
      console.log("Failed to get the storage location of u_pointLightPos");
      return false;
    }

    u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
    if (!u_spotLightPos) {
      console.log("Failed to get the storage location of u_spotLightPos");
      return false;
    }

    u_spotLightAt = gl.getUniformLocation(gl.program, 'u_spotLightAt');
    if (!u_spotLightAt) {
      console.log("Failed to get the storage location of u_spotLightAt");
      return false;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
      console.log("Failed to get the storage location of u_cameraPos");
      return false;
    }

    u_pointLightOn = gl.getUniformLocation(gl.program, 'u_pointLightOn');
    if (!u_pointLightOn) {
      console.log("Failed to get the storage location of u_pointLightOn");
      return false;
    }

    u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');
    if (!u_spotLightOn) {
      console.log("Failed to get the storage location of u_spotLightOn");
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

let g_normalOn = false;
let g_pointLightOn = true;
let g_spotLightOn = true;
let g_pointLightPos = [0, 0, 1];
let g_spotLightPos = [-0.5, 1, 3];
let g_spotLightAt = [1, 0, -2];

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
    // Normal Debug Button Events
    document.getElementById("normalOn").onclick = function() {g_normalOn = true;};
    document.getElementById("normalOff").onclick = function() {g_normalOn = false;};

    // Point Light On/Off Button Events
    document.getElementById("pointLightOn").onclick = function() {g_pointLightOn = true;};
    document.getElementById("pointLightOff").onclick = function() {g_pointLightOn = false;};

    // Spot Light On/Off Button Events
    document.getElementById("spotLightOn").onclick = function() {g_spotLightOn = true;};
    document.getElementById("spotLightOff").onclick = function() {g_spotLightOn = false;};

    // Point Light Slider Events
    document.getElementById("pointLightSlideX").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_pointLightPos[0] = this.value/100; renderAllShapes();}})
    document.getElementById("pointLightSlideY").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_pointLightPos[1] = this.value/100; renderAllShapes();}})
    document.getElementById("pointLightSlideZ").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_pointLightPos[2] = this.value/100; renderAllShapes();}})
    
    // Spot Light Slider Events
    document.getElementById("spotLightSlideX").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_spotLightPos[0] = this.value/100; renderAllShapes();}})
    document.getElementById("spotLightSlideY").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_spotLightPos[1] = this.value/100; renderAllShapes();}})
    document.getElementById("spotLightSlideZ").addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_spotLightPos[2] = this.value/100; renderAllShapes();}})  

      // Animation Button Events
    document.getElementById("aniBodyOffButton").onclick = function() {g_bodyAnimation = false;};
    document.getElementById("aniBodyOnButton").onclick = function() {g_bodyAnimation = true;};
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHTMLUI();

    initTextures();

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

    g_pointLightPos[0] = Math.cos(g_seconds);
}

let g_camera = new Camera();
let g_fov = 60;
let g_size = 5;

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

    // Passing light position to GLSL
    gl.uniform3f(u_pointLightPos, g_pointLightPos[0], g_pointLightPos[1], g_pointLightPos[2]);

    gl.uniform3f(u_spotLightPos, g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);

    gl.uniform3f(u_spotLightAt, g_spotLightAt[0], g_spotLightAt[1], g_spotLightAt[2]);

    // Passing the camera position to GLSL
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

    // Determine whether to draw point light or not
    gl.uniform1i(u_pointLightOn, g_pointLightOn);

    // Determine whether to draw spot light or not
    gl.uniform1i(u_spotLightOn, g_spotLightOn);

    // Draw point light
    let pointLight = new Cube();
    pointLight.color = [2, 2, 0, 1];
    pointLight.matrix.translate(g_pointLightPos[0], g_pointLightPos[1], g_pointLightPos[2]);
    pointLight.matrix.scale(-.1, -.1, -.1);
    pointLight.matrix.translate(-0.5, -0.5, -0.5);
    pointLight.render();

    // Draw spot light
    let spotLight = new Cube();
    spotLight.color = [2, 2, 0, 1];
    spotLight.matrix.translate(g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);
    spotLight.matrix.scale(-.1, -.1, -.1);
    spotLight.matrix.translate(-0.5, -0.5, -0.5);
    spotLight.render();

    // Draw skybox
    let sky = new Cube();
    sky.color = [1, 1, 1, 1];
    sky.textureNum = 0;
    if (g_normalOn == true) {
      sky.textureNum = -3;
    }
    sky.matrix.scale(-g_size, -g_size, -g_size);
    sky.matrix.translate(-0.5, -0.5, -0.500001);
    sky.render();

    // Draw floor
    let floor = new Cube();
    floor.color = [1,1,1,1];
    floor.textureNum = 1;
    floor.matrix.scale(-g_size, 1, -g_size);
    floor.matrix.translate(-0.500001, -2.5, -0.5);
    floor.render();

    // Draw bear
    let bear = new Bear();
    bear.modelMatrix.scale(0.5, 0.5, 0.5);
    bear.modelMatrix.translate(1, -1.5, 1);
    bear.render();

    // Draw sphere
    let sphere = new Sphere();
    sphere.textureNum = 3;
    if (g_normalOn == true) {
      sphere.textureNum = -3;
    }
    sphere.matrix.scale(0.5, 0.5, 0.5);
    sphere.matrix.translate(-1, -1.5, 0);
    sphere.render();

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
  }
  renderAllShapes();
}
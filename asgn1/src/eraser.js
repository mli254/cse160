class Eraser {
    constructor() {
        this.type = "eraser";
        this.position = [0.0, 0.0, 0.0];
        this.color = [0.0, 0.0, 0.0, 1.0];
        this.size = 5.0;
    }
    
    render() {
        
    }
}

function drawLine(vertices, size) {
    var rgba = [1.0, 0.0, 0.0, 1.0];
    var size = size;
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, size);

    var n = 2; // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.LINES, 0, n);
}
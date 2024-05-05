class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }

    render(color = this.color) {
        this.color = color;
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw front of the cube
        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        // Fake lighting
        gl.uniform4f(u_FragColor, rgba[0], rgba[1]*.8, rgba[2]*.9, rgba[3]);

        // Draw top of the cube
        drawTriangle3DUV([0, 1, 0,  0, 1, 1,  1, 1, 1],  [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0, 1, 0,  1, 1, 1,  1, 1, 0], [0,0, 1,1, 1,0]);

        // Draw bottom of the cube
        drawTriangle3DUV([0, 0, 0,  1, 0, 1,  1, 0, 0],  [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0, 0, 0,  0, 0, 1,  1, 0, 1], [0,0, 0,1, 1,1]);

        // Fake lighting
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.7, rgba[2]*.8, rgba[3]);
        
        // Draw left side of the cube
        drawTriangle3DUV([0, 0, 1,  0, 1, 0,  0, 0, 0],  [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0, 0, 1,  0, 1, 1,  0, 1, 0], [0,0, 0,1, 1,1]);

        // Draw right side of the cube
        drawTriangle3DUV([1, 0, 0,  1, 1, 1,  1, 0, 1],  [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1, 0, 0,  1, 1, 0,  1, 1, 1], [0,0, 0,1, 1,1]);

        // Fake lighting
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.6, rgba[2]*.7, rgba[3]);

        // Draw back side of the cube
        drawTriangle3DUV([0, 0, 1,  1, 1, 1,  1, 0, 1],  [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0, 0, 1,  0, 1, 1,  1, 1, 1], [0,0, 0,1, 1,1]);
    }
}
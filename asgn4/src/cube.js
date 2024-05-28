class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.verticesBuffer = null;
        this.uvBuffer = null;
        this.normalBuffer = null;
        this.vertices = [
            0, 0, 0,  1, 1, 0,  1, 0, 0, // Front
            0, 0, 0,  0, 1, 0,  1, 1, 0,
            0, 1, 0,  0, 1, 1,  1, 1, 1, // Top
            0, 1, 0,  1, 1, 1,  1, 1, 0,
            0, 0, 0,  1, 0, 1,  1, 0, 0, // Bottom
            0, 0, 0,  0, 0, 1,  1, 0, 1,
            0, 0, 1,  0, 1, 0,  0, 0, 0, // Left
            0, 0, 1,  0, 1, 1,  0, 1, 0,
            1, 0, 0,  1, 1, 1,  1, 0, 1, // Right
            1, 0, 0,  1, 1, 0,  1, 1, 1,
            0, 0, 1,  1, 1, 1,  1, 0, 1, // Back
            0, 0, 1,  0, 1, 1,  1, 1, 1
        ]
        this.uvs = [
            0,0, 1,1, 1,0, // Front
            0,0, 0,1, 1,1,
            0,0, 0,1, 1,1, // Top
            0,0, 1,1, 1,0,
            0,0, 1,1, 1,0, // Bottom
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, // Left
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, // Right
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, // Back
            0,0, 0,1, 1,1
        ];
        this.normals = [
            0, 0, -1,  0, 0, -1,  0, 0, -1, // Front
            0, 0, -1,  0, 0, -1,  0, 0, -1,
            0, 1, 0,  0, 1, 0,  0, 1, 0, // Top
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            0, -1, 0,  0, -1, 0,  0, -1, 0, // Bottom
            0, -1, 0,  0, -1, 0,  0, -1, 0,
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0, // Left
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            1, 0, 0,  1, 0, 0,  1, 0, 0, // Right
            1, 0, 0,  1, 0, 0,  1, 0, 0,
            0, 0, 1,  0, 0, 1,  0, 0, 1, // Back
            0, 0, 1,  0, 0, 1,  0, 0, 1,
        ]
    }

    render(color = this.color) {
        this.color = color;
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (this.verticesBuffer == null) {
            this.verticesBuffer = gl.createBuffer();
            if (!this.verticesBuffer) {
                console.log('Failed to create the vertices buffer object');
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        }

        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // --- copy for UVs

        if (this.uvBuffer == null) {
            this.uvBuffer = gl.createBuffer();
            if (!this.uvBuffer) {
                console.log('Failed to create the uv buffer object');
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        }

        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.DYNAMIC_DRAW);

        // Assign the buffer object to a_UV variable
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_UV variable
        gl.enableVertexAttribArray(a_UV);

        // --- copy for normals

        if (this.normalBuffer == null) {
            this.normalBuffer = gl.createBuffer();
            if (!this.normalBuffer) {
                console.log('Failed to create the normal buffer object');
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        }

        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.DYNAMIC_DRAW);

        // Assign the buffer object to a_UV variable
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_UV variable
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, 36);        
    }
}
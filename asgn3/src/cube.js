class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.verticesBuffer = null;
        this.uvBuffer = null;
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
        this.frontVertices = [
            0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0, 
            0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0
        ];
        this.topVertices = [
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0
        ];
        this.bottomVertices = [
            0, 0, 0,  1, 0, 1,  1, 0, 0, // Bottom
            0, 0, 0,  0, 0, 1,  1, 0, 1
        ];
        this.leftVertices = [
            0, 0, 1,  0, 1, 0,  0, 0, 0, // Left
            0, 0, 1,  0, 1, 1,  0, 1, 0
        ];
        this.rightVertices = [
            1, 0, 0,  1, 1, 1,  1, 0, 1, // Right
            1, 0, 0,  1, 1, 0,  1, 1, 1
        ];
        this.backVertices = [
            0, 0, 1,  1, 1, 1,  1, 0, 1, // Back
            0, 0, 1,  0, 1, 1,  1, 1, 1
        ];
        this.frontUVs = [
            0,0, 1,1, 1,0, // Front
            0,0, 0,1, 1,1
        ];
        this.topUVs = [
            0,0, 0,1, 1,1, // Top
            0,0, 1,1, 1,0
        ];
        this.bottomUVs = [
            0,0, 1,1, 1,0, // Bottom
            0,0, 0,1, 1,1
        ];
        this.leftUVs = [
            0,0, 1,1, 1,0, // Left
            0,0, 0,1, 1,1
        ];
        this.rightUVs = [
            0,0, 1,1, 1,0, // Right
            0,0, 0,1, 1,1
        ];
        this.backUVs = [
            0,0, 1,1, 1,0, // Back
            0,0, 0,1, 1,1
        ];
    }

    render(color = this.color) {
        this.color = color;
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (this.textureNum === -2) {
            // Draw front of the cube
            drawTriangle3DUV(this.frontVertices, this.frontUVs, 6);

            // Fake lighting
            gl.uniform4f(u_FragColor, rgba[0], rgba[1]*.8, rgba[2]*.9, rgba[3]);

            // Draw top of the cube
            drawTriangle3DUV(this.topVertices, this.topUVs, 6);
            
            // Draw bottom of the cube
            drawTriangle3DUV(this.bottomVertices, this.bottomUVs, 6);
           
            // Fake lighting
            gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.7, rgba[2]*.8, rgba[3]);
            
            // Draw left side of the cube
            drawTriangle3DUV(this.leftVertices, this.leftUVs, 6);
            
            // Draw right side of the cube
            drawTriangle3DUV(this.rightVertices, this.rightUVs, 6);
            
            // Fake lighting
            gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.6, rgba[2]*.7, rgba[3]);

            // Draw back side of the cube
            drawTriangle3DUV(this.backVertices, this.backUVs, 6);
        } else {
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
                    console.log('Failed to create the vertices buffer object');
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

            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }
        
    }
}
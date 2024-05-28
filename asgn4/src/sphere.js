class Sphere {
    constructor() {
        this.type = "sphere";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.verts32 = new Float32Array([]);

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
        let rgba = this.color;

        if (g_normalOn == true) {
            this.textureNum = -3;
        }

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let d = Math.PI/10;
        let dd = Math.PI/10;

        for (let t = 0; t < Math.PI; t+=d) {
            for (let r = 0; r < (2*Math.PI); r += d) {
                let p1 = [sin(t)*cos(r), sin(t)*sin(r), cos(t)];
                let p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
                let p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
                let p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];

                let uv1 = [t/Math.PI, r/(2*Math.PI)];
                let uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                let uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
                let uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                let v = [];
                let uv = [];
                v = v.concat(p1); uv=uv.concat(uv1);
                v = v.concat(p2); uv=uv.concat(uv2);
                v = v.concat(p4); uv=uv.concat(uv4);

                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangle3DUVNormal(v, uv, v);

                v = []; uv = [];
                v = v.concat(p1); uv=uv.concat(uv1);
                v = v.concat(p4); uv=uv.concat(uv4);
                v = v.concat(p3); uv=uv.concat(uv3);

                gl.uniform4f(u_FragColor, 1, 0, 0, 1);
                drawTriangle3DUVNormal(v, uv, v);
            }
        }      
    }
}

function sin(value) {
    return Math.sin(value);
}

function cos(value) {
    return Math.cos(value);
}
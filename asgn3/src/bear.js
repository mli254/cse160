class Bear {
    constructor() {
        this.type = "bear";
        this.buffer = null;
        this.modelMatrix = new Matrix4();
    }

    render() {
        // Colors
        let black = [0.278, 0.2, 0.212, 1];
        let features = [0.29, 0.122, 0.2, 1, 1];
        let underside = [0.659, 0.584, 0.502, 1];
        let offwhite = [0.812, 0.741, 0.675, 1];

        // Joints
        let bodyCoordinatesMat;
        let headCoordinatesMat;

        let faceCoordinatesMat;
        let dotDimensionsMat;

        let rightArmCoordinatesMat;
        let rightArmDimensionsMat;

        let leftArmCoordinatesMat;
        let leftArmDimensionsMat;

        // Draw body cube
        let body = new Cube();
        body.color = black;
        body.textureNum = -2;
        body.matrix.translate(-0.2, -0.2, -0.2);
        // Rotate the body from side to side
        body.matrix.rotate(-g_bodyAngleX, 0, 1, 0);
        body.matrix.translate(g_bodyMove, 0, 0);
        // Save coordinates to allow child objects
        bodyCoordinatesMat = new Matrix4(body.matrix);
        // Scale body
        body.matrix.scale(0.7, 0.5, 0.5);
        body.render();

        // == HEAD ====================
        // Draw the neck cube
        let neck = new Cube();
        neck.color = black;
        neck.textureNum = -2;
        // Attach the neck to the main body
        neck.matrix = new Matrix4(bodyCoordinatesMat);
        neck.matrix.translate(-0.2, 0, 0);
        neck.matrix.scale(0.3, 0.6, 0.5);
        neck.render();

        // Draw the head cube
        let head = new Cube();
        head.color = black;
        head.textureNum = -2;
        // Attach the head to the main body
        head.matrix = new Matrix4(bodyCoordinatesMat);
        head.matrix.translate(-0.4, 0.3, 0.05);
        // Save coordinates to allow child objects
        headCoordinatesMat = new Matrix4(head.matrix);
        head.matrix.scale(0.35, 0.3, 0.4);
        head.render();

        // Draw the face cube
        let face = new Cube();
        face.color = underside;
        face.textureNum = -2;
        // Attach the face to the head
        face.matrix = new Matrix4(headCoordinatesMat);
        face.matrix.translate(-0.05, 0.0001, 0.1);
        // Save coordinates to allow child objects
        faceCoordinatesMat = new Matrix4(face.matrix);
        face.matrix.scale(0.15, 0.15, 0.2);
        face.render();

        // == FEATURES (EYES/NOSE) ==================
        let nose = new Cube();
        nose.color = features;
        nose.textureNum = -2;
        // Attach nose to the face
        nose.matrix = new Matrix4(faceCoordinatesMat);
        nose.matrix.translate(-0.005, 0.10001, 0.08);
        nose.matrix.scale(0.05, 0.05, 0.05);
        dotDimensionsMat = new Matrix4(nose.matrix);
        nose.render();

        let leftEye = new Cube();
        leftEye.color = offwhite;
        leftEye.textureNum = -2;
        leftEye.matrix = dotDimensionsMat;
        leftEye.matrix.translate(0.9, 0.7, 2.5);
        leftEye.render();

        let rightEye = new Cube();
        rightEye.color = offwhite;
        rightEye.textureNum = -2;
        rightEye.matrix = new Matrix4(leftEye.matrix);
        rightEye.matrix.translate(0, 0, -5.2);
        rightEye.render();

        // == EARS =======================
        let rightEar = new Cube();
        rightEar.color = black;
        rightEar.matrix = new Matrix4(headCoordinatesMat);
        rightEar.matrix.scale(0.05, 0.1, 0.1);
        rightEar.matrix.translate(0.5, 2.5, 0.25);
        rightEar.render();

        let leftEar = new Cube();
        leftEar.color = black;
        leftEar.matrix = new Matrix4(rightEar.matrix);
        leftEar.matrix.translate(0, 0, 2.5);
        leftEar.render();

        // == LEGS ==============================
        // Draw front right
        let frontRightArm = new Cube();
        frontRightArm.color = black;
        // Attach front right arm to the main body
        frontRightArm.matrix = new Matrix4(bodyCoordinatesMat);
        frontRightArm.matrix.translate(0.01, -0.3, 0);
        // Animate the arm
        frontRightArm.matrix.rotate(-g_rightArmAngle, 0, 0, 1);
        frontRightArm.matrix.translate(0, g_rightArmMove, 0);
        // Save coordinates to allow child objects
        rightArmCoordinatesMat = new Matrix4(frontRightArm.matrix);
        frontRightArm.matrix.scale(0.2, 0.4, 0.2);
        // Save the dimensions of the arm in order to duplicate it
        rightArmDimensionsMat = new Matrix4(frontRightArm.matrix);
        frontRightArm.render();

        // Draw back right
        let backRightArm = new Cube();
        backRightArm.color = black;
        // Copy the dimensions of the arm
        backRightArm.matrix = rightArmDimensionsMat;
        backRightArm.matrix.translate(2, 0, 0);
        backRightArm.render();

        // Draw front left
        let frontLeftArm = new Cube();
        frontLeftArm.color = black;
        // Attach front left arm to the main body
        frontLeftArm.matrix = new Matrix4(bodyCoordinatesMat);
        frontLeftArm.matrix.translate(0.01, -0.3, 0.3);
        // Animate the arm
        frontLeftArm.matrix.rotate(-g_leftArmAngle, 0, 0, 1);
        frontLeftArm.matrix.translate(0, g_leftArmMove, 0);
        // Save coordinates to allow child objects
        leftArmCoordinatesMat = new Matrix4(frontLeftArm.matrix);
        frontLeftArm.matrix.scale(0.2, 0.4, 0.2);
        // Save the dimensions of the arm in order to duplicate it
        leftArmDimensionsMat = new Matrix4(frontLeftArm.matrix);
        frontLeftArm.render();

        // Draw back left
        let backLeftArm = new Cube();
        backLeftArm.color = black;
        // Copy the dimensions of the arm
        backLeftArm.matrix = leftArmDimensionsMat;
        backLeftArm.matrix.translate(2, 0, 0);
        backLeftArm.render();

        // == PAWS =================
        // Draw front right paw
        let frontRightPaw = new Cube();
        // Attach the paw to the arm
        frontRightPaw.matrix = new Matrix4(rightArmCoordinatesMat);
        frontRightPaw.matrix.translate(-0.05, 0.01, 0.001);
        // Rotate the paw up and down
        frontRightPaw.matrix.rotate(g_rightPawAngle, 0, 0, 1);
        frontRightPaw.matrix.translate(0, g_rightPawMove, 0);
        frontRightPaw.matrix.scale(.2, .1, .19);
        frontRightPaw.render(black);

        // Draw front left paw
        let frontLeftPaw = new Cube();
        // Attach the paw to the arm
        frontLeftPaw.matrix = new Matrix4(leftArmCoordinatesMat);
        frontLeftPaw.matrix.translate(-0.05, 0.01, 0.001);
        // Rotate the paw up and down
        frontLeftPaw.matrix.rotate(g_leftPawAngle, 0, 0, 1);
        frontLeftPaw.matrix.translate(0, g_leftPawMove, 0);
        frontLeftPaw.matrix.scale(.2, .1, .19);
        frontLeftPaw.render(black);

        // Draw back right paw
        let backRightPaw = new Cube();
        // Attach the paw to the arm
        backRightPaw.matrix = new Matrix4(rightArmCoordinatesMat);
        backRightPaw.matrix.translate(0.35, 0.01, 0.001);
        // Rotate the paw up and down
        backRightPaw.matrix.rotate(g_rightPawAngle, 0, 0, 1);
        backRightPaw.matrix.translate(0, g_rightPawMove, 0);
        backRightPaw.matrix.scale(.2, .1, .19);
        backRightPaw.render(black);

        let backLeftPaw = new Cube();
        // Attach the paw to the arm
        backLeftPaw.matrix = new Matrix4(leftArmCoordinatesMat);
        backLeftPaw.matrix.translate(0.35, 0.01, 0.001);
        // Rotate the paw up and down
        backLeftPaw.matrix.rotate(g_leftPawAngle, 0, 0, 1);
        backLeftPaw.matrix.translate(0, g_leftPawMove, 0);
        backLeftPaw.matrix.scale(.2, .1, .19);
        backLeftPaw.render(black);
    }
}
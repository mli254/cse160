class Camera {
    constructor() {
        this.eye = new Vector3([0,0,3]);
        this.eye = new Vector3([0,0,-100]);
        this.up = new Vector3([0,1,0]);
    }

    moveForward() {
        
        // Make a copy of g_at for calculating d
        copy_at = new Vector3();
        copy_at.set(g_at);
    
        // d = at - eye
        d = new Vector3();
        d.set(copy_at.sub(g_eye));
        d.normalize();
    
        g_eye.add(d);
        g_at.add(d);
    }
    
    moveBackward() {
        // Make a copy of g_at for calculating d
        copy_at = new Vector3();
        copy_at.set(g_at);
    
        // d = at - eye
        d = new Vector3();
        d.set(copy_at.sub(g_eye));
        d.normalize();
    
        g_eye.sub(d);
        g_at.sub(d);
    }
    
    moveLeft() {
        // Make a copy of g_at for calculating d
        copy_at = new Vector3();
        copy_at.set(g_at);
    
        // d = at - eye
        d = new Vector3();
        d.set(copy_at.sub(g_eye));
        left = new Vector3();
        left.set(Vector3.cross(d, g_up));
        left.normalize();
    
        g_eye.sub(left);
        g_at.sub(left);
    }
    
    moveRight() {
        // Make a copy of g_at for calculating d
        copy_at = new Vector3();
        copy_at.set(g_at);
    
        // d = at - eye
        d = new Vector3();
        d.set(copy_at.sub(g_eye));
        d.mul(-1);
        
        right = new Vector3();
        right.set(Vector3.cross(d, g_up));
        right.normalize();
    
        g_eye.sub(right);
        g_at.sub(right);
    }
}
class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([-1,-0.5,2]);
        this.at = new Vector3([50, 0,-100]);
        this.up = new Vector3([0,1,0]);
    }

    moveForward() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);
      
        let d = copy_at.sub(this.eye);
        d.normalize();
      
        this.eye.add(d);
        this.at.add(d);
    }
      
    moveBackward() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);

        // d = at - eye
        let d = copy_at.sub(this.eye);
        d.normalize();
      
        this.eye.sub(d);
        this.at.sub(d);
    }
      
    moveLeft() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);
      
        // d = at - eye
        let d = copy_at.sub(this.eye);
        let left = Vector3.cross(d, this.up);
        left.normalize();
      
        this.eye.sub(left);
        this.at.sub(left);
    }
      
    moveRight() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);
      
        // d = at - eye
        let d = copy_at.sub(this.eye);
        d.mul(-1);
        
        let right = Vector3.cross(d, this.up);
        right.normalize();
      
        this.eye.sub(right);
        this.at.sub(right);
    }

    moveUp() {
        this.eye.add(this.up);
    }

    moveDown() {
        this.eye.sub(this.up);
    }

    turnRight() {
        let copy_at = new Vector3();
        copy_at.set(this.at);

        // d = at - eye
        let d = copy_at.sub(this.eye);
        let r = Math.sqrt((d.elements[0]*d.elements[0]) + (d.elements[2]*d.elements[2]));

        let pheta = Math.atan2(d.elements[2], d.elements[0]);
        pheta += 5*(Math.PI/180);
        let newX = r*Math.cos(pheta);
        let newY = r*Math.sin(pheta);
        d.elements[0] = newX;
        d.elements[2] = newY;

        this.at = d.add(this.eye);
    }

    turnLeft() {
        let copy_at = new Vector3();
        copy_at.set(this.at);

        // d = at - eye
        let d = copy_at.sub(this.eye);
        let r = Math.sqrt((d.elements[0]*d.elements[0]) + (d.elements[2]*d.elements[2]));

        let pheta = Math.atan2(d.elements[2], d.elements[0]);
        pheta -= 5*(Math.PI/180);
        let newX = r*Math.cos(pheta);
        let newY = r*Math.sin(pheta);
        d.elements[0] = newX;
        d.elements[2] = newY;

        this.at = d.add(this.eye);
    }

    // Code for camera panning up/down from: https://people.ucsc.edu/~jbrowne2/asgn3/World.html
    turnUp() {
        this.at.elements[1] += 5;
    }

    turnDown() {
        this.at.elements[1] -= 5;
    }
}
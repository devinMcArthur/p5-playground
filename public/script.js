let cols, rows;
let scl = 20;  // scale of each cell in the grid
let inc = 0.5; // increment of the noise
let flowfield;
let particles = [];
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(45);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);

  for (let i = 0; i < 500; i++) {
    particles[i] = new Particle();
  }
  background(9, 1, 0);
}

function draw() {
  background(9, 1, 0, 10);
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;

      // let angle;
      let angle = noise(xoff, yoff) * TWO_PI * 4;
      // if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
      //   // If the cursor is within the bounds of the canvas, calculate the angle adjustment
      //   let distanceToCursor = dist(x * scl, y * scl, mouseX, mouseY);
      //   let angleAdjustment = map(distanceToCursor, 0, width, -PI, PI);
      //   angle = noise(xoff, yoff) * TWO_PI * 4 + angleAdjustment;
      // } else {
      //   // If the cursor is outside the bounds of the canvas, don't apply the angle adjustment
      //   angle = noise(xoff, yoff) * TWO_PI * 4;
      // }
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += inc;
      push();
      translate(x * scl, y * scl);
      rotate(v.heading());
      pop();
    }
    yoff += inc;
  }

  let cursorPos = createVector(mouseX, mouseY);
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    let x = floor(particle.pos.x / scl);
    let y = floor(particle.pos.y / scl);
    let index = x + y * cols;
    let force = flowfield[index];
    particle.applyConstantForce();
    particle.applyForce(force);
    // particle.randomWalk();
    particle.update(cursorPos);
    particle.edges();
    particle.show();
  }

  t += 0.01;
}

// Define particles
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 7;
    this.color = color(255, 0, 0, 20);
  }

  update(cursorPos) {
    let attractionForce = this.attract(cursorPos);
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
      // Mouse is within the bounds of the canvas
      // this.applyForce(attractionForce);
    }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  attract(cursorPos) {
    let total_force = 500;
    let force = p5.Vector.sub(cursorPos, this.pos);  // Get the vector pointing from the particle to the cursor
    let distanceSq = constrain(force.magSq(), 25, 625);  // Constrain the distance to eliminate "extreme" behavior at close distances
    let strength = total_force / distanceSq;  // Set the strength of the attraction force (you may need to adjust this value)
    force.setMag(strength);  // Set the magnitude of the force vector
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  randomWalk() {
    let randomForce = p5.Vector.random2D();
    randomForce.setMag(0.5);
    this.applyForce(randomForce);
  }

  applyConstantForce() {
    let constantForce = createVector(-1, 0);
    this.applyForce(constantForce);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    stroke(this.color);
    strokeWeight(20);
    point(this.pos.x, this.pos.y);
  }
}


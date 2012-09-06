//dave homan's entry into js13k game compo 2012

function init(){
 cvs = document.getElementById('canvas13k');
 ctx = cvs.getContext('2d');
 cvs.height = window.innerHeight;
 cvs.width = window.innerWidth;
 cvs.addEventListener('mousedown', onMouseDown, false);
 cvs.addEventListener('mousemove', onMouseMove, false);
 cvs.addEventListener('mouseup', onMouseUp, false);
 //cvs.addEventListener('mouseout', onMouseUp, false);
 cvs.addEventListener('touchstart', onMouseDown, false);
 cvs.addEventListener('touchmove', onMouseMove, false);
 cvs.addEventListener('touchend', onMouseUp, false);
 isMouseDown = false;
 mouseSensitivity = 100;
 currentMouseCoords = {x:0, y:0};
 sphereVelocity = {x: 0, y: 0}; //used for swiping events.
 sphereDecel = 10; //arbitrary units.
 r = cvs.height <= cvs.width ? cvs.height/2 : cvs.width/2 ;
 r -= 10; //shrink by 10.
 delta = {theta:0, phi:0};
 sphere_tau = 0; //declination angle of the sphere relative to camera
 starBoxSize = 0; //gets set in makestars();

 tm = {
  current: Date.now(),
  last: null,
  step: function(){
   this.last = this.current;
   this.current = Date.now();		
  },
  delta: function(){
   return this.current - this.last;
  }
 }
 sphere = makesphere();
 paddle = new Paddle('rgba(20,160,80,0.9)', 'rgba(20,160,80,0.4)', sphere[15][15]);
 stars = makestars();
 balls = [new Ball('red', 0,0,0, 0,0,-0.15)];

}

function shpereMain(){
	init();
	setInterval(loop, 33); //30 fps roughly
}

function loop(){
	clear();
	update();
	draw();
}

function clear(){
	ctx.clearRect(0,0,cvs.width,cvs.height);
	var w = cvs.width;
	cvs.width = 1;
	cvs.width = w;
}

function update(){
 tm.step();
 paddle.update();
 for (var i=0; i<stars.length; i++){
  stars[i].update();
 }
 
 for (var j=0; j<balls.length; j++){
  balls[j].update();
 }
 sortBalls();

 if (!isMouseDown){
  delta.theta += sphereVelocity.x;
  sphere_tau += sphereVelocity.y;
  
  if (sphere_tau > Math.PI*9/20){
    sphere_tau = Math.PI*9/20;
  }
  else if (sphere_tau < -Math.PI*9/20){
    sphere_tau = -Math.PI*9/20;
  }
  

  sphereVelocity.x = sphereVelocity.x * .95;
  sphereVelocity.y = sphereVelocity.y * .90;
  if (Math.abs(sphereVelocity.x) < 0.005 ){
    sphereVelocity.x = 0;
  }
  if (Math.abs(sphereVelocity.y) < 0.005 ){
    sphereVelocity.y = 0;
  }
 }

 for (var i=balls.length-1; i>=0; i--){
  //go through backwards and clean up pucks.
  if (balls[i].deleteMe == true){
    balls[i].delete;
    balls.splice(i,1);
  }
 }


 //delta.theta += tm.delta() * 0.0001;
 //delta.phi += tm.delta() * 0.0002;
 //delta.theta += tm.delta() * 0.001;
 //delta.phi += tm.delta() * -0.003;
}

function draw(){
 ctx.translate(cvs.width/2, cvs.height/2);
 for (var i=0; i<stars.length; i++){
  stars[i].draw();
 }
 if (!paddle.isInFront) { paddle.draw() ;}
 for (var j=0; j<balls.length; j++){
  balls[j].draw();
 }
 drawLongitudes();
 if (paddle.isInFront) { paddle.draw() ;}
 
}

function drawLongitudes(){
 var frontColor = 'rgba(255,255,255,0.8)';
 var rearColor = 'rgba(190,190,190,0.6)';
 ctx.lineWidth=2.5;
 for (var j=0; j<sphere.length; j++){
  ctx.beginPath();
  var pt0 = sphereToRect(r,sphere[j][0].theta + delta.theta, sphere[j][0].phi);
  pt0 = rotateAboutY(pt0.x, pt0.y, pt0.z, sphere_tau);
  ctx.moveTo(Math.round(pt0.x), Math.round(pt0.y));
  for (var i=1; i<sphere[j].length; i++){
   var pt = sphereToRect(r,sphere[j][i].theta + delta.theta, sphere[j][i].phi);
   pt = rotateAboutY(pt.x, pt.y, pt.z, sphere_tau);
   ctx.lineTo(Math.round(pt.x), Math.round(pt.y));
   if (i == 15){
    ctx.strokeStyle = pt.z > 0 ? frontColor : rearColor;
   }
  }
  //console.log('pt0.z = ' + pt2.z);
  ctx.stroke();
  //ctx.closePath();
 }
 //console.log('drawing longitudes');
}

function makesphere(){
 //makes a big list full of sphere coordinates in spherical coordinates
 var sphere = [];
 for (var t=0; t<30; t++){ //every 12 degrees
  sphere.push([]);
  for (var p=0; p < 30; p++){ //every 6 degrees
   sphere[t].push({theta: t * 12 / 360 * Math.PI * 2, phi: p * 6 / 360 * Math.PI *2}); 
  }
 }
 console.log(sphere);
 return sphere;
}

function makestars(){
 var starsArray = [];
 starBoxSize = cvs.width;
 for (var i=0; i<500; i++){
  starsArray.push(new Star('white', randomRange(-starBoxSize, starBoxSize), randomRange(-starBoxSize, starBoxSize), randomRange(-starBoxSize, starBoxSize)));
 }
 return starsArray;
}

function rectToSphere(x,y,z){
  var rho = Math.sqrt(x*x + y*y + z*z);
  var S = Math.sqrt(z*z + x*x);
  var theta = -z >= 0 ? Math.asin(x/S) : Math.PI - Math.asin(x/S);
  if (S==0){theta = 0};
  var phi = Math.acos(-y/rho);
  return {rho:rho, theta:theta, phi:phi};
}

function sphereToRect(rho, theta, phi){
  //for orthographic transform
 x = rho * Math.sin(phi) * Math.cos(theta);
 y = rho * Math.sin(phi) * Math.sin(theta);
 z = rho * Math.cos(phi)
 return {x:y, y:z, z:x};
}

function sphereToStereoRect(rho, theta, phi){
  //for stereoscopic transform
  //assuming z, the camera lens is at 3r pixels from the screen.
  //assuming the sphere's origin is -3r pixels from the screen.
  //basically just a parallax maker.
  var pt = sphereToRect(rho,theta,phi);
  return rectToStereoRect(pt.x, pt.y, pt.z);
}

function rectToStereoRect(x,y,z){
 //parallax maker where input is cartesian and not spherical
  var pt = {x:x, y:y, z:z};
  var pt1 = {x:0, y:0, z:0};
  pt1.x = pt.x * (3*r) / (pt.z + 3*r + 3*r);
  pt1.y = pt.y * (3*r) / (pt.z + 3*r + 3*r);
  pt1.z = pt.z;
  return pt1;
}

function rotateAboutY(x,y,z,phi){
 //takes a vector and rotates it about the y axis according to the canvas an
 //angle phi.
 //var xprime = x * Math.cos(phi) + z * Math.sin(phi);
 //var zprime = z * Math.cos(phi) - x * Math.sin(phi);
 var xprime = x;
 var yprime = y * Math.cos(phi) - z * Math.sin(phi);
 var zprime = y * Math.sin(phi) + z * Math.cos(phi);
 return {x:xprime, y:yprime, z:zprime};
}

function Star(color, x, y, z){
 this.pos = {x:x, y:y, z:z};
 this.vel = {x:0, y:0, z:-0.1};
 //this.pos = {rho:rho, theta:theta, phi:phi};
 this.color = color;
 this.radius = 1;
 this.update = function(){
  this.pos.x += this.vel.x * tm.delta();
  this.pos.y += this.vel.y * tm.delta();
  this.pos.z += this.vel.z * tm.delta();

  if (this.pos.z < -starBoxSize){
    this.pos.z = starBoxSize;
  }
 }
 this.draw = function(){
  ctx.beginPath();
  var pt = {x:0, y:0, z:0};
  pt = rectToStereoRect(this.pos.x, this.pos.y, this.pos.z);
  ctx.arc(pt.x, pt.y, this.radius, 0, 2*Math.PI, false);
  ctx.fillStyle = this.color;
  ctx.closePath();
  ctx.fill();
 }
}

function Ball(color, x,y,z, dx,dy,dz){
  this.trueRadius = 10;
  deleteMe = false; //flag to mark it for deletion at the end of update;
  this.color = color;
  this.pos = {x:x, y:y, z:z};
  this.vel = {x:dx, y:dy, z:dz};
  this.tolerance = 10;

  this.update = function(){
   var rho = Math.sqrt(this.pos.x*this.pos.x + this.pos.y*this.pos.y + this.pos.z*this.pos.z);
   if (rho > r + r/2){
    this.kill();
   }
   else if (rho < r + this.tolerance && rho > r - this.tolerance){
    //bounce
    var spherePos = rectToSphere(this.pos.x, this.pos.y, this.pos.z);
    if (spherePos.theta < (paddle.vertex.theta + delta.theta)%(Math.PI*2) + paddle.deg/2 &&
          spherePos.theta > (paddle.vertex.theta + delta.theta)%(Math.PI*2) - paddle.deg/2 &&
          spherePos.phi < paddle.vertex.phi + paddle.deg/2 + sphere_tau && 
          spherePos.phi > paddle.vertex.phi - paddle.deg/2 + sphere_tau){
      console.log("bouncing");
      var N = sphereToRect(r, paddle.vertex.theta + delta.theta, paddle.vertex.phi + sphere_tau);
      this.vel = reflect(N, this.vel);
    }
    
   }
   this.pos.x += this.vel.x * tm.delta();
   this.pos.y += this.vel.y * tm.delta();
   this.pos.z += this.vel.z * tm.delta();
  }
  this.draw = function(){
    //var pt = rectToStereoRect(this.pos.x, this.pos.y, this.pos.z);
    var pt = this.pos;
    var radius_temp = rectToStereoRect(this.trueRadius, this.trueRadius, pt.z);
    var radius = radius_temp.x;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, 2*Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.closePath();
    ctx.fill();
    this.drawRay(this);
    //console.log('ball drawing at ' + pt.x + ", " + pt.y);
  }
  this.kill = function(){
    this.deleteMe = true;
  }
  this.explode = function(){
    this.deleteMe = true;
  }
  this.checkCollision = function(){

  }
  this.drawRay = function(that){
    //var this = that;
    var startPoint = rectToSphere(this.pos.x, this.pos.y, this.pos.z);
    var endPoint = {rho:r, theta:startPoint.theta, phi: startPoint.phi};
    var pt0 = this.pos;
    var pt1 = sphereToRect(endPoint.rho, endPoint.theta, endPoint.phi);
    pt1.y = -pt1.y;
    ctx.beginPath();
    ctx.moveTo(pt0.x, pt0.y);
    ctx.lineTo(pt1.x, pt1.y);
    ctx.strokeStyle = 'white';
    ctx.stroke();
  }
}

function sortBalls(){
  //sorts them by Z via bubble sort, lowest z first;
  var switchCounter = 1;
  while (switchCounter){
   switchCounter = 0;
   for (var i=0; i<balls.length-1; i++){
    if (balls[i] > balls[i+1]){
      var temp = balls[i];
      balls[i] = balls[i+1];
      balls[i+1] = temp;
      switchCounter ++;
    }
   }
  }
}

function Paddle(frontColor, rearColor, vertex){
 //made of a sphere vertex, and extends 10 pixels in a square with
 //that vertex as its center
 this.vertex = vertex;
 this.frontColor = frontColor;
 this.rearColor = rearColor;
 this.deg = 0.5084;
 isInFront = true;

 this.update = function(){
  var ptv = sphereToRect(r, this.vertex.theta + delta.theta, this.vertex.phi);
  ptv = rotateAboutY(ptv.x, ptv.y, ptv.z, sphere_tau);
  this.isInFront = ptv.z > 0 ? true : false;
 }

 this.draw = function(){
  ctx.beginPath();
  var center = this.vertex;
  var ptv = sphereToRect(r, this.vertex.theta + delta.theta, this.vertex.phi);
  ptv = rotateAboutY(ptv.x, ptv.y, ptv.z, sphere_tau);


  var pt0 = sphereToRect(r, this.vertex.theta - this.deg/2 + delta.theta, this.vertex.phi - this.deg/2);
  pt0 = rotateAboutY(pt0.x, pt0.y, pt0.z, sphere_tau);
  var pt1 = sphereToRect(r, this.vertex.theta + this.deg/2 + delta.theta, this.vertex.phi - this.deg/2);
  pt1 = rotateAboutY(pt1.x, pt1.y, pt1.z, sphere_tau);
  var pt2 = sphereToRect(r, this.vertex.theta + this.deg/2 + delta.theta, this.vertex.phi + this.deg/2);
  pt2 = rotateAboutY(pt2.x, pt2.y, pt2.z, sphere_tau);
  var pt3 = sphereToRect(r, this.vertex.theta - this.deg/2 + delta.theta, this.vertex.phi + this.deg/2);
  pt3 = rotateAboutY(pt3.x, pt3.y, pt3.z, sphere_tau);

  ctx.moveTo(Math.round(pt0.x), Math.round(pt0.y));
  ctx.lineTo(Math.round(pt1.x), Math.round(pt1.y));
  ctx.lineTo(Math.round(pt2.x), Math.round(pt2.y));
  ctx.lineTo(Math.round(pt3.x), Math.round(pt3.y));

  //ctx.closePath();
  ctx.fillStyle = this.isInFront ? this.frontColor: this.rearColor;
  ctx.fill();
  //ctx.fillRect(pt0.x, pt0.y, 20, 20);
 }

}

function onMouseDown(ev){
 ev.preventDefault();
 isMouseDown = true;
 currentMouseCoords = getMouseCoords(ev);
 console.log("x, y = " + currentMouseCoords.x + ", " + currentMouseCoords.y);
}
function onMouseUp(ev){
 ev.preventDefault();
 isMouseDown = false;
 sphereVelocity.x = (currentMouseCoords.x - lastMouseCoords.x)/mouseSensitivity;
 sphereVelocity.y = -(currentMouseCoords.y - lastMouseCoords.y)/mouseSensitivity;
}
function onMouseMove(ev){
 ev.preventDefault();
 lastMouseCoords = currentMouseCoords;
 currentMouseCoords = getMouseCoords(ev);
 if (isMouseDown){
  delta.theta += (currentMouseCoords.x - lastMouseCoords.x)/mouseSensitivity;
  sphere_tau += -(currentMouseCoords.y - lastMouseCoords.y)/mouseSensitivity; 
  
  if (sphere_tau > Math.PI*9/20 ) {
    sphere_tau = Math.PI*9/20;
  }
  else if (sphere_tau < -Math.PI*9/20){
    sphere_tau = -Math.PI*9/20;
  }

 }
}
function getMouseCoords(ev) { //returns coords relative to 0,0 of the canvas
        var x = ev.x;
        var y = ev.y;
        if (ev.x || ev.x == 0){                     //chrome
            x = ev.x;
            y = ev.y;
            x -= cvs.offsetLeft;
            y -= cvs.offsetTop;
        }
        else if (ev.layerX || ev.layerX == 0){      //Firefox
            x = ev.layerX;
            y = ev.layerY;
        }
        else if (ev.offsetX || ev.offsetX == 0){    //Opera
            x = ev.offsetX;
            y = ev.offsetY;
        }
        else if (ev.pageX || ev.pageX == 0){        //Safari i think
            x = ev.pageX;
            y = ev.pageY;
            if (!ev.changedTouches){     //differentiates between a touch object, and a touchEvent object.  Safari treats them different for some reason.
                y -= cvs.offsetTop;   //adjusts for having a scrolled window
                x -= cvs.offsetLeft;
            }            
        }
        else{                                       //Anything Else
            x = 0;
            y = 0;
        }
        return {x:x, y:y};
}
function randomRange(a,b){
 return Math.random() * ((a<b)?(b-a):(a-b)) + ((a<b)?a:b);
}

function reflect(N, V0){
  //reflects a vector V0 about a normal vector N.
  //vectors should be in cartesian coordinates
  var normalFactor = Math.sqrt(N.x*N.x + N.y*N.y + N.z*N.z)
  var scalar =  -2 * (-N.x*V0.x/normalFactor + N.y*V0.y/normalFactor + N.z*V0.z/normalFactor)  ;
  var Vnew = {x:scalar*-N.x/normalFactor + V0.x, 
              y:scalar*N.y/normalFactor + V0.y, 
              z:scalar*N.z/normalFactor + V0.z};
  console.log(scalar);
  console.log(N);
  console.log(V0);
  console.log(Vnew);
  return Vnew;
}






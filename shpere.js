//dave homan's entry into js13k game compo 2012

function init(){
 cvs = document.getElementById('canvas13k');
 ctx = cvs.getContext('2d');
 cvs.addEventListener('mousedown', onMouseDown, false);
 cvs.addEventListener('mousemove', onMouseMove, false);
 cvs.addEventListener('mouseup', onMouseUp, false);
 cvs.addEventListener('mouseout', onMouseUp, false);
 isMouseDown = false;
 mouseSensitivity = 100;
 currentMouseCoords = {x:0, y:0};
 r = 200;
 delta = {theta:0, phi:0};
 sphere_tau = 0; //declination angle of the sphere relative to camera

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
 paddle = new Paddle('rgb(20,160,80)', 'rgba(20,160,80,0.4)', sphere[15][15]);


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
 //delta.theta += tm.delta() * 0.0001;
 //delta.phi += tm.delta() * 0.0002;
 //delta.theta += tm.delta() * 0.001;
 //delta.phi += tm.delta() * -0.003;
}

function draw(){
 ctx.translate(cvs.width/2, cvs.height/2);
 drawLongitudes();
 paddle.draw();

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

function sphereToRect(rho, theta, phi){
 x = rho * Math.sin(phi) * Math.cos(theta);
 y = rho * Math.sin(phi) * Math.sin(theta);
 z = rho * Math.cos(phi)
 return {x:y, y:z, z:x};
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

function Paddle(frontColor, rearColor, vertex){
 //made of a sphere vertex, and extends 10 pixels in a square with
 //that vertex as its center
 this.vertex = vertex;
 this.frontColor = frontColor;
 this.rearColor = rearColor;
 this.deg = 0.5084;


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
  ctx.fillStyle = ptv.z > 0 ? this.frontColor: this.rearColor;
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

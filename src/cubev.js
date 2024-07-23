"use strict";

var canvas;
var gl;

var sizeScale = 1;
var objects = []
var mainObject = null;
var mainObjectIndex = 1;


class Object{
	constructor(vertex,vertexColors,indices){
		this.vertices = [];
		this.colors = [];
		this.theta = [1,1,1];
		for(var i=0;i<vertex.length;i++){
			this.vertices.push([0,0,0]);
			for(var j=0;j<3;j++)
				this.vertices[i][j] = vertex[i][j];
		}		
		
		for(i=0;i<vertexColors.length;i++)
			this.colors.push(vec4(...vertexColors[i]));
		
		this.indices = indices;
	}
	
	setTheta = function(theta){this.theta = [...theta]};
	setThetaLoc = function(thetaLoc){this.thetaLoc = thetaLoc};
	setVertices = function(vertices){ this.vertices = vertices; }
	changeTheta = function(index,new_value){this.theta[index] = new_value%360};
	getTheta = function(){ return this.theta; }
	getThetaLoc = function(){ return this.thetaLoc; }
	getVertices = function(){ return this.vertices; }
	getColors = function(){ return this.colors; }
	getIndices = function(){ return this.indices; }
		
	
	
}



const directions = {
	"RIGHT"	: [ 0,1],
	"LEFT"	: [0,-1],
	"UP"	: [ 1,1],
	"DOWN" 	: [1,-1],
//	"FRONT" : [2,1]

}
var program;
function buffer(obj){
	
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(obj.getIndices()), gl.STATIC_DRAW);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.getColors()), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.getVertices()), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	if(obj.getThetaLoc()==null)
		obj.setThetaLoc(gl.getUniformLocation(program, "theta"));
	
}
window.onload = function init()
{
	
	
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);;
	console.log("number of obj in scene: ",initObjects.length);
	
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    for(var i=0;i<initObjects.length;i++){
		objects.push(new Object(initObjects[i].vertices,initObjects[i].colors,initObjects[i].indices));	
		buffer(objects[i]);
	}

	mainObject = objects[mainObjectIndex];
		
	render();
}

var idle_rotation_vel = 1.0;

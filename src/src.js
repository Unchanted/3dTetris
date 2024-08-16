"use strict";

// webgl
let canvas, gl, program, vColor, vPosition;

// Game State Variables
let objects = [];
let cameraTheta = [-12, 26, 0, 1.0];
let cameraCoord = [0.2, 0];
let cameraCoordLoc, camera_theta_loc;
const cameraSpeed = 4;

const Y_LIMIT = initialAssetCoord[1] - edge_length;
const gravity_speed_init = 0.0005 * prompt("Enter difficulty scale", 2);
let gravity_speed = gravity_speed_init;

const DISPLAY_WALLS = false;
const OBJECT_DEPTH = false;
const SPACE_SPEED = Math.max(0.02, gravity_speed_init * 2);

const move_scale = edge_length;
const epsilon = -0.05;
let ended = false;
let prevTime = 0;
let TimeStopTicket = false;
let prevVertices = null;

// Enums
const directions = {
    RIGHT: [0, 1],
    LEFT: [0, -1],
    UP: [1, 1],
    DOWN: [1, -1],
    FRONT: [2, 1],
    BEHIND: [2, -1],
};

// Sounds
let moveSound, stackSound, stackCompleteSound, rotateSound, fallSound;

// Game Objects
class Object {
    constructor(obj) {
        this.vertices = obj.vertices.map(vertex => [...vertex]);
        this.colors = obj.colors.map(color => vec4(...color));
        this.indices = obj.indices;
        this.type = obj.type;
    }
}

// assign sound files
function initSounds() {
    const soundFolder = "src/soundeffects/";
    moveSound = new Audio(soundFolder + 'move.mp3');
    stackSound = new Audio(soundFolder + "stack.mp3");
    stackCompleteSound = new Audio(soundFolder + "stackComplete.mp3");
    rotateSound = new Audio(soundFolder + "rotate.mp3");
    fallSound = new Audio(soundFolder + "fall.wav");
}

//Check if 2 objects collusions
function lineClsn(line1, line2, distance = epsilon) {
    return line1[0] < line2[1] + distance && line1[1] + distance > line2[0];
}

function isColliding(obj1, obj2) {
    const [X, Y, Z] = getMinMax(obj1);
    const [x, y, z] = getMinMax(obj2);
    return lineClsn(X, x) && lineClsn(Y, y, 0) && lineClsn(Z, z);
}


//Check if game ended
function isgameEnded() {
    return objects.slice(1 + walls.length, objects.length - 1)
        .some(obj => obj.vertices.some(vertex => vertex[1] > Y_LIMIT));
}

function EndGame() {
    const element = document.getElementById("score");
    element.innerHTML = "Game Over<br>Final " + element.innerHTML;
    canvas.style = "border-color: var(--background); box-shadow: 0 0 5vw black;";
}

function gamePaused() {
    document.getElementsByTagName("body")[0].style = "filter:blur(2px);";
}

// collision detection for main object
function boxClsn(mainObj) {
    if (mainObj.type === "asset") {
        const cubes = disassemble(mainObj);
        for (let cube of cubes) {
            const [collidingObjectIndex, distance] = boxClsn(cube);
            if (collidingObjectIndex) return [collidingObjectIndex, distance];
        }
    } else {
        const [X, Y, Z] = getMinMax(mainObj);
        for (let i = 0; i < objects.length - 1; i++) {
            const [x, y, z] = getMinMax(objects[i]);
            if (lineClsn(X, x) && lineClsn(Y, y, 0) && lineClsn(Z, z))
                return [i + 1, y[1] - Y[0]];
        }
    }
    return [0, -1];
}

//rotate object
function rotateS(object, dir_enum) {
    const vertices = object.vertices;
    const temp = copy(vertices);
    const isVertical = dir_enum[0];
    const direction = dir_enum[1];

    const pivot = vertices[0];
    const referans = vertices[6];
    const difBefore = pivot.map((coord, i) => coord - referans[i]);

    vertices.slice(1).forEach((vertex, i) => {
        const difZ = vertex[2] - pivot[2];
        if (isVertical) {
            const difY = vertex[1] - pivot[1];
            vertex[1] -= direction * (difY + difZ);
            vertex[2] += direction * (difY - difZ);
        } else {
            const difX = vertex[0] - pivot[0];
            vertex[0] += direction * (difZ + difX);
            vertex[2] += direction * (difZ - difX);
        }
    });

    const difAfter = pivot.map((coord, i) => coord - referans[i]);
    const extra = difBefore.map((before, i) => (before - difAfter[i]) / 2);
    vertices.forEach(vertex => vertex.forEach((coord, i) => coord -= extra[i]));

    if (boxClsn(object)[0]) object.vertices = temp;
}

// score
function changeScore(delta) {
    const element = document.getElementById("score");
    const currentScore = parseInt(element.innerText.split(" ")[1]);
    element.innerText = "Score: " + (currentScore + delta);
}

// Detect and delete filled plane
function detectAndDestroy() {
    const objectIndexesAtRow = [];

    for (let i = ground + edge_length / 2; i < 1; i += edge_length) {
        const verticesOnY = objects.slice(1 + walls.length).reduce((acc, obj, j) => {
            const y_nx = getMinMax(obj)[1];
            if (obj.vertices.some(vertex => y_nx[0] <= i && i <= y_nx[1])) {
                acc.push(j);
            }
            return acc;
        }, []);

        if (verticesOnY.length >= w_count * h_count) {
            objects.slice(1 + walls.length).forEach((obj, j) => {
                if (!objectIndexesAtRow.includes(j) && !verticesOnY.includes(j)) {
                    move(obj, edge_length, directions.DOWN, true);
                }
            });

            verticesOnY.reverse().forEach(index => objects.splice(index, 1));

            stackCompleteSound.play();
            changeScore(w_count * h_count * 10);
        } else {
            objectIndexesAtRow.push(...verticesOnY);
        }
    }
}

//A Random function
function randomFromArr(arr){
	var milliseconds = new Date().getMilliseconds();
	let rndm = Math.random()+1;
	let index = Math.floor(rndm *milliseconds) % arr.length;
	return arr[index];
}

//Create new object randomly
function createNewAsset(depth_y=OBJECT_DEPTH,connected_components=true){
	
	let blueprint = []; //initial blueprint
	let depth_seeds = [1,1,1,2,2,3]; //seeds for depth
	let hw_seeds = [2,2,2,2,3];
	
	//Elements of random structure
	let h = randomFromArr([1]);
	if(depth_y)
		h = randomFromArr(depth_seeds)%2+1;
	if(connected_components)
		depth_seeds = depth_seeds.filter(item => (item!=0));
	let w;
	
	//Create Random Structure
	for(let i=0;i<h;i++){
		let arr = [Math.random()*2+1];
		w = randomFromArr(hw_seeds)
		for(let j=0;j<w-1;j++)
			arr.push(randomFromArr(depth_seeds));
		blueprint.push(arr);
	}
	//Random Colors
	let colors = [] 
	for(let i=0;i<4;i++)
		colors.push([Math.random(),Math.random(),Math.random(),1.0]);
	let obj = combineCubes(blueprint,edge_length,colors,...initialAssetCoord);		
						
	addToScene(obj);
	return obj;
}

//Add new object to scene
function addToScene(newObject){
	objects.push(new Object(newObject));	
	buffer(objects[objects.length-1]);
}

//Set Buffer
function setBuffer(array){
	gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(array), gl.STATIC_DRAW );
}

//Set Attrib
function setAttrib(variable,length){
	gl.vertexAttribPointer( variable, length, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( variable );
}
	
//Render Object
function buffer(obj,draw=gl.TRIANGLES){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(obj.indices), gl.STATIC_DRAW);

	setBuffer(obj.vertices);
	setAttrib(vPosition,3);
	
	setBuffer(obj.colors);
	setAttrib(vColor,4);
	
	gl.drawElements(draw, obj.indices.length, gl.UNSIGNED_BYTE, 0);
	
}

//Initialize Scene
window.onload = function init(){
	
	//Initialize sound variables
	initSounds();
	
	//Initialize webGL
    canvas = document.getElementById( "gl-canvas" );
	
	leftBorderWidth = parseFloat(window.getComputedStyle(canvas).borderLeftWidth.slice(0,2));
	topBorderWidth = parseFloat(window.getComputedStyle(canvas).borderTopWidth.slice(0,2));
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.1,	0.04,	0.17,   1.0 );
	gl.enable(gl.DEPTH_TEST)
	if(DISPLAY_WALLS==true){
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
	}
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	//Initialize attribute variables
	vPosition = gl.getAttribLocation( program, "vPosition" );
	vColor = gl.getAttribLocation( program, "vColor" );
	
	//Initialize uniform variables
	camera_theta_loc = gl.getUniformLocation(program, "camera");
	gl.uniform4fv(camera_theta_loc, cameraTheta);
	cameraCoordLoc = gl.getUniformLocation(program, "cameraCoord");
    gl.uniform2fv(cameraCoordLoc, cameraCoord);
	
	
	//Add first objects to scene
    for(var i=0;i<initObjects.length;i++)
		addToScene(initObjects[i]);
	
	createNewAsset();
	//set current time and start render loop
	prevTime = Date.now();
	render();
}

//Render All Objects by buffering
function renderAllObjects(){
	for(var i=0;i<objects.length;i++){
		if(DISPLAY_WALLS==false && walls.includes(i))
			continue
		else
			buffer(objects[i]);
	}
	
}

//Fix collision after grounding
function fixCollision(distance){
	move(objects[objects.length-1],distance,directions.UP,true);
}

//Fix color bug of mouse event
function fixColor(){
	//Fix color when object selected by mouse
	if(prevColors!=null){
		objects[objects.length-1].colors = prevColors;
		prevColors=null;
	}
	objectSelected = false; //Break the object hold
	
}
//MAIN: Render Loop
function render(once=false){
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if(document.hasFocus()){
		
		let deltaTime = (Date.now() - prevTime)/10; //divide by 10 for normalization
		
		if(TimeStopTicket){
			deltaTime = 0;
			TimeStopTicket = false;
			document.getElementsByTagName("body")[0].style="";
		}
		if(ended==false){
			let [CollidedObjectIndex,distance] = boxClsn(objects[objects.length-1]);
			CollidedObjectIndex -=1;
			if(CollidedObjectIndex==-1)
				prevVertices = move(objects[objects.length-1],gravity_speed*deltaTime,directions.DOWN);
			else{
				stackSound.play();
				/*
				Dissassemble asset to cubes for preventing collision detection 
				on 2 asset which is possible on future
				*/
				
				fixCollision(distance);
				fixColor();
				
				//Dissassemble the fallen object
				let newCubesToAdd = disassemble(objects.pop());
				console.log(newCubesToAdd);
				for(var i=0;i<newCubesToAdd.length;i++)
					addToScene(newCubesToAdd[i]);
				changeScore(newCubesToAdd.length*10);
				
				//We execute this function only there for optimization
				//Detect planes starting from bottom to top and destroy objects within full plane
				detectAndDestroy();
				
				//Check If Game Ended
				ended = isgameEnded();
				if(ended)
					EndGame();
				else{
					
					//Get new asset's color and change border color of canvas
					let colors = createNewAsset().colors[0];
					let colorStr = "rgb("+colors[0]*255+","+colors[1]*255+","+colors[2]*255+")";
					canvas.style="border-color: "+colorStr+";";
					document.getElementById("score").style="border-color: "+colorStr+"; color: "+colorStr+";";
					
				}
			}

		}
		
		//Render Object and Continue to loop
		renderAllObjects()
		
		
	}
	else{
		gamePaused();
		TimeStopTicket = true;
	}
	
	prevTime = Date.now();
	if(once==true)
		return
	requestAnimFrame( render );
}

//Fix movement for camera perspective
function directionFix(dir_enum){
	//[-135,-45], [225,315] arasında, front -> left, right->front ,left-> behind, behind->right, 
	//[45,135], [-315,-225] arasında front -> right, right ->behind, left->front, behind-> left
	//[-45,45],[-405,-315], [315,360]arasında normal 
	//[-135,-225], [135,225] arasında front->behind, right->left, left->right, behind->front
	let degr = cameraTheta[1];
	let order = [directions.FRONT,directions.LEFT,directions.BEHIND,directions.RIGHT];
	function interval(dest1,dest2){
		return degr>=dest1 && degr<=dest2; 
	}
	let d = 360;
	
	//Normal Direction
	if(interval(-405,-315) || interval(-45,45) )
		return dir_enum;
	
	if(interval(-135,-45) || interval(225,315))
		return order[(order.findIndex((x)=>{return x==dir_enum})+1)%4];
	
	else if(interval(-315,-225) || interval(45,135) )
		return order[(order.findIndex((x)=>{return x==dir_enum})+3)%4];
	
	else
		return order[(order.findIndex((x)=>{return x==dir_enum})+2)%4];
		
	
	
}

//Rotate Camera
function rotateCamera(dir_enum,scale=1){
	let index = 1 - dir_enum[0];
	let direction = (2*index-1)*dir_enum[1]; // 0 ise negatif, 1 ise pozitifi 
	cameraTheta[index]=(cameraTheta[index]+direction*scale*cameraSpeed)%360;
	gl.uniform4fv(camera_theta_loc, cameraTheta);
}

//Move Object
function move(object,move_scale,dir_enum,ignore_collisions=false){
	
	//Get index and direction from enum.
	let index = dir_enum[0];
	let direction = dir_enum[1];
	
	let prev = copy(object.vertices);
	//Get all vertices and add to its given coordinates
	let vertices = object.vertices;
	for(let i=0;i<vertices.length;i++)
			vertices[i][index]+=direction*move_scale;
		
	//revert move on collision
	if(ignore_collisions==false && dir_enum!=directions.DOWN &&  boxClsn(object)[0]>=1)
		object.vertices = prev;
	return prev;
}

var down = false;
var dragBegin;
var objectSelected = true;
var leftBorderWidth;
var topBorderWidth;

function getMousePos(event, normalize = true) {
    let rect = canvas.getBoundingClientRect();

    if (!normalize) {
        return {
            x: event.clientX - rect.left - leftBorderWidth,
            y: rect.bottom - event.clientY - topBorderWidth
        };
    }

    return {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5
    };
}

var prevColors = null;

function isObjectSelected(event, checkWhenMouseMove = false) {
    let pixels = new Uint8Array(4);
    let mousePos = getMousePos(event, false);
    let mainObj = objects[objects.length - 1];

    if (!checkWhenMouseMove) {
        prevColors = copy(mainObj.colors);
        mainObj.colors.fill([255, 255, 255, 0]);
    }

    buffer(mainObj);
    gl.readPixels(mousePos.x, mousePos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    if (!checkWhenMouseMove && pixels.reduce((a, b) => a + b, 0) === 0 || pixels[3] !== 0) {
        mainObj.colors = prevColors;
        prevColors = null;
    }

    return pixels[0] !== 0 && pixels[3] === 0;
}

function EnableAlpha(element) {
    if (element.checked) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        DISPLAY_WALLS = true;
    } else {
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        DISPLAY_WALLS = false;
    }
}

function objectDepth(element) {
    OBJECT_DEPTH = element.checked;
}

window.onmousedown = function(event) {
    dragBegin = {
        x: event.clientX,
        y: event.clientY
    };
    down = true;
    if (event.button !== 4) {
        objectSelected = isObjectSelected(event);
    }
}

window.onmouseup = function() {
    down = false;
    if (objectSelected && prevColors != null) {
        objects[objects.length - 1].colors = prevColors;
        prevColors = null;
    }
    objectSelected = false;
}

window.onmousemove = function(event) {
    if (!down) return;

    let x_change = (event.clientX - dragBegin.x) / 25;
    let y_change = (event.clientY - dragBegin.y) / 25;

    if (event.buttons === 4) {
        cameraCoord[0] += -x_change / 10;
        cameraCoord[1] += y_change / 10;
        gl.uniform2fv(cameraCoordLoc, cameraCoord);
    } else if (objectSelected) {
        let isXChangeEnough = Math.abs(x_change) >= move_scale;
        let isYChangeEnough = Math.abs(y_change) >= move_scale;

        if ((isXChangeEnough || isYChangeEnough) && !isObjectSelected(event, true)) {
            if (isXChangeEnough) {
                let directionX = x_change > 0 ? directions.RIGHT : directions.LEFT;
                moveSound.play();
                move(objects[objects.length - 1], move_scale, directionFix(directionX));
            }
            if (isYChangeEnough) {
                let directionZ = y_change > 0 ? directions.FRONT : directions.BEHIND;
                moveSound.play();
                move(objects[objects.length - 1], move_scale, directionFix(directionZ));
            }
        }
    } else {
        rotateCamera(directions.LEFT, x_change);
        rotateCamera(directions.UP, y_change);
    }

    dragBegin.x = event.clientX;
    dragBegin.y = event.clientY;
}

//Mouse Wheel rotated
window.addEventListener('wheel', ({ deltaY }) => {

	//ZOOM
	
	let mousePos = getMousePos(event);
	cameraTheta[3] += deltaY/3000;
	
	//IF zoomed out then get camera coordinates to normal
	if(deltaY>0)
		cameraCoord = [0.2,0];
	
	//Zoom In
	else{
		cameraCoord[0] += -mousePos.x;
		cameraCoord[1] += mousePos.y;
	}

	//Update variables
	gl.uniform2fv(cameraCoordLoc, cameraCoord);
	gl.uniform4fv(camera_theta_loc, cameraTheta);
});

//Key pressed
window.onkeydown = function(event) {
	if(ended) return;
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		
		//Camera Rotation
		case '&': 
			rotateCamera(directions.UP);
			break;
		case '%':  
			rotateCamera(directions.LEFT);
			break;
		case '(': 
			rotateCamera(directions.DOWN);
			break;
		case '\'': 
			rotateCamera(directions.RIGHT);
			break;
			
		//Object Rotation
		case 'q':
			rotateSound.play();
			rotateS(objects[objects.length-1],directions.UP);
			break;
		case 'e':
			rotateSound.play();
			rotateS(objects[objects.length-1],directions.LEFT);
			break;
			
		//Object Movement
		case 'w':
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.BEHIND));
			break;
		case 'a':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.LEFT));
			break;
		case 's':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.FRONT));
			break;
		case 'd':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.RIGHT));
			break;
			
		case ' ':
			if(gravity_speed!=SPACE_SPEED)
				fallSound.play();
			gravity_speed = SPACE_SPEED;
			break;
			
	}
}

window.onkeyup = function(){
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		case ' ':
			gravity_speed = gravity_speed_init;
			break;
	}
}

function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }


    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init() 
{
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);    
}
init();

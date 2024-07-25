var edge_length = 0.1;

let bitMap = [1, 1]
initObjects = [
	createRect(-0.6,-0.7,-0.6,
				1.2,0.05,1.2,
				[[0.0, 0.0, 0.4, 1.0], [1.0, 0.0, 1.0, 1.0]]),
				
     createCube(
			   0,0,0,
			   edge_length,
			   [
					[0.0, 0.0, 0.0, 1.0],
					[0.2, 0.2, 0.2, 1.0]	
			   ]
			 ),

			combineCubes([[1,1]],edge_length,[[0.8, 0.8, 0.8, 1],[0, 0.8, 0.8, 1],[0.8, 0, 0.8, 1]],0,0.5,0)		
]
	
function quad(objOriginal){
	let obj = objOriginal;
	for(var j=0;j<obj.indices.length;j++){
		let index = obj.indices[j];
		obj.indices[j] = [index[0],index[1],index[2],index[0],index[2],index[3]]
	}
	obj.indices = [].concat.apply([], obj.indices);
	return obj;
}

function getMinMax(rectangle){
	let vertex = Array.isArray(rectangle) ? rectangle: rectangle.getVertices();
	
	return [
			[vertex[0][0],vertex[6][0]], //minX, maxX
			[vertex[6][1],vertex[0][1]], //minY, maxY
			[vertex[0][2],vertex[6][2]]  //minZ, maxZ
		   ]
	
}

function getBottom(vertices){
	let min = 1; //
	for(var i=0;i<vertices.length;i++)
			if(vertices[i][1] < min)
				min = vertices[i][1];
	return min;
}



function createRect(x,y,z,a,b,c,colors){
	let rect = 	{
  "vertices": [
        [x, y, z], 
        [x, y, z+c],  
        [x+a, y, z+c],   
        [x+a, y, z],  
		[x, y-b, z],
        [x, y-b, z+c], 
        [x+a, y-b, z+c],  
        [x+a, y-b, z]  
    ],
  "colors": [],
  "indices": [ 
  [0,1,2,3], 
	[4,5,6,7], 
	[0,1,5,4], 
	[3,7,6,2], 
	[0,3,7,4], 
	[1,5,6,2]  
	
  ],
  "type":"rect"
  }
  for(var i=0;i<rect.vertices.length;i++)
	  rect.colors.push(colors[i%colors.length]);
  
  return rect;
	
}
function createCube(x,y,z,a,colors){
	return createRect(x,y,z,a,a,a,colors);

}

function createAndMap(x,y,z,a,colorArr,cubes){
	let newCube = createCube(x,y,z,a,colorArr);
	
	for(var i=0;i<newCube.indices.length;i++)
		for(var j=0;j<newCube.indices[i].length;j++)
			newCube.indices[i][j]+=8*cubes.length;
	return newCube;
}

function copy(object){
	
	return JSON.parse(JSON.stringify(object));
	
}
function combineCubes(blueprint,a, colorArr,initialX = 0, initialY=0, initialZ=0){
	var cubes = new Array();
	for(var i=0;i<blueprint.length;i++){
		if(Array.isArray(blueprint[i])){
			for(var j=0;j<blueprint[i].length;j++)
					if(Array.isArray(blueprint[i][j])){
						for(var k=0;k<blueprint[i][j].length;k++){
							if(blueprint[i][j][k]==1)
								cubes.push(createAndMap(initialX+a*k,initialY-a*j,initialZ-a*i,a,colorArr,cubes)); 
					}
					}
					else if(blueprint[i][j]==1)
						cubes.push(createAndMap(initialX+a*j,initialY-a*i,initialZ,a,colorArr,cubes));
		}
		else if(blueprint[i]==1)
			cubes.push(createAndMap(initialX+a*i,initialY,initialZ,a,colorArr,cubes));
		
	}
	let combinedObject = copy(cubes[0]);
	combinedObject.vertices = combinedObject.vertices;
	combinedObject.colors = combinedObject.colors;
	combinedObject.type="asset";
	for(var i=1;i<cubes.length;i++){
		console.log(cubes[i].vertices.length);
		for(var j=0;j<cubes[i].vertices.length;j++){
			combinedObject.vertices.push(cubes[i].vertices[j]);
			
			combinedObject.colors.push(cubes[i].colors[j]);
		}
		
		combinedObject.indices.push(...(cubes[i].indices));
	}
	return combinedObject;
	
}

function parseAsset(asset){
	//8 color, 6 indis, 8 vertices
	let cubes = []
	
	let assetVertices = asset.getVertices();
	for(var j=0;j<assetVertices.length/8;j++){
		let obj = {};
		let begin = j*8;
		let edge_length = Math.abs(assetVertices[1][2]- assetVertices[0][2]);
		cubes.push(createCube(...assetVertices[begin],edge_length,asset.getColors().slice(begin,begin+8)));
	
	}
	return cubes;
	
}

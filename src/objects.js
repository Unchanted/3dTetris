var edge_length = 0.1;
initObjects = [
  /*{
  "vertices": [
        [-0.1, -0.1, -0.1],
        [0.1, -0.1, -0.1],
        [0.0, -0.1,  0.1],
        [0.0,  0.1,  0.1]
    ],
  "colors": [
        [0.0, 0.0, 0.0, 1.0] ,  
        [1.0, 0.0, 0.0, 1.0] ,  
        [1.0, 1.0, 0.0, 1.0] ,  
        [0.0, 1.0, 1.0, 1.0]    
    ],
  "indices": [ 
    1, 0, 3,
    0, 2, 1,
	1, 2, 3,
  	0, 2, 3
  ]
  
  }, //OBJE*/
 
  
   {
  "vertices": [
        [-0.6, -0.9, -0.6],
        [-0.6, -0.9, 0.6],
        [0.6, -0.9, 0.6],
        [0.6, -0.9, -0.6],
		[-0.6, -0.95, -0.6],
        [-0.6, -0.95, 0.6],
        [0.6, -0.95, 0.6],
        [0.6, -0.95, -0.6]
    ],
  "colors": [
        [0.0, 0.0, 0.4, 1.0] ,  
        [0.0, 0.0, 0.4, 1.0] ,  
        [0.0, 0.0, 0.4, 1.0] ,  
        [0.0, 0.0, 0.4, 1.0] ,
		[1.0, 0.0, 1.0, 1.0] ,  
        [1.0, 0.0, 1.0, 1.0] ,  
        [1.0, 0.0, 1.0, 1.0] ,  
        [1.0, 0.0, 1.0, 1.0]   		
    ],
  "indices": [ 
    0,1,2, 0,2,3, 
	4,5,6, 4,6,7,
	0,1,5, 0,5,4,
	3,7,6, 3,6,2,
	0,3,7, 0,7,4,
	1,5,6, 1,6,2 
	
  ]
  
  },   
  {
  "vertices": [
        [0,0,0],
        [0,0,1], 
        [1,0,1],
        [1,0,0],
		[0,1,0],
		[0,1,1],
		[1,1,1],
		[1,1,0]
    ],
  "colors": [
        [0.0, 0.0, 0.0, 1.0] ,  
        [1.0, 0.0, 0.0, 1.0] ,  
        [1.0, 1.0, 0.0, 1.0] ,  
        [0.0, 1.0, 1.0, 1.0] ,
		[0.0, 0.0, 0.0, 1.0] ,  
        [1.0, 0.0, 0.0, 1.0] ,  
        [1.0, 1.0, 0.0, 1.0] ,  
        [0.0, 1.0, 1.0, 1.0] 		
    ],
  "indices": [ 
    0,1,2,0,2,3,
	0,4,5,0,5,1,
	4,5,6,4,6,7,
	3,2,6,3,6,7,
	1,5,2,1,6,2,
	0,4,7,0,7,3
  ]
  
  }, 
]
for(var i=0;i<6;i++)
	for(var j=0;j<3;j++)
		initObjects[1].vertices[i][j] *= edge_length;
	
	
function getLowerMostPixels(object){
	let min = 1;
	let lowerMosts = []
	let xz_yMap = {{}};
	for(var i=0;i<object.vertices.length;i++){
		let valueInMap = xz_yMap[object.vertices[i][0]][object.vertices[i][2]];
		let valueCurrent = object.vertices[i][1];
		if(valueInMap== null || valueInMap > valueCurrent)
			xz_yMap[object.vertices[i][0]][object.vertices[i][2]] = valueCurrent;
	}
	
	for(var xKey in xz_yMap)
		for(var zKey in xz_yMap[iKey])
			lowerMosts.push([xKey,xz_yMap[xKey][zKey],zKey);
		
	return lowerMosts;
	
}

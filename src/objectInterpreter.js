function copy(object) {
    return JSON.parse(JSON.stringify(object));
}

// Create rectangle
function createRect(x, y, z, a, b, c, colors) {
    const vertices = [
        [x, y, z], [x, y, z + c], [x + a, y, z + c], [x + a, y, z],
        [x, y - b, z], [x, y - b, z + c], [x + a, y - b, z + c], [x + a, y - b, z]
    ];

    const indices = quad([
        [0, 1, 2, 3], [4, 5, 6, 7], 
        [0, 1, 5, 4], [3, 7, 6, 2], 
        [0, 3, 7, 4], [1, 5, 6, 2]
    ]);

    return {
        vertices: vertices,
        colors: vertices.map((_, i) => colors[(i * 4) % colors.length]),
        indices: indices,
        type: "rect"
    };
}

// Create cube
function createCube(x, y, z, a, colors) {
    return createRect(x, y, z, a, a, a, colors);
}

function createAndMap(x, y, z, a, colorArr, cubes) {
    const newCube = createCube(x, y, z, a, colorArr);
    newCube.indices = newCube.indices.map(index => index + 8 * cubes.length);
    return newCube;
}

function combineCubes(blueprint, a, colorArr, initialX = 0, initialY = 0, initialZ = 0) {
    const cubes = [];

    blueprint.forEach((row, i) => {
        if (Array.isArray(row)) {
            row.forEach((count, j) => {
                for (let k = 1; k <= count; k++) {
                    cubes.push(createAndMap(initialX + a * j, initialY - a * i, initialZ - a * (k - 1), a, colorArr, cubes));
                }
            });
        } else {
            for (let k = 1; k <= row; k++) {
                cubes.push(createAndMap(initialX + a * i, initialY, initialZ - a * (k - 1), a, colorArr, cubes));
            }
        }
    });

    const combinedObject = copy(cubes[0]);
    cubes.slice(1).forEach(cube => {
        combinedObject.vertices.push(...cube.vertices);
        combinedObject.colors.push(...cube.colors);
        combinedObject.indices.push(...cube.indices);
    });

    combinedObject.type = "asset";
    return combinedObject;
}


function disassemble(asset) {
    const cubes = [];
    const cubeCount = asset.vertices.length / 8;

    for (let j = 0; j < cubeCount; j++) {
        const start = j * 8;
        const vertices = asset.vertices.slice(start, start + 8);
        const colors = asset.colors.slice(start, start + 8);

        cubes.push({
            vertices: vertices,
            indices: quad([
                [0, 1, 2, 3], [4, 5, 6, 7], 
                [0, 1, 5, 4], [3, 7, 6, 2], 
                [0, 3, 7, 4], [1, 5, 6, 2]
            ]),
            colors: colors,
            type: "rect"
        });
    }

    return cubes;
		       }

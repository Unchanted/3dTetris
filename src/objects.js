// Get Input From User
function getInput(text, default_val = 4, min_val = 1) {
    let value;
    do {
        value = prompt(text, default_val);
        if (value === null) return;

        if (isNaN(value) || value < min_val) {
            alert("Enter a valid number");
        }
    } while (isNaN(value) || value < min_val);

    return parseInt(value, 10);
}

var edge_length = 0.1; // edge length of cubes
var w_count = getInput("Enter width of board", 6, 4);
var h_count = getInput("Enter height of board", 6, 4);
var w = edge_length * w_count;
var h = 0.05;
var d = edge_length * h_count;
var ground = -0.5;
var hill = 0.7;
var l = 0.01;
var initialAssetCoord = [-0.2, hill, 0.2];
var wallLength = 1.3;
var wallPivot = 0.8;
var wallThickness = 0.051;
var wallColor = [0.3, 0.3, 0.8, 0.3];
var groundColor = [0.7, 0.7, 0.7, 1.0];

// First objects
var initObjects = [
    createRect(-0.4, ground, 0, w, 1.5 * h, d, [groundColor]),
    createRect(-0.451, wallPivot, 0, wallThickness, wallLength, d, [wallColor]),
    createRect(-0.4, wallPivot, -edge_length / 2 - 0.01, w, wallLength, wallThickness, [wallColor]),
    createRect(-0.4, wallPivot, d, w, wallLength, wallThickness, [wallColor]),
    createRect(-0.4 + w, wallPivot, 0, wallThickness, wallLength, d, [wallColor])
];

// Make invisible objects such as walls
var walls = [1, 2, 3, 4];

// Get 4 indices and generate 6 indices for cube
function quad(indicesOriginal) {
    return indicesOriginal.flatMap(index => [
        [index[0], index[1], index[2], index[0], index[2], index[3]]
    ]).flat();
}

// Return Minimum and Maximum per coordinates of given rectangle object or vertices
function getMinMax(rectangle) {
    let minMaxes = [[Infinity, -Infinity], [Infinity, -Infinity], [Infinity, -Infinity]];
    rectangle.vertices.forEach(vertex => {
        for (let cord = 0; cord < 3; cord++) {
            minMaxes[cord][0] = Math.min(minMaxes[cord][0], vertex[cord]);
            minMaxes[cord][1] = Math.max(minMaxes[cord][1], vertex[cord]);
        }
    });
    return minMaxes;
}


firebase.initializeApp(config);

// Init the database
var squaresData = firebase.database().ref("/squares");
var linesData = firebase.database().ref("/lines");

var removeSquares = []


var latestSquaresSnapshot;

let strokeWidth = 50
let squares = []
let removed = true;

var gridSize = 2000 // Size of the total grid
var grid = 50; // number of divisions
var gridOffset = grid/2;


function init() {
    for (var i = 0; i < (gridSize / grid); i++) {
		for (var j = 0; j < (gridSize / grid); j++) {
            // ((i*grid)+grid/4) is the formula for dividing up the grid
            // gridOffset = side of a single gird
            squaresData.push({x: ((i*grid)+grid/4), y: ((j*grid)+grid/4), s: gridOffset})
		}
    }
}

function setup() {
    createCanvas(1000, 1000);

    // init()

}

// Temp function to draw the books
function ds(x, y, s) {
    square(x, y, s)
}

async function draw() {
    strokeWeight(0);

    // Update books list (squares) with the values in the DB
    const snapshot = await squaresData.once('value');
    const squares = snapshotToArray(snapshot);

    // When a book is removed we draw it in the same colour as
    // background to esase it
    squaresData.on("child_removed", function (square) {
        strokeWeight(0);
        fill(236, 226,208)

        // draw
        ds(square.val().x, square.val().y, square.val().s)

    });


    // Draw the books
    strokeWeight(0);
    fill(162, 103, 105);
    for (let i = 0; i < squares.length; i++) {
        square(squares[i].x, squares[i].y, squares[i].s)
    }

    // Update lines list with the values in the DB
    const snapshot1 = await linesData.once('value');
    const lines = snapshotToArray(snapshot1);

    // Draw the lines
    strokeWeight(5);
    stroke(109, 46, 70);
    strokeCap(SQUARE);
    for (let i = 0; i < lines.length; i++) {
        line(lines[i].x, lines[i].y, lines[i].px, lines[i].py)
    }
}

async function mousePressed() {
    // Update squares list (books) with the values in the DB
    const snapshot = await squaresData.once('value');
    const squares = snapshotToArray(snapshot);

	for (let i = 0; i < squares.length; i++) {
        // logic for detecting if the book is clicked on 
		if (mouseX > squares[i].x && mouseX < squares[i].x + squares[i].s 
			&& mouseY > squares[i].y && mouseY < squares[i].y + squares[i].s) {
            
            // delete that book
            let delRef = firebase.database().ref("/squares/" + squares[i].key);
            delRef.remove()
		}
	}

    // Snap the starting position of the line to the center of the removed books
	startX = snapCenter(mouseX)
	startY = snapCenter(mouseY)
}

async function mouseReleased() {
    const snapshot = await squaresData.once('value');
    const squares = snapshotToArray(snapshot);

	makeLines(squares, mouseX, mouseY, startX, startY, removed)

}

// Update the lines list to only include lines starting and ending at removed books
function makeLines(squares, mouseX, mouseY, startX, startY, removed) {
    removed = true;

    // Check if the destination book is removed
	for (let i = 0; i < squares.length; i++) {
        // Find the center point of the clicked square
        mX = snapCenter(mouseX)
        mY = snapCenter(mouseY)
        
        // check if that book is removed
		if (mX > squares[i].x && mX < squares[i].x + squares[i].s 
            && mY > squares[i].y && mY < squares[i].y + squares[i].s) {
				removed = false;
		}
    }
    
    destX = snapCenter(mX)
	destY = snapCenter(mY)

	if(removed == true) {
        linesData.push({x: destX, y: destY, px: startX, py: startY})
    }
    

}

// Generic firebase func to extract data from a snapshot
function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });

    return returnArr;
};

function snapCenter(op) {
	// subtract offset (to center lines)
	// divide by grid to get row/column
	// round to snap to the closest one
	var cell = Math.round((op - gridOffset) / grid);
	// multiply back to grid scale
	// add offset to center
	return cell * grid + gridOffset;
}

// WIP
function snapBranch(op) {
	// subtract offset (to center lines)
	// divide by grid to get row/column
	// round to snap to the closest one
	var cell = Math.round((op - gridOffset) / grid);
	// multiply back to grid scale
	// add offset to center
	return cell * grid + gridOffset;
  }
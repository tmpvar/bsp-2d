var fc = require('fc');
var btnode = require('./binarytreenode');
var arc = require('subdivide-arc');

var root = new btnode(
  {
    plane: [],
    geometry: [[-100, 200], [-100, -100], [200, -100], [200, 200]]
  },
  0, this, '-'
);

//circle(root, 60);
diamondHole(root);

function diamondHole (tree) {
  tree
    .cut([0,0, 0,100], 'L')
    .cut([0,100, 100,100], 'L')
    .cut([100,100, 100,0], 'L')
    .cut([100,0, 0,0], 'L')
    .cut([50,75, 25,50], 'R')
    .cut([25,50, 50,25], 'R')
    .cut([50,25, 75,50], 'R')
    .cut([75,50, 50,75], 'R');
}

function circle (tree, count) {
  var arcpoints = arc(50, 50, 90, 0, Math.PI*2, count)
  var currentPoint = arcpoints[0]
  for (var i = 1; i < count; i++) {
    var nextPoint = arcpoints[i];
    tree = tree.cut([
      currentPoint[0],
      currentPoint[1],
      nextPoint[0],
      nextPoint[1]
    ], 'R')
    currentPoint = nextPoint;
  }
}

render('L'); // try 'L', 'R', or '-'

function drawPoly (ctx, polygon) {
  ctx.moveTo(polygon[0][0], polygon[0][1]);
  for (var i = 0; i < polygon.length; i++) {
    ctx.beginPath();
    ctx.arc(polygon[i][0], polygon[i][1], 1, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(' + 1 + ', 0, 0, ' + (i+1) *0.15 + ')';
    ctx.closePath()
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(polygon[0][0], polygon[0][1]);

  for (var k = 0; k < polygon.length; k++) {
    if (k < polygon.length - 1) {
      ctx.lineTo(polygon[k + 1][0], polygon[k + 1][1]);
    }
  }
  ctx.closePath();

  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
  ctx.strokeStyle = 'rgba(0, 0, 0, .1)'
  ctx.stroke();
  // ctx.fill();
}

function render (side) {
  var polygons = [];

  function renderIterator (context) {
    var relative;
    if ((context.side === 'L') && (side === 'L')) {
      relative = context.parent.rightChild.rightChild;
    } else if ((context.side === 'R') && (side === 'R')) {
      relative = context.parent.leftChild.leftChild;
    }
/*
    else {
      console.log('meh')
    }
*/

// console.log('---------------------')
console.log('!!! context:', context)
// console.log('---------------------')

console.log('relative:', relative)
    if (context && context.isLeaf() && ((context.side === side) || (side === '-'))) {
      // if (!relative) {
      //   return console.log(context, side);
      // }

      if (relative) {
        var cedges = context.data.edges;
        var redges = relative.data.edges;
        console.log('cedges, redges:', cedges, redges)
      }
      // console.log(context)
      // console.log('relative:', relative)

      polygons.push(context.data.geometry);
    }
    else {
      // console.log('fuuuuuuuu', context, side)
    }
  }

  function renderCompleted () {
    var ctx = fc(function () {
      ctx.translate(200, 200);
      var foo = 0;
      //for (var j = foo; j < polygons.length; j++) {
      for (var j = 0; j < polygons.length; j++) {
        drawPoly(ctx, polygons[j]);
        //if (j === foo) return;
      }
    });

    ctx.dirty();
  }

  root.traverse(renderIterator, 0, '-', renderCompleted);
}

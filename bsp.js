var fc = require('fc');
var btnode = require('./binarytreenode');
var clip = require('./clip');

var root = new btnode({
  plane: [],
  geometry: [[-100, 200], [-100, -100], [200, -100], [200, 200]]
});

root
  .cut([0,0, 0,100], 'L')
  .cut([0,100, 100,100], 'L')
  .cut([100,100, 100,0], 'L')
  .cut([100,0, 0,0], 'L')
  .cut([50,75, 25,50], 'R')
  .cut([25,50, 50,25], 'R')
  .cut([50,25, 75,50], 'R')
  .cut([75,50, 50,75], 'R');

var polygons = [];

render('R')

function render (side) {
  root.traverse(
    function callback (context, currentDepth, branch, parentId, parent) {
      if (!context) return;
      // am I on the left side and without children? render me!
      if (!context.leftChild && !context.rightChild ) {
        if (context.data && context.data.geometry && context.data.geometry.length > 0) {
          // are we the left child?
          switch (side) {
            case 'L':
              if (parent.leftChild === context) {
                polygons.push(context.data.geometry);
              }
            break;

            case 'R':
              if (parent.rightChild === context) {
                polygons.push(context.data.geometry);
              }
            break;

            default:
              polygons.push(context.data.geometry);
            break;
          }
        }
      }
    },
    0,
    '-',
    0,
    this,
    function done () {
      var ctx = fc(function() {

      var colors = ['red','orange','goldenrod', 'yellow', 'green', 'darkgreen', 'blue', 'darkblue', 'purple', 'maroon'];

      ctx.translate(200,200);
      for (var j = 0; j < polygons.length; j++) {
        var polygon = polygons[j];

        ctx.beginPath();

        ctx.moveTo(polygon[0][0], polygon[0][1]);
        for (var i = 0; i < polygon.length; i++) {
          if (i < polygon.length - 1) {
            ctx.lineTo(polygon[i + 1][0], polygon[i + 1][1]);
          }
          else {
            ctx.lineTo(polygon[0][0], polygon[0][1]);
          }
        }
        ctx.closePath();

        // ctx.fillStyle = colors[j];
        ctx.fillStyle = 'rgba(0, 190, 0, .1)';
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.fill();
      }
    });

    ctx.dirty()
  })
}
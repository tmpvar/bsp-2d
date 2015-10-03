var intersect = require('exact-segment-intersect');
var toFloat = require('robust-estimate-float');
var findSide = require('./find-side');

// scratch arrays for segline
var ta =[0, 0];
var tb =[0, 0];
var tc =[0, 0];
var td =[0, 0];

function segline(x1, y1, x2, y2, x3, y3, x4, y4) {
  ta[0] = x1;
  ta[1] = y1;
  tb[0] = x2;
  tb[1] = y2;
  tc[0] = x3;
  tc[1] = y3;
  td[0] = x4;
  td[1] = y4;

  var r = intersect(ta, tb, tc, td)
  var den = toFloat(r[2])

  if (!den) {
    return;
  }

  // TODO: just return the homogenous vector

  return [
    toFloat(r[0]) / den,
    toFloat(r[1]) / den
  ];
}

function nick (poly, nickingPlanes) {
  poly.splice(0, 0, poly[poly.length - 1]);

  var result = [];
    for (var x = 0; x < poly.length - 1; x++) {
      var lastX = poly[x][0];
      var lastY = poly[x][1];
      var currentX = poly[x + 1][0];
      var currentY = poly[x + 1][1];

      var intersection = segline(nickingPlanes[0], nickingPlanes[1], nickingPlanes[2], nickingPlanes[3], currentX, currentY, lastX, lastY);

      if (Array.isArray(intersection)) {
        result.push([intersection[0], intersection[1]]);
        result.push([intersection[0], intersection[1]]);
      }
      result.push([currentX, currentY]);
    }

  return result;
}

function clip (poly, cuttingPlane) {
  var plane = [
    cuttingPlane[2] - cuttingPlane[0],
    cuttingPlane[3] - cuttingPlane[1],

  ]

  var left = [];
  var right = [];

  var lastPointSide;
  if (!poly || !poly[0]) return {left: undefined, right: undefined};

  // instead of trying to do circular access over the underlying array, just fake it
  // this might not be a great idea later on, if arbitrary precision arithmetic/computer algebra or DAG is used
  //
  //    [1, 2, 3, 4]
  //
  // [4, 1, 2, 3, 4]
  //
  // [4, 1]
  //    [1, 2]
  //       [2, 3]
  //          [3, 4]

  poly.splice(0, 0, poly[poly.length - 1]);

  for (var i = 0; i < poly.length - 1; i++) {
    var lastX = poly[i][0];
    var lastY = poly[i][1];
    var currentX = poly[i + 1][0];
    var currentY = poly[i + 1][1];

    var side = findSide(cuttingPlane[0], cuttingPlane[1], cuttingPlane[2], cuttingPlane[3], currentX, currentY);

    // does the current line segment intersect the cuttingPlane?
    if ((lastPointSide !== 0) && (side !== 0)) {
      var intersection = segline(cuttingPlane[0], cuttingPlane[1], cuttingPlane[2], cuttingPlane[3], currentX, currentY, lastX, lastY);

      if (Array.isArray(intersection)) {
        left.push([intersection[0], intersection[1]]);
        right.push([intersection[0], intersection[1]]);
      }
    }

    if (side < 0) {
      left.push([currentX, currentY]);
    }
    else if (side === 0) {
      left.push([currentX, currentY]);
      right.push([currentX, currentY]);
    }
    else {
      right.push([currentX, currentY]);
    }

    // set lastPointSide for next iteration
    lastPointSide = side;
  }

  return {
    left: left,
    right: right
  }
}

exports.nick = nick;
exports.clip = clip;

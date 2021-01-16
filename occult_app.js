///////////////////////
//// Images for UI ////
///////////////////////
let bgMain; // main background image
let columns; // columns image
let logoMask; // this allows us to make the logo an animated gradient
let gradient1, gradient2; // these are the gradients the logo is animated with
let ecGlyph, temperatureGlyph, phGlyph; // these are the pictures at the tops of the columns
let lightsGlyph, lightsOffGlyph, pumpGlyph; // these are the pictures floating in the sky

var bgWidth, bgHeight, bgOrigin;
var gradientWidth, gradientHeight, gradientReset, g1, g2;
var lightsOrigin, lightsArcDiameter;

var vp; //vanishing point for calculating perspective drawing stuff

/////////////////////
//// Components /////
/////////////////////
var lights = {};
var ec = {};
var ph = {};
var temperature = {};
var waterPump = {};

////////////////////////////////////////////////////
//// PLACEHOLDER - DELETE ONCE FB IS PLUGGED IN ////
////////////////////////////////////////////////////
function demonstrationHardcode() {
  ec.name = 'ec';
  ec.desiredMin = 1.5;
  ec.desiredMax = 2.4;
  ec.currentVal = 1.932;

  ph.name = 'ph';
  ph.desiredMin = 6.0;
  ph.desiredMax = 7.0;
  ph.currentVal = 6.342;

  temperature.name = 'temperature';
  temperature.desiredMin = 64;
  temperature.desiredMax = 80;
  temperature.currentVal = 73;

  lights.name = 'lights';
  lights.onTime = 7;
  lights.offTime = 22.25;
  //lights.onTime = 0.6;
  //lights.offTime = 23;
}
function preload() {
  //bgMain = loadImage('assets/occultUI.jpg');
  bgMain = loadImage('assets/bg_stripped_small.png');
  logoMask = loadImage('assets/logo_mask_small.png');
  columns = loadImage('assets/columns_small.png');
  gradient1 = loadImage('assets/gradient_small.png');
  gradient2 = loadImage('assets/gradient_small.png');
  ecGlyph = loadImage('assets/ecGlyph_small.png');
  temperatureGlyph = loadImage('assets/temperatureGlyph_small.png');
  phGlyph = loadImage('assets/phGlyph_small.png');
  lightsGlyph = loadImage('assets/lightsGlyph_small.png');
  lightsOffGlyph = loadImage('assets/lightsOffGlyph_small.png');
  pumpGlyph = loadImage('assets/pumpGlyph_small.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  bgMain.mask(logoMask);

  bgSetup(); 
  uiSetup(); 
  demonstrationHardcode();

  textFont('IM Fell Double Pica SC');

  ec.currentRing = calcRingPoints(ec, map(ec.currentVal, 
                                          ec.desiredMin, ec.desiredMax, 
                                          ec.ringLoc.min, ec.ringLoc.max));
  
  temperature.currentRing = calcRingPoints(temperature, map(temperature.currentVal, 
                                                            temperature.desiredMin, temperature.desiredMax, 
                                                            temperature.ringLoc.min, temperature.ringLoc.max));
  
  ph.currentRing = calcRingPoints(ph, map(ph.currentVal, 
                                          ph.desiredMin, ph.desiredMax, 
                                          ph.ringLoc.min, ph.ringLoc.max));

  var lightsOn = map(Math.round(lights.onTime), 0, 24, 0, 2*PI) - PI/2 - PI/48;
  var lightsOff = map(Math.round(lights.offTime), 0, 24, 0, 2*PI) - PI/2 - PI/48;
  var darkRaysMask = createGraphics(lightsOffGlyph.width, lightsOffGlyph.height);
  darkRaysMask.fill(0);

  // TODO: it's not this simple if it goes during midnight but whatever for now
  darkRaysMask.arc(darkRaysMask.width * .6926, 
                   darkRaysMask.height * .2625, 
                   darkRaysMask.height * .2, 
                   darkRaysMask.height * .2, 
                   lightsOff, 
                   lightsOn);
  lightsOffGlyph.mask(darkRaysMask.get());
}

function bgSetup() {
  var bgAspect = bgMain.width / bgMain.height;
  var windowAspect = width / height;

  // We want to fill the screen so if bgAspect > windowAspect fill height and crop width
  //                               if bgAspect < windowAspect fill width and crop height
  if (bgAspect < windowAspect) {
    bgWidth = width;
    bgHeight = width / bgAspect;
    bgOrigin = {x:0, y:height/2 - bgHeight/2};
    
  }

  else {
    bgHeight = height;
    bgWidth = height * bgAspect
    bgOrigin = {x: width/2 - bgWidth/2, y:0};
  }

  // Vanishing point
  vp =  {x: bgOrigin.x + bgWidth * .5, y: bgOrigin.y + bgHeight * .494};

  // Gradient stuff
  gradientWidth = gradient1.width * bgWidth / bgMain.width;
  gradientHeight = gradient1.height * bgHeight / bgMain.height;
  gradientReset = bgWidth * .812
  g1 = {x: bgOrigin.x + bgWidth * .207, y: bgOrigin.y + bgHeight * .028};
  g2 = {x: g1.x - gradientWidth + 1, y: g1.y};

  // Center of the lights glyph (sun) used to create a clipping mask in drawGlyphs
  lightsOrigin = {x: bgOrigin.x + bgWidth * .6926, y: bgOrigin.y + bgHeight * .2625};
  lightsArcDiameter = bgHeight * .2;
}

function uiSetup() {
  temperature.ringLoc = {
    widthFront: bgWidth * .145,
    widthRear: bgWidth * .127,
    centerFront: bgOrigin.x + bgWidth * .5,
    centerRear: bgOrigin.x + bgWidth * .5,
    min: bgOrigin.y + bgHeight * .738,
    max: bgOrigin.y + bgHeight * .515
  };
  temperature.minRing = calcRingPoints(temperature, temperature.ringLoc.min);
  temperature.maxRing = calcRingPoints(temperature, temperature.ringLoc.max);

  ph.ringLoc = {
    widthFront: bgWidth * .175,
    widthRear: bgWidth * .155,
    centerFront: bgOrigin.x + bgWidth * .853,
    centerRear: bgOrigin.x + bgWidth * .814,
    min: bgOrigin.y + bgHeight * .809,
    max: bgOrigin.y + bgHeight * .513
  };
  ph.minRing = calcRingPoints(ph, ph.ringLoc.min);
  ph.maxRing = calcRingPoints(ph, ph.ringLoc.max);

  ec.ringLoc = {
    widthFront: bgWidth * .175,
    widthRear: bgWidth * .155,
    centerFront: bgOrigin.x + bgWidth * .147,
    centerRear: bgOrigin.x + bgWidth * .185,
    min: bgOrigin.y + bgHeight * .812,
    max: bgOrigin.y + bgHeight * .53
  };
  ec.minRing = calcRingPoints(ec, ec.ringLoc.min);
  ec.maxRing = calcRingPoints(ec, ec.ringLoc.max);
}








////////////////////////////////////////////////////
//// These functions are used to draw the rings ////
//// around the columns. Both the min/max as    ////
//// well as the current value                  ////
////////////////////////////////////////////////////
function calcRingPoints(component, yPos) {
  var componentRing = component.ringLoc;

  if (yPos > componentRing.min) {
    yPos = componentRing.min;
  }
  if (yPos < componentRing.max) {
    yPos = componentRing.max;
  }

  var l = {x: componentRing.centerFront - componentRing.widthFront/2, y: yPos};
  var h = {x: componentRing.centerFront + componentRing.widthFront/2, y: yPos};

  // Calculate the center slope
  var centerSlope = (vp.x - componentRing.centerFront) / (vp.y - yPos);
  var leftSlope = (vp.x - l.x) / (vp.y - yPos);
  var rightSlope = (vp.x - h.x) / (vp.y - yPos);

  //if(count < 1000) console.log("left: " + leftSlope + ",     center: " + centerSlope + ",     right: " + rightSlope + "\n\n");
  // We're only really concerned in the difference between the absolute values of the slopes
  var summedSlope = abs(leftSlope - centerSlope) + abs(rightSlope - centerSlope);
  var widthDiff = componentRing.widthFront - componentRing.widthRear; // TODO: this could be a stored value
  var offset = widthDiff / summedSlope;

  var p = {x: l.x - leftSlope * offset, y: l.y - offset};
  var d = {x: p.x + componentRing.widthRear, y: p.y};

  var j = {x: componentRing.centerFront, y: l.y};
  var b = {x: componentRing.centerRear, y: p.y};

  var a = lineIntersection(l.x, l.y, d.x, d.y, h.x, h.y, p.x, p.y);

  var n = lineIntersection(a.x, a.y, a.x - componentRing.widthFront, a.y, l.x, l.y, p.x, p.y);
  var f = lineIntersection(a.x, a.y, a.x + componentRing.widthFront, a.y, h.x, h.y, d.x, d.y);

  var y = pointAlongLine(a.x, a.y, l.x, l.y, .739);
  var v = pointAlongLine(a.x, a.y, h.x, h.y, .739);
  var s = pointAlongLine(a.x, a.y, d.x, d.y, .739);
  var ab = pointAlongLine(a.x, a.y, p.x, p.y, .739);

  var k = {x: (l.x + j.x) / 2, y: l.y};
  var c = {x: (b.x + d.x) / 2, y: b.y};
  var i = {x: (j.x + h.x) / 2, y: j.y};
  var q = {x: (p.x + b.x) / 2, y: p.y};

  var x = pointAlongLine(a.x, a.y, k.x, k.y, .882);
  var r = pointAlongLine(a.x, a.y, c.x, c.y, .904);
  var w = pointAlongLine(a.x, a.y, i.x, i.y, .882);
  var ac = pointAlongLine(a.x, a.y, q.x, q.y, .904);

  var ad = lineIntersection(l.x, l.y, f.x, f.y, h.x, h.y, n.x, n.y);
  var ae = lineIntersection(n.x, n.y, d.x, d.y, f.x, f.y, p.x, p.y);

  var m = lineIntersection(ad.x, ad.y, ad.x - componentRing.widthFront, ad.y, l.x, l.y, n.x, n.y);
  var g = lineIntersection(ad.x, ad.y, ad.x + componentRing.widthFront, ad.y, h.x, h.y, f.x, f.y);
  var o = lineIntersection(ae.x, ae.y, ae.x - componentRing.widthFront, ae.y, n.x, n.y, p.x, p.y);
  var e = lineIntersection(ae.x, ae.y, ae.x + componentRing.widthFront, ae.y, f.x, f.y, d.x, d.y);

  var z = pointAlongLine(a.x, a.y, m.x, m.y, .897);
  var u = pointAlongLine(a.x, a.y, g.x, g.y, .897);
  var aa = pointAlongLine(a.x, a.y, o.x, o.y, .894);
  var t = pointAlongLine(a.x, a.y, e.x, e.y, .894);

  return [f, u, v, w, j, x, y, z, n, aa, ab, ac, b, r, s, t];
}

function pointAlongLine(x1, y1, x2, y2, mDist) {
  return {x: map(mDist, 0, 1, x1, x2), y: map(mDist, 0, 1, y1, y2),}
}

// construction lines - used for debugging
var constructionFlag = false;
function cLine(x1, y1, x2, y2) {
  if (constructionFlag) {
    strokeWeight(1);
    stroke(0, 0, 255);
    line(x1, y1, x2, y2);
  }
}

function cCircle(x, y, rad) {
  if (constructionFlag) {
    fill(0, 255, 0);
    ellipse(x, y, rad, rad);
  }
}

function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {

  // calculate the distance to intersection point
  var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {

    // optionally, draw a circle where the lines meet
    var intersectionX = x1 + (uA * (x2-x1));
    var intersectionY = y1 + (uA * (y2-y1));
    fill(0, 255, 0);
    //cCircle(intersectionX,intersectionY, 4);

    //return true;
    return {x: intersectionX, y: intersectionY}
  }
  return {x: -1, y: -1};
}

function drawRingRear(component) {
  var ring = component.noiseyCurrentRing;
  noFill();

  ringColor(component);
  
  beginShape();
  for (var i = 7; i <= 15; i++) {
    curveVertex(ring[i].x, ring[i].y);
  }
  curveVertex(ring[0].x, ring[0].y);
  curveVertex(ring[1].x, ring[1].y);
  endShape();
}

function drawRingFront(component) {
  var ring = component.noiseyCurrentRing;
  noFill();
  
  ringColor(component);
  
  // Draw the front half of the ring
  beginShape();
  curveVertex(ring[15].x, ring[15].y);
  for (var i = 0; i <= 9; i++) {
    curveVertex(ring[i].x, ring[i].y);
  }
  endShape();

  // Write current value
  fill(0);
  noStroke();
  textSize(bgHeight * .02);
  var valString;
  if (component.name == 'ec') valString = component.currentVal.toFixed(3) + ' mS/cm'
  if (component.name == 'temperature') valString = component.currentVal.toFixed(2) + ' °f';
  if (component.name == 'ph') valString = component.currentVal.toFixed(2);
  text(valString, component.currentRing[14].x + bgWidth * .005, component.currentRing[14].y - bgHeight * .005);  
}

function ringColor(component) {
  var greenR = 139, greenG = 199, greenB = 163;
  var yellowR = 242, yellowG = 213, yellowB = 109;
  var redR = 196, redG = 75; redB = 69;

  // All values within a certain range from the center of desired values will display as green
  // Values outside of that range will transition to yellow and then red
  var safeMinVal = map(.25, 0, 1, component.desiredMin, component.desiredMax);
  var safeMaxVal = map(.75, 0, 1, component.desiredMin, component.desiredMax);
  var cautionMinVal = map(.1, 0, 1, component.desiredMin, component.desiredMax);
  var cautionMaxVal = map(.9, 0, 1, component.desiredMin, component.desiredMax);

  if (component.currentVal >= safeMinVal && component.currentVal <= safeMaxVal) {
    stroke(greenR, greenG, greenB);
  }
  else if (component.currentVal >= cautionMinVal && component.currentVal <= cautionMaxVal) {
    if (component > safeMaxVal) {
      stroke(map(component.currentVal, safeMaxVal, cautionMaxVal, greenR, yellowR),
             map(component.currentVal, safeMaxVal, cautionMaxVal, greenG, yellowG),
             map(component.currentVal, safeMaxVal, cautionMaxVal, greenB, yellowB));
    }
    else {
      stroke(map(component.currentVal, safeMinVal, cautionMinVal, greenR, yellowR),
             map(component.currentVal, safeMinVal, cautionMinVal, greenG, yellowG),
             map(component.currentVal, safeMinVal, cautionMinVal, greenB, yellowB));
    }
  }
  else if (component.currentVal >= component.desiredMin && component.currentVal <= component.desiredMax) {
    if (component > cautionMaxVal) {
      stroke(map(component.currentVal, cautionMaxVal, component.desiredMax, yellowR, redR),
             map(component.currentVal, cautionMaxVal, component.desiredMax, yellowG, redG),
             map(component.currentVal, cautionMaxVal, component.desiredMax, yellowB, redB));
    }
    else {
      stroke(map(component.currentVal, cautionMinVal, component.desiredMin, yellowR, redR),
             map(component.currentVal, cautionMinVal, component.desiredMin, yellowG, redG),
             map(component.currentVal, cautionMinVal, component.desiredMin, yellowB, redB));
    }
  }
  else {
    stroke(redR, redG, redB);
  }
}

function dashStroke() {
  stroke(50);
  strokeWeight(3);
}

function drawDashesRear() {
  dashStroke();
  dashHelperRear(ec.minRing);
  dashHelperRear(ec.maxRing);
  dashHelperRear(temperature.minRing);
  dashHelperRear(temperature.maxRing);
  dashHelperRear(ph.minRing);
  dashHelperRear(ph.maxRing);
}

function dashHelperRear(temp) {
  // for a total of 8 dashes
  //for (var i = 8; i <= 14; i += 2) {
  //  curve(temp[i-1].x, temp[i-1].y, temp[i].x, temp[i].y, temp[i+1].x, temp[i+1].y, temp[i+2 == 16 ? 0 : i + 2].x, temp[i+2 == 16 ? 0 : i + 2].y);
  //}

  // for a total of 16 dashes
  for (var i = 8; i <= 15; i++) {
    curve((temp[i].x + temp[i-1].x) / 2, (temp[i].y + temp[i-1].y) / 2,
          temp[i].x, temp[i].y, 
          (temp[i].x + temp[i+1 == 16 ? 0 : i+1].x) / 2, (temp[i].y + temp[i+1 == 16 ? 0 : i+1].y) / 2, 
          temp[i+1 == 16 ? 0 : i+1].x, temp[i+1 == 16 ? 0 : i+1].y
    );
  }
}

function drawDashesFront() {
  dashStroke();
  dashHelperFront(ec.minRing);
  dashHelperFront(ec.maxRing);
  dashHelperFront(temperature.minRing);
  dashHelperFront(temperature.maxRing);
  dashHelperFront(ph.minRing);
  dashHelperFront(ph.maxRing);

  // Write the min/max vals
  fill(0);
  noStroke();
  textSize(bgHeight * .016);
  text(ec.desiredMin, ec.minRing[8].x - bgWidth * .05, ec.minRing[8].y + bgHeight * .015);
  text(ec.desiredMax, ec.maxRing[9].x - bgWidth * .05, ec.maxRing[9].y - bgHeight * .01);
  text(temperature.desiredMin, temperature.minRing[8].x - bgWidth * .04, temperature.minRing[8].y + bgHeight * .003);
  text(temperature.desiredMax, temperature.maxRing[9].x - bgWidth * .03, temperature.maxRing[9].y - bgHeight * .007);
  text(ph.desiredMin.toFixed(1), ph.minRing[9].x - bgWidth * .03, ph.minRing[9].y - bgHeight * .012);
  text(ph.desiredMax.toFixed(1), ph.maxRing[9].x - bgWidth * .03, ph.maxRing[9].y - bgHeight * .007);
}

function dashHelperFront(temp) {
  // for a total of 8 dashes
  //for (var i = 0; i <= 6; i += 2) {
  //  curve(temp[i-1 == -1 ? 15 : i-1].x, temp[i-1 == -1 ? 15 : i-1].y, temp[i].x, temp[i].y, temp[i+1].x, temp[i+1].y, temp[i+2].x, temp[i+2].y);
  //}

  //for a total of 16 dashes
  for (var i = 0; i <= 7; i++) {
    curve((temp[i].x + temp[i-1 == -1 ? 15 : i-1].x) / 2, (temp[i].y + temp[i-1 == -1 ? 15 : i-1].y) / 2,
          temp[i].x, temp[i].y, 
          (temp[i].x + temp[i+1].x) / 2, (temp[i].y + temp[i+1].y) / 2, 
          temp[i+1].x, temp[i+1].y
    );
  }
}

var time = 0;
function ringNoise() {
  var timeInc = .01;
  var noiseScale = bgHeight * .02;
  temperature.noiseyCurrentRing = [];
  ec.noiseyCurrentRing = [];
  ph.noiseyCurrentRing = [];
  for (var i = 0; i < temperature.currentRing.length; i++) {
    ec.noiseyCurrentRing[i] = {x: ec.currentRing[i].x, y: ec.currentRing[i].y + noiseScale * (noise(ec.currentVal, ec.currentRing[i].x, time) - .5)};
    ph.noiseyCurrentRing[i] = {x: ph.currentRing[i].x, y: ph.currentRing[i].y + noiseScale * (noise(ph.currentVal, ph.currentRing[i].x, time) - .5)};
    temperature.noiseyCurrentRing[i] = {x: temperature.currentRing[i].x, y: temperature.currentRing[i].y + noiseScale * (noise(temperature.currentVal, temperature.currentRing[i].x, time) - .5)};
  }

  time += timeInc;
}









/////////////////////////////////
//// Basic app functionality ////
/////////////////////////////////
var count = 0;
function draw() {
  background(255, 0, 0);

  logoGradient();
  
  image(bgMain, bgOrigin.x, bgOrigin.y, bgWidth, bgHeight);

  ringNoise();
  
  //draw rear rings
  drawDashesRear();
  drawRingRear(ec);
  drawRingRear(temperature);
  drawRingRear(ph);

  // draw columns (and glyphs) so that rear of rings displays as behind them
  image(columns, bgOrigin.x, bgOrigin.y, bgWidth, bgHeight);
  drawGlyphs();

  //draw front rings
  drawDashesFront();
  drawRingFront(ec);
  drawRingFront(temperature);
  drawRingFront(ph);


// FOR DEBUG PURPOSES ONLY
// EC should drop slightly, ph should rise slightly
  if (count > 300 && temperature.currentVal >= 54.9) {
    temperature.currentVal -= .05;
    temperature.currentRing = calcRingPoints(temperature, map(temperature.currentVal, 
                                                            temperature.desiredMin, temperature.desiredMax, 
                                                            temperature.ringLoc.min, temperature.ringLoc.max));

    ec.currentVal -= .00005;
    ec.currentRing = calcRingPoints(ec, map(ec.currentVal, 
                                            ec.desiredMin, ec.desiredMax, 
                                            ec.ringLoc.min, ec.ringLoc.max));

    ph.currentVal += .0001;
    ph.currentRing = calcRingPoints(ph, map(ph.currentVal, 
                                            ph.desiredMin, ph.desiredMax, 
                                            ph.ringLoc.min, ph.ringLoc.max));
  }
  count++;
  if (count > 3000) {
    count = 0;
    temperature.currentVal = 73;
    temperature.currentRing = calcRingPoints(temperature, map(temperature.currentVal, 
                                                            temperature.desiredMin, temperature.desiredMax, 
                                                            temperature.ringLoc.min, temperature.ringLoc.max));
  }
  //console.log(count);
}

gradientSpeed = 1.25;
function logoGradient() {
  image(gradient1, g1.x, g1.y, gradientWidth, gradientHeight);
  image(gradient2, g2.x, g2.y, gradientWidth, gradientHeight);
  
  g1.x += gradientSpeed;
  g2.x += gradientSpeed;

  if (g1.x > gradientReset) {
    g1.x = g2.x - gradientWidth + 1;
  }
  if (g2.x > gradientReset) {
    g2.x = g1.x - gradientWidth + 1;
  }
}

function drawGlyphs() {
  // Draw glyphs at the tops of the columns
  image(ecGlyph, bgOrigin.x, bgOrigin.y + 3*sin(frameCount/30), bgWidth, bgHeight);
  image(temperatureGlyph, bgOrigin.x, bgOrigin.y + 3*sin((120+frameCount)/30), bgWidth, bgHeight);
  image(phGlyph, bgOrigin.x, bgOrigin.y + 3*sin((240+frameCount)/30), bgWidth, bgHeight);

  // Draw the lights glyph
  image(lightsGlyph, bgOrigin.x, bgOrigin.y, bgWidth, bgHeight);
  image(lightsOffGlyph, bgOrigin.x, bgOrigin.y, bgWidth, bgHeight);
  //lights text
  fill(0);
  noStroke();
  textSize(bgHeight * .016);
  var onString = prependZero(Math.floor(lights.onTime)) + 'h' + prependZero((lights.onTime % 1)*60);
  var offString = prependZero(Math.floor(lights.offTime)) + 'h' + prependZero((lights.offTime % 1)*60);
  text('on: ' + onString + '\noff: ' + offString, lightsOrigin.x - bgWidth * .06, lightsOrigin.y - bgHeight * .005); 

  // Draw the pump glyph
  image(pumpGlyph, bgOrigin.x, bgOrigin.y, bgWidth, bgHeight);
  //pump text
  text('always on', bgOrigin.x + bgWidth * .255, bgOrigin.y + bgHeight * .29); 
}

function prependZero(num) {
  if (num < 10) {
    return '0' + num.toFixed(0);
  }
  return num.toFixed(0);
}









///////////////////////////////////////////
//// Prevent iOS rubber band scrolling ////
///////////////////////////////////////////
window.addEventListener('touchmove', function (event) {
  event.preventDefault()
}, {passive: false});

// Allows content to move on touch.
//TODO: canvas is null
/*
document.querySelector('canvas').addEventListener('touchmove', function (event) {
  event.stopPropagation()
}, false);
*/
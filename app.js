var currentView;

// UI Vars
var scaledLogoWidth;
var scaledLogoHeight;
var logoOffset;
var graphOriginX;
var graphOriginY;

var lights = {};
var ec = {};
var ph = {};
var temperature = {};
var waterPump = {};
//var dissolvedOxygen = {}; //

let logo;
// SET UP 
// ----------------------------------------------------------------------------

function preload() {
  logo = loadImage('assets/fb_logo.png');

  // Call the FreshBytes api to get the most recent readings as well as the config data
  var xmlHttp = new XMLHttpRequest();
  
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      loadData(xmlHttp.responseText);
    }
  }
  xmlHttp.open("GET", "http://192.168.1.42:8080/api/week", true); // true for asynchronous //TODO: change from local network
  xmlHttp.send(null);
}

function loadData(responseText) {
  var response = JSON.parse(responseText);

  var configSettings = response.config;
  var readings = response.readings;
  
  // Nutrient Density
  ec.name = "Nutrients";
  ec.desiredMin = configSettings.ppmMin;
  ec.desiredMax = configSettings.ppmMax;
  ec.readings = [];

  ph.name = "pH";
  ph.desiredMin = configSettings.phMin;
  ph.desiredMax = configSettings.phMax;
  ph.readings = [];

  temperature.name = "Temperature";
  temperature.desiredMin = configSettings.tempMin;
  temperature.desiredMax = configSettings.tempMax;
  temperature.readings = [];

  parseReadings(readings);
}

function parseReadings(readings) {
  for (var i = 0; i < readings.length; i++) {
    var tempReading = readings[i];
    var tempDate = new Date(tempReading.pollTime);

    ec.readings.push({reading: tempReading.ppm, pollTime: tempDate});
    ph.readings.push({reading: tempReading.ph, pollTime: tempDate});
    temperature.readings.push({reading: tempReading.temperature, pollTime: tempDate});

    // We keep track of the min and max to scale the amplitude of our data viz
    if (i === 0) {
      ec.recordedMin = tempReading.ppm;
      ec.recordedMax = tempReading.ppm;

      ph.recordedMin = tempReading.ph;
      ph.recordedMax = tempReading.ph;

      temperature.recordedMin = tempReading.temperature;
      temperature.recordedMax = tempReading.temperature;
    }
    else {
      if (tempReading.ppm < ec.recordedMin) {
        ec.recordedMin = tempReading.ppm;
      }
      if (tempReading.ppm > ec.recordedMax) {
        ec.recordedMax = tempReading.ppm;
      }
      if (tempReading.ph < ph.recordedMin) {
        ph.recordedMin = tempReading.ph;
      }
      if (tempReading.ph > ph.recordedMax) {
        ph.recordedMax = tempReading.ph;
      }
      if (tempReading.temperature < temperature.recordedMin) {
        temperature.recordedMin = tempReading.temperature;
      }
      if (tempReading.temperature > temperature.recordedMax) {
        temperature.recordedMax = tempReading.temperature;
      }
    }
  }
} 

function setup() {
  createCanvas(windowWidth, windowHeight);
  currentView = "main";
  setupUI();
}

function setupUI() {
  var logoAspectRatio = logo.width / logo.height;
  scaledLogoWidth = width * .67;
  scaledLogoHeight = scaledLogoWidth / logoAspectRatio;
  logoOffset = (width - scaledLogoWidth) / 2; 

  graphOriginX = width/2;
  graphOriginY = height/2;
}

function mainView() {
  var lineLen = width * .4;
  var maxOffset = 40;

  // TODO: calc the difference between min and max and reading at index 0
  // the larger of the two will determine how much to scale the mapped amplitude

  // Plot data
  push();
  translate(graphOriginX, graphOriginY);
  //rotate(-PI / 6);
  line(0, 0, lineLen, 0);
  line(0, maxOffset, lineLen, maxOffset);
  line(0, -maxOffset, lineLen, -maxOffset);

  var vertices = [];
  var firstReading = temperature.readings[0].reading;
  var minDiff = firstReading - temperature.recordedMin;
  var maxDiff = temperature.recordedMax - firstReading;
  var scaleDiff = minDiff > maxDiff ? minDiff : maxDiff;

  stroke(255, 0, 0);
  strokeWeight(4);
  beginShape();
  for (var i = 0; i < temperature.readings.length; i++) {
    //scale x
    var myX = map(i, 0, temperature.readings.length, 0, lineLen);
    //scale y

    var tempReading = temperature.readings[i].reading;
    var myY = map(tempReading - firstReading, 0, scaleDiff, 0, maxOffset);
    //var myY = temperature.readings[i].reading - 62;
    //console.log(myY);
    if (i === 0 || i === temperature.readings.length - 1) {
      vertex(myX, myY);
    }
    else {
      curveVertex(myX, myY);
    }
  }
  endShape();

  //rotate(-PI * 2/3);
  //line(0, 0, lineLen, 0);
  //rotate(-PI * 2/3);
  //line(0, 0, lineLen, 0);
  pop();

  // Draw logo
  image(logo, logoOffset, 0, scaledLogoWidth, scaledLogoHeight);
}

//function mapReadings() {
//  var vertices = [];
//}

/*

// COMPONENT VIEW
// ----------------------------------------------------------------------------
function drawComponentView() {
  var component = currentView;

  // draw back icon
  line(15, 15, 48, 48);
  line(15, 48, 48, 15);

  // draw graph
  var origin = {x: 63, y: height * 9/10};
  var bounds = {x: width * 3/4 - 63, y: 63};
  var gWidth = bounds.x - origin.x;
  var gHeight = origin.y - bounds.y;
  translate(origin.x, bounds.y);
  plotVals(component, bounds.x - origin.x, origin.y - bounds.y);
  translate(-origin.x, -bounds.y);

  // draw axes
  line(origin.x, origin.y, origin.x, bounds.y);
  line(origin.x, origin.y, bounds.x, origin.y);

  // label x axis
  for (var i = 0; i < 6; i++) {
    var x = bounds.x - i * gWidth / 6;
    line(x, origin.y, x, origin.y + 10);
    textSize(height / 50);
    var time = -4 * i;
    text(time + " hours", x, origin.y + 20)
  }

  // label y axis
  textAlign(RIGHT, CENTER);
  var y = origin.y - gHeight * 1/4;
  line(origin.x, y, origin.x - 10, y);
  text(component.min.toPrecision(3), origin.x - 12, y);
  y -= gHeight / 4;
  line(origin.x, y, origin.x - 10, y);
  text(((component.max + component.min) / 2).toPrecision(3), origin.x - 12, y);
  y -= gHeight / 4;
  line(origin.x, y, origin.x - 10, y);
  text(component.max.toPrecision(3), origin.x - 12, y);

  
  translate(25, 63 + gHeight / 2);
  rotate(-PI / 2);
  textAlign(CENTER, CENTER);
  text("Electrical Conductivity in mS", 0, 0);
  rotate(PI / 2);
  translate(-25, -63 - gHeight / 2);


  // draw panel on the right
  var panelWidth = width / 4;
  translate(3 * panelWidth, 0);
  line(0, 0, 0, height);
  ellipse(panelWidth / 2, iconSize, iconSize, iconSize);
  textSize(iconSize * .14);
  textAlign(CENTER, CENTER);
  text(component.name, panelWidth / 2, iconSize * .2);

  textSize(height / 20);
  textAlign(LEFT, CENTER);
  line(0, height * 5/10, panelWidth, height * 5/10);
  text("Current Value: " + component.vals[component.vals.length-1].toPrecision(3), 15, height * 11/20);
  
  line(0, height * 6/10, panelWidth, height * 6/10);
  text("More Info", 15, height * 13/20);

  line(0, height * 7/10, panelWidth, height * 7/10);
  text("Min: " + component.min.toPrecision(3), 15, height * 15/20);
  
  line(0, height * 8/10, panelWidth, height * 8/10);
  text("Max: " + component.max.toPrecision(3), 15, height * 17/20);
  
  line(0, height * 9/10, panelWidth, height * 9/10);
  text("Save Settings", 15, height * 19/20);

  textSize(iconSize * .14);
  textAlign(CENTER, CENTER);
}
*/

// APP LOGIC
// ----------------------------------------------------------------------------

function draw() {
  background(255);
  if (currentView === "main" && temperature.hasOwnProperty('readings')) {
    if (temperature.readings.length > 0) { //TODO: make this more elegant
      mainView();
    }
  }
  else {
    //console.log(currentView);
  }
  /*
  else {
    drawComponentView();
  }
  */
}

/*
function windowResized() {
  setup();
}

function touchEnded() {
  mouseClicked();
}

function mouseClicked() {
  // We've clicked on a specific component from the grid view
  if (currentView === "grid") {
    if (mouseY < boxHeight) {
      if (mouseX < boxWidth) {
        currentView = lights;
      }
      else if (mouseX < 2 * boxWidth) {
        currentView = ec;
      }
      else {
        currentView = ph;
      }
    }
    else {
      if (mouseX < boxWidth) {
        currentView = temperature;
      }
      else if (mouseX < 2 * boxWidth) {
        currentView = waterPump
      }
      else {
        currentView = dissolvedOxygen;
      }
    }
  }

  else {
    if (mouseX < 48 && mouseY < 48) {
      currentView = "grid";
    } 
  }
}


// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

function scaleVal(oldMin, oldMax, newMin, newMax, val) {
  return (newMax - newMin) * (val - oldMin) / (oldMax - oldMin) + newMin;
}
*/

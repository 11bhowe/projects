let data = [];
let coef = [];
let intercepts = [];
let features = [];
let mse = [];
let scatterData = [];
let myChart;

// https://www.kaggle.com/datasets/kumarajarshi/life-expectancy-who?select=Life+Expectancy+Data.csv

let feature_abbrs = ['Country','Region','Year','Infant_deaths','Under_5_deaths','Adult_mortality','Alcohol','HepB','Measles','BMI','Polio','Diphtheria','HIV','GDP','Pop','Thinness_10_to_19','Thinness_5_to_9','Schooling','Developed','Developing'];
let feature_names = ['Country','Region','Year','Infant Mortality', 'Child Mortality','Adult Mortality','Alcohol Consumption','Hepatitis B','Measles','BMI','Polio','Diphtheria','HIV','GDP Per Capita','Population','Thinness in 10-19 yr olds','Thinness in 5-9 yr olds','Years of School','Development Status','Developing Economy'];
let features_to_exclude = ['Thinness_10_to_19','Thinness_5_to_9','Developing'];
let feature_tooltips = [
  'Name of the country, numerically encoded, in alphabetical order.',
  'Geographic region of the country (Asia, North America, etc), numerically encoded, in alphabetical order.',
  'The year the data was recorded.',
  'Number of infant deaths per 1,000 people.',
  'Number of child deaths per 1,000 people (under 5 years old).',
  'Number of adult (ages 15-60) deaths per 1,000 people.',
  'Recorded alcohol consumption per capita (in litres of pure alcohol).',
  '% of one-year-olds vaccinated against Hepatitis B.',
  '% of one-year-olds vaccinated against Measles.',
  'Average Body Mass Index (BMI) calculated with the formula weight (kg) / height (m)².',
  '% of one-year-olds who have received the polio vaccine.',
  '% of one-year-olds who have received the diphtheria tetanus toxoid and pertussis (DTP3) vaccine.',
  'Number of new HIV cases per 1,000 people.',
  'Gross Domestic Product (GDP) per capita, the average economic output per person (in USD).',
  'The population of the country in millions.',
  '% of children aged 10-19 who are underweight or experiencing thinness (likely due to malnutrition).',
  '% of children aged 5-9 who are underweight or experiencing thinness (likely due to malnutrition).',
  'Average number of years of schooling per person.',
  'Indicates whether a country is classified as "developed" or "developing".',
  'Indicates whether a country is classified as "developing".',
];

function readData() {  
  fetch("data.csv")
  .then(response => response.text())
  .then((text) => {
    let d = text.split("\n");
    
    for (let i=0; i<d.length; i++) {
      let dd = d[i].split(',');
      let ddd = [];
      for (let j=0; j<dd.length; j++) {
        ddd.push(parseFloat(dd[j]));
      }
      data.push(ddd);
    }
    
    readCoefficients();
  })
}

function readCoefficients() {
  fetch("coefficients.txt")
  .then(response => response.text())
  .then((text) => {
    coef = text.split("\n");
  
    readIntercepts();
  })
}

function readIntercepts() {
  fetch("intercepts.txt")
  .then(response => response.text())
  .then((text) => {
    intercepts = text.split("\n");
    
    readFeatures();
  })
}

function readFeatures() {
  fetch("features.txt")
  .then(response => response.text())
  .then((text) => {
    features = text.split("\n");

    readMSE();
    generateFeatureBoxes();
  })
}

function readMSE() {
  fetch("mse.txt")
  .then(response => response.text())
  .then((text) => {
    mse = text.split("\n");
  })
}


function generateFeatureBoxes() {
  let output = '';
  output += '<div style="border-bottom: 1px solid #999999; padding-bottom:4px; max-width:100px; margin-bottom:9px;"><input onclick="checkAll()" type="checkbox" id="checkAll" name="checkAll">';
  output += '<label for="checkAll">Select All</label></div>';
  
  for (let i=0; i<feature_abbrs.length; i++) {
    if (features_to_exclude.includes(feature_abbrs[i])) {
      output += '<div class="sep tooltip-container" style="display: none">';
    } else {
      output += '<div class="sep tooltip-container">';
    }
    output += '<input class="checkbox" onclick="runModel()" type="checkbox" id="' + feature_abbrs[i] + '" name="' + feature_abbrs[i] + '">';
    output += '<label class="tooltip" for="' + feature_abbrs[i] + '">' + feature_names[i] + '</label>';
    output += '<div class="tooltiptext">' + feature_tooltips[i] + '</div></div>';
  }
  
  document.getElementById('feature-container').innerHTML = output;
  plot();
}


function parseCoeficients(c) {
  if (c == undefined) {
    return [];
  }
  let parsed = [];
  let dd = c.split(',');
  for (let i=0; i<dd.length; i++) {
    parsed.push(parseFloat(dd[i]));
  }
  return parsed;
}


function checkAll() {
  let box = document.getElementById("checkAll");
  let boxes = document.getElementsByClassName("checkbox");
  if (box.checked == true) {
    for (let i=0; i<boxes.length; i++) {
      if (features_to_exclude.includes(feature_abbrs[i]) == false) {
        boxes[i].checked = true;
      }
    }
  } else {
    for (let i=0; i<boxes.length; i++) {
      boxes[i].checked = false;
    }
  }
    
  runModel();
}


function runModel() {
  let boxes = document.getElementsByClassName('checkbox');
  let selected_features = [];
  let feature_str = '';
  let feature_idxs = [];
  
  for (let i=0; i<boxes.length; i++) {
    if (boxes[i].checked == true) {
      selected_features.push(boxes[i].name);
      feature_str += boxes[i].name + ',';
      feature_idxs.push(i);
    } else if (features_to_exclude.includes(feature_abbrs[i]) == false) {
      document.getElementById("checkAll").checked = false;
    }
  }
  
  feature_str = feature_str.slice(0,-1);
  scatterData = [];

  let combo_idx = features.indexOf(feature_str);  
  calculate(combo_idx, feature_idxs);

  if (feature_idxs.length == 0) {
    scatterData = [];
    document.getElementById('mse-container').style.visibility = "hidden";
  } else {
    let curr_mse = Math.round(mse[combo_idx] * 10000) / 10000;
    document.getElementById('mse-container').innerHTML = "<b>Root Mean Square Error</b><br>" + curr_mse.toString();
    document.getElementById('mse-container').style.visibility = "visible";
  }
  
  myChart.destroy();
  plot();
}

function calculate(combo_idx, feature_idxs) {
  let curr_coefs = parseCoeficients(coef[combo_idx]);
  
  for (let i=0; i<data.length; i++) {
    let total = parseFloat(intercepts[combo_idx]);
    for (let j=0; j<feature_idxs.length; j++) {
      total += curr_coefs[j] * data[i][feature_idxs[j]];
    }
    scatterData.push({x:total, y:data[i].slice(-1)});
  }
}


function plot() {
  document.getElementById('loading-container').style.display = 'none';
  
  Chart.defaults.color = '#424242';
  var ctx = document.getElementById('myChart').getContext('2d');
  
  const plugin = {
    id: 'bgColorArea',
    beforeDraw(chart, args, options) {
      const {ctx, chartArea: {left, top, width, height}, scales: {x, y}} = chart;
      ctx.save();
      ctx.fillStyle = '#e9e9e9';
      ctx.fillRect(left, top, width, height);
      ctx.restore();
    }
  };
  myChart = new Chart(ctx, {
    type: 'scatter',
    plugins: [plugin],
    data: {
      datasets: [
        {
          label: 'Correct Prediction',
          data: [{x:35, y:35},{x:85, y:85}],
          backgroundColor: 'transparent',
          borderColor: '#012d9c',
          type: 'line',
          borderDash: [8,8],
          borderWidth: 2,
          pointBorderWidth: 0,
          fill: true,
          tension: 0, 
        },
        {
          label: 'Predicted vs. Actual',
          data: scatterData,
          backgroundColor: '#36b7ff',
          borderColor: 'transparent',
          showLine: false,
        },
      ]
    },
    options: {
      plugins: {
        tooltip: {
          enabled: false,
        }
      },
      animation: {
        duration: 0,
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Predicted Life Expectancy (years)',
            font: {
              size: 15,
            },
          },
          grid: {
            display: false 
          },
        },
        y: {
          title: {
            display: true,
            text: 'Actual Life Expectancy (years)',
            font: {
              size: 15,
            },
          },
          grid: {
            display: false 
          },
        }
      }
    }
  });
}

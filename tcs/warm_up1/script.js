let data = [];
let K = 3;

let colors_to_test = [[227, 148, 182], [224, 131, 49], [245, 149, 100], [232, 174, 210]]
let reserve_colors = [[188, 109, 91], [179, 19, 115], [200, 107, 0], [248, 83, 152]]

// window.addEventListener('load', function() {
//   document.querySelectorAll('.gear-one, .gear-two').forEach(gear => {
//     gear.style.animation = 'none';
//     gear.offsetHeight; /* Trigger a reflow */
//     gear.style.animation = '';
//   });
// });


function readData() {  
  // fetch('reduced_data.txt')
  fetch('data4.txt')
  .then(response => response.text())
  .then((text) => {
    let d = text.split("\n");
    
    for (let i=0; i<d.length; i++) {
      let dd = d[i].split(',');
      data.push([parseInt(dd[0]), parseInt(dd[1]), parseInt(dd[2]), dd[3]])
    }
    
    generate_test_blocks();    
  })
}


function generate_test_blocks() {
  let output = '';
  
  for (let i=0; i<colors_to_test.length; i++) {
    output += '<div class="test-color">'
    output += '<div class="color-block" style="background: rgb(' + colors_to_test[i][0].toString() + ',' + colors_to_test[i][1].toString() + ',' + colors_to_test[i][2].toString() + ')"></div>';
    output += '<span id="label' + i.toString() + '">&nbsp;</span></div>';
  }
  output += '<div id="add_btn_container" class="test-color"><div class="add_btn" title="Add Color" onclick="add_color()">+</div></div>';
  document.getElementById('colors_to_classify').innerHTML = output;
}


function add_color() {
  colors_to_test.push(reserve_colors.pop());
  let curr_html = document.getElementById('colors_to_classify').innerHTML.split('<div id="add_btn_container"')[0];
  
  let i = colors_to_test.length - 1;
  curr_html += '<div class="test-color">'
  curr_html += '<div class="color-block" style="background: rgb(' + colors_to_test[i][0].toString() + ',' + colors_to_test[i][1].toString() + ',' + colors_to_test[i][2].toString() + ')"></div>';
  curr_html += '<span id="label' + i.toString() + '">&nbsp;</span></div>';
  
  if (reserve_colors.length > 0) {
    curr_html += '<div id="add_btn_container" class="test-color"><div class="add_btn" title="Add Color" onclick="add_color()">+</div></div>';
  }
  document.getElementById('colors_to_classify').innerHTML = curr_html;
  

  if (window.innerWidth < 500) {
    let curr_pad = document.getElementById('colors_to_classify').style.paddingLeft;
    if (curr_pad == '') {
      curr_pad = "0";
    }
    curr_pad = (parseInt(curr_pad) + 95).toString() + 'px';
    document.getElementById('colors_to_classify').style.paddingLeft = curr_pad;
  }
}


function calc_distance(pointA, pointB) {
  let a = (pointA[0] - pointB[0]) ** 2;
  let b = (pointA[1] - pointB[1]) ** 2;
  let c = (pointA[2] - pointB[2]) ** 2;
  let d = (a + b + c) ** 0.5;
  return d;
}


function find_nearest_k_neighbors(color) {
  let min_distances = [1000];
  let min_labels = [null];
  
  for (let i=0; i<data.length; i++) {
    let dist = calc_distance(color, data[i]);
    let j = 0
    while (min_distances[j] < dist) {
      j++;
    }
    min_distances.splice(j, 0, dist);
    min_labels.splice(j, 0, data[i][3]);
  }
  
  return min_labels.slice(0,K);
}


function determine_label(color) {
  let labels = find_nearest_k_neighbors(color);
  
  let orange = 0;
  let pink = 0;
  for (let i=0; i<labels.length; i++) {
    if (labels[i] == "Pink") {
      pink++;
    } else if (labels[i] == "Orange") {
      orange++;
    }
  }
  
  if (orange > pink) {
    return '<font color="#e67b1e">Orange</font>';
  } else {
    return '<font color="#de2aae">Pink</font>';
  }
}


let instr2_viewed = false;
let data_viewed = false;

function run_model() {
  document.getElementById('gears1').style.visibility = "visible";
  setTimeout(function () { 
    document.getElementById('gears1').style.visibility = "hidden";
    
    for (let i=0; i<colors_to_test.length; i++) {
      document.getElementById('label' + i.toString()).innerHTML = '<b>' + determine_label(colors_to_test[i]) + '</b>';
    }
    
    if (instr2_viewed == false && document.getElementById('instructions3.5').style.display == "none") {
      document.getElementById('instructions2').style.display = "block";
      instr2_viewed = true;
    } else if (data_viewed == true && document.getElementById('instructions3.5').style.display == "none") {
      document.getElementById('instructions4').style.display = "none";
      document.getElementById('instructions5').style.display = "block";
    }
  }, 700);
}


function view_data() {
  document.getElementById('instructions2').style.display = "none";
  document.getElementById('instructions5').style.display = "none";
  if (data_viewed == false) {
    document.getElementById('instructions3').style.display = "block";
    data_viewed = true;
  }
  document.getElementById('instructions3.5').style.display = "block";
  
  // let output = '';
  let output = ' <div class="innermost-training-container">';
  let num_cols = 4;
  let per_col = Math.floor(data.length/num_cols);
  
  for (let i=0; i<data.length; i++) {
    // if (i % per_col == 0) {
    //   if (i != 0) {
    //     output += '</div>';
    //   }
    //   output += '<div class="training-data-column">';
    // }
    output += '<div class="training-data-sample-container">';
    output += '<div class="color-block" style="background: rgb(' + data[i][0].toString() + ',' + data[i][1].toString() + ',' + data[i][2].toString() + ')"></div>';
    output += '<div class="radio-btn-container">';
    output += '<input type="radio" id="p' + i.toString() + '" name="sample' + i.toString() + '" value="Pink" ';
    if (data[i][3] == "Pink") {
      output += 'checked';
    }
    output += '><label for="p' + i.toString() + '">Pink</label> <br>';
    output += '<input type="radio" id="o' + i.toString() + '" name="sample' + i.toString() + '" value="Orange" ';
    if (data[i][3] == "Orange") {
      output += 'checked';
    }
    output += '><label for="o' + i.toString() + '">Orange</label> <br>';
    output += '</div></div>';
    
    // output += '<br class="add-space">';
  }
  
  output += '</div>';
  // document.getElementById('training_data').innerHTML = output;
  document.getElementById('inner-training-container').innerHTML = output;
}


function retrain_model() {
  document.getElementById('gears2').style.visibility = "visible";
  setTimeout(function () { 
    document.getElementById('gears2').style.visibility = "hidden"; 
    document.getElementById('instructions3').style.display = "none";
    document.getElementById('instructions3.5').style.display = "none";
    document.getElementById('instructions4').style.display = "block";
  }, 1000);

  for (let i=0; i<data.length; i++) {
    let radio_btn_p = document.getElementById('p' + i.toString());
    if (radio_btn_p.checked == true) {
      data[i][3] = "Pink";
    } else {
      data[i][3] = "Orange";
    }
  }
}


//////////////////////////
//  Not part of warmup //
//////////////////////////
function swatch_selection() {
  let output = '';
  for (let i=0; i<data.length; i++) {
    output += '<input class="box_to_pick" type="checkbox" id="' + data[i].toString()  + '"> &nbsp;';
    output += '<div class="swatch_selection" style="background: rgb(' + data[i][0].toString() + ',' + data[i][1].toString() + ',' + data[i][2].toString() + ')"><div style="display:table-cell; vertical-align:middle; min-height: 25px;"> &nbsp;' + data[i].toString() + ' &nbsp;</div> </div> <br>';
  }
  output += '<br><button onclick="record_selected_swatches()">submit</button>';
  document.getElementById('swatch_selection').innerHTML = output;
}
function record_selected_swatches() {
  let checkboxes = document.getElementsByClassName('box_to_pick');
  let colors_to_save = [];
  let print_out = ''
  for (let i=0; i<checkboxes.length; i++) {
    if (checkboxes[i].checked == true) {
      colors_to_save.push(checkboxes[i].id);
      print_out += checkboxes[i].id + '\n';
    }
  }
 console.log(print_out);
}

// Measurements
// box = 50 x 50 px
// spaces = (2 * 4.359375) + (2 * 4.375) = 17.46875
// row = spaces + (5 * 50) = 267.46875 px

var green;
var yellow;
var gray;
var wordsGuessed;
var dict;
var validWords;

var rowCopy;
var currentRow = 'row1';
var winRow;

// var grayColor = ["#55555", "rgb(85, 85, 85)"];
// var grayColor = ["#818384", "rgb(129, 131, 132)"]; 
var grayColor = ["#787c7e", "rgb(120, 124, 126)"];
var darkGrayColor = ["#3a3a3c", "rgb(58, 58, 60)"]; 
var yellowColor = ["#b59f3b", "rgb(181, 159, 59)"]; 
var greenColor = ["#538d4e", "rgb(83, 141, 78)"]; 



/**
 * Event Listener for Window resize 
 * calls alignments()
 */
window.addEventListener('resize', function(event){
  alignments();
});

/**
 * Aligns elements based on window size
 */
function alignments() {
  let e = document.getElementById("entryRows");
  e.style.marginLeft = ((window.innerWidth/2) - (267.46875/2)).toString() + "px";
}


function focusKeyboard() {           
  document.getElementById("myTextField").focus();
}

let alphaKeys = "QWERTYUIOPASDFGHJKLZXCVBNM";
document.addEventListener('keydown', function(event) {
  if (event.key === "Backspace") { deleted(); } 
});
document.onkeypress=function(e){
  if (e.code === "Enter") {
    wordEntered();
  } else if (alphaKeys.includes(e.code.slice(-1))) {
    typed(e.code.slice(-1));
  }
}


/**
 * Called on page load, reads in dictionary from txt
 * clones the existing row-box format for later reuse
 */
function readWords() {  
  fetch('words.txt')
  .then(response => response.text())
  .then((text) => {
    dict = text.split("\n");
  })
  
  rowCopy = document.getElementsByClassName("row")[0].cloneNode(true);
  
  makeNewRow();
  alignments();
  focusKeyboard();
}


function typed(letter) {
  let activeBoxes = document.getElementById(currentRow).getElementsByClassName('box');
  for (let i=0; i<5; i++) {
    if (activeBoxes[i].value.length == 0) {
      activeBoxes[i].value = letter;
      break;
    }
  }
  evaluateBoard();
}



function deleted() {
  let activeBoxes = document.getElementById(currentRow).getElementsByClassName('box');
  for (let i=4; i>=0; i--) {
    if (i == 0 && activeBoxes[i].value.length == 0) {
      if (currentRow != "row1") {        
        document.getElementById(currentRow).remove();
        refocusRow("row" + (document.getElementsByClassName("row").length - 1).toString());
      }
    }
    if (activeBoxes[i].value.length == 1) {
      activeBoxes[i].value = '';
      activeBoxes[i].style.backgroundColor = "";
      break;
    }
  }
  evaluateBoard();
}



function wordEntered() {
  if (!rowComplete(document.getElementById(currentRow))) {
    return;
  }

  // check to see if there's another unfinished row below
  let other_rows = document.getElementsByClassName('row');
  let next_row_id = "";
  for (let i=1; i<other_rows.length; i++) {
    if (!rowComplete(other_rows[i])) {
      next_row_id = other_rows[i].id;
      break;
    }
  }
  
  if (next_row_id == "") {
    makeNewRow();
  } else {
    refocusRow(next_row_id);
  }
  evaluateBoard();
}



function boxClick(elem) {
  if (!elem.parentElement.parentElement.classList.contains("activeRow")) {
    refocusRow(elem.parentElement.parentElement.id);
    return;
  }
  if (elem.value.length != 0) {
    if (elem.style.backgroundColor == "" || grayColor.includes(elem.style.backgroundColor)) {
      elem.classList.add('yellow-jump');
      elem.style.backgroundColor = yellowColor[0];
      elem.classList.remove('box-appear');
    } else if (yellowColor.includes(elem.style.backgroundColor)) {
      elem.classList.add('green-jump');
      elem.style.backgroundColor = greenColor[0];
    } else if (greenColor.includes(elem.style.backgroundColor)) {
      elem.style.backgroundColor = "";
      elem.classList.remove('yellow-jump');
      elem.classList.remove('green-jump');
    }
    evaluateBoard();
  }
}



function wordClicked(word) {
  let all_rows = document.getElementsByClassName('row');
  let last_row = all_rows[all_rows.length-1];
  refocusRow(last_row.id);
  if (rowComplete(last_row)) {
    makeNewRow();
    last_row = document.getElementById(currentRow);
  }
  
  let bxs = last_row.getElementsByClassName('box');
  for (let i=0; i<5; i++) {
    bxs[i].value = word[i];
  }
  evaluateBoard();
}



function evaluateBoard() {
  wordsGuessed = [];
  green = "-----";
  yellow = new Set();
  gray = new Set();
  
  let win_exists = false;
  
  let all_letters = new Set();
  let all_rows = document.getElementsByClassName('row');
  for (let i=1; i<all_rows.length; i++) {
    if (rowComplete(all_rows[i])) { 
      let bxs = all_rows[i].getElementsByClassName('box');
      let word = "";
      let all_green = true;
      for (let j=0; j<5; j++) {
        let bx = bxs[j];
        let ltr = bx.value.toLowerCase();
        all_letters.add(ltr);
        word = word + ltr;
        if (yellowColor.includes(bx.style.backgroundColor)) {
          yellow.add(ltr);
          all_green = false;
        } else if (greenColor.includes(bx.style.backgroundColor)) {
          green = green.substring(0,j) + ltr + green.substring(j+1);    
        } else {
          all_green = false;
        }
      }
      if (all_green) {
        win_exists = true;
        winRow = all_rows[i].id; // used for win() 
      }
      wordsGuessed.push(word);
    }
  }
  
  for (const ltr of all_letters) {
    if (!yellow.has(ltr) && !green.includes(ltr)) {
      gray.add(ltr);
    }
  }
  
  console.log("GREEN: " + green);
  console.log("YELLOW: " + Array.from(yellow).join(', '));
  console.log("GRAY: " + Array.from(gray).join(', '));
  console.log("WORDS: " + wordsGuessed);
  
  if (win_exists) {
    win();
    return;
  } else {
    document.getElementById("win").style.visibility = "hidden";
    document.getElementById("win").style.display = "none";
  }
  wordleHelper();
  displayResult();
}


/**
 * Checks a row element to see if all letter boxes
 * are filled in. Returns true or false.
 */
function rowComplete(row) {
  let bxs = row.getElementsByClassName('box');
  for (let i=0; i<5; i++) {
    if (bxs[i].value.length == 0) {
      return false;
    }
  }
  return true;
}


function makeNewRow() {
  var new_row = rowCopy.cloneNode(true);
  new_row.style.visibility = "visible";
  new_row.style.display = "block";
  
  let other_rows = document.getElementsByClassName('row');
  for (let i=0; i<other_rows.length; i++) {
    other_rows[i].classList.remove('activeRow');
  }
  
  currentRow = "row" + other_rows.length.toString();
  new_row.id = currentRow;
  new_row.classList.add('activeRow');
  document.getElementById("entryRows").append(new_row);
  document.getElementById(currentRow).onclick = function () {refocusRow(currentRow);}
}


/**
 * on row click, refocus (change currentRow)
 */
function refocusRow(row_id) {
  currentRow = row_id;
  let other_rows = document.getElementsByClassName('row');
  for (let i=0; i<other_rows.length; i++) {
    other_rows[i].classList.remove('activeRow');
  }
  
  let curr_row = document.getElementById(currentRow);
  curr_row.classList.add('activeRow');
  
  if (!rowComplete(curr_row)) {
    focusKeyboard();
  }
}



/**
 * Searches word list to find possible solutions based
 * on gray/green/yellow info and previous guesses.
 *
 * Format:
 *  green        = "-un--";
 *  yellowLtrs   = "un";
 *  grayLtrs     = "adiesort";
 *  wordsGuessed = ["adieu", "snort", "aunts"];
 */
function wordleHelper() {
  // Remove green and yellow letters that may appear in gray
  let temp = green + Array.from(yellow).join('');
  for (let i=0; i<temp.length; i++) {
    gray.delete(temp[i]);
  }
  
  var tf;
  var yellowLtrs = Array.from(yellow).join('');
  var grayLtrs = Array.from(gray).join('');
  validWords = [];
  
  // Loop through word pool to find possible guesses
  for (let i=0; i<dict.length; i++) {
    tf = true;
    var w = dict[i];
    
    // Checks if word contains 'gray' characters
    for (let y=0; y<grayLtrs.length; y++) {
      if (w.includes(grayLtrs[y])) {
        tf = false;
      }
    }
    
    // Checks word for 'yellow' letters, must not be in the same position as previous guesses
    for (let y=0; y<yellowLtrs.length; y++) {
      if (!w.includes(yellowLtrs[y])) {
        tf = false;
      }
      
      for (let z=0; z<wordsGuessed.length; z++) {
        for (let j=0; j<5; j++) {
          if (yellowLtrs[y] == wordsGuessed[z][j] && wordsGuessed[z][j] == w[j] && green[j] != yellowLtrs[y]) {
            tf = false;
          }
        }
      }
    }
    
    // Previously found 'green' letters must be in the same position
    for (let y=0; y<5; y++) {
      if (green[y] != '-' && green[y] != w[y]) {
        tf = false;
      }
    }
    
    // Checks for previous incorrect guesses
    if (wordsGuessed.includes(w)) {
      tf = false;
    }
    
    if (tf === true) {
      validWords.push(w);
      // console.log(w);
    }
  }
}


/**
 * Displays all valid guesses found by wordleHelper() where
 * each word is formatted to be clickable for next guess
 */
function displayResult() {
  let out = document.getElementById("outputSpace");
  out.style.visibility = "visible";
  out.style.display = "block";
  
  var outputStr = '<p class="output"><b><u>' + validWords.length + ' words found</u></b></p>';
  for (let i=0; i<validWords.length; i++) {
    outputStr += '<a onclick="wordClicked(' + "'" + validWords[i] + "'" + '.toUpperCase())" class="output"> ';
    outputStr += validWords[i] + ' </a><br>';
  }
  
  // if the Wordle Helper found 0 words
  if (validWords.length == 0) {
    outputStr += '<a href="." id="reset" class="output">Reset</a>';
  }
  
  document.getElementById("txtArea").innerHTML = outputStr;
}


/**
 * Called upon game win / completion
 * animates celebratory confetti
 */
function win() {
  document.getElementById("outputSpace").style.visibility = 'hidden';
  document.getElementById("outputSpace").style.diplay = 'none';
  document.getElementById("win").style.visibility = "visible";
  document.getElementById("win").style.display = "block";
  
  let win_bxs = document.getElementById(winRow).getElementsByClassName("box");
  for (let i=0; i<win_bxs.length; i++) {
    win_bxs[i].classList.remove("yellow-jump");
    win_bxs[i].classList.remove("green-jump");
    win_bxs[i].classList.add("box-win");
  }
  
  function random(max){
    return Math.random() * (max - 0) + 0;
  }

  var c = document.createDocumentFragment();
  for (var i=0; i<100; i++) {
    
    var styles = 'transform: translate3d(' + (random(window.innerWidth) - (window.innerWidth/2)) + 'px, ' + (random(Math.floor(window.innerHeight * 1.4)) - 300) + 'px, 0) rotate(' + random(360) + 'deg);\
                  background: hsla('+random(360)+',100%,50%,1);\
                  animation: bang 900ms ease-out forwards;\
                  opacity: 0';
      
    var e = document.createElement("i");
    e.style.cssText = styles.toString();
    c.appendChild(e);
  }
  
  document.body.appendChild(c);
}


/**
 * Event Listener to replay winning animation
 */
var replay = document.getElementById("congrats");
replay.addEventListener("click", function(e) {
  e.preventDefault;
  
  replay.classList.remove("pop");

  void replay.offsetWidth;
  
  replay.classList.add("pop");
  
  let win_bxs = document.getElementById(winRow).getElementsByClassName("box");
  for (let i=0; i<win_bxs.length; i++) {
    win_bxs[i].classList.remove("box-win");
    void win_bxs[i].offsetWidth;
  }
  
  win();
}, false);
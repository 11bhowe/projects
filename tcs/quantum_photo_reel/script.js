const imageUploader = document.getElementById('imageUploader');    // Select Images
const imageUploader2 = document.getElementById('imageUploader2');  // Add Images
const convertBtn = document.getElementById('convertBtn');          // Preview Video
const downloadLink = document.getElementById('downloadLink');
const imageList = document.getElementById('imageList');
const durationInput = document.getElementById('durationInput');
const repeatInput = document.getElementById('repeatInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileNameInput = document.getElementById('file-name-input');

downloadLink.download = fileNameInput.placeholder; // Set file name to the placeholder default

if (window.innerWidth < 535) {
  document.getElementById('header').innerText = "Quantum Shadow Photo Reel";
}

let images = []; // Array of image files

imageUploader.addEventListener('change', (event) => {
  const files = event.target.files;
  images = []; // reset
  for (const file of files) {
    images.push(file);
  }
  updateImageList();
  convertBtn.disabled = images.length === 0;

  document.getElementById('uploadLabel1').style.display = 'none';
  document.getElementById('uploadLabel2').style.display = 'inline-block';
  document.getElementById('durationField').style.display = 'block';
  document.getElementById('preview-div').style.display = 'block';
  RenumberList();
  
  imageUploader.value = '';
});

imageUploader2.addEventListener('change', (event) => {
  const files = event.target.files;

  for (const file of files) {
    images.push(file);
  }
  updateImageList();
  convertBtn.disabled = images.length === 0;

  RenumberList();
  
  imageUploader2.value = '';
});

durationInput.addEventListener('change', () => {
  if (durationInput.value == 0) {
    durationInput.value = 0.1;
  }
  RenumberList();
});

repeatInput.addEventListener('change', () => {
  repeatInput.value = parseInt(repeatInput.value);
  if (repeatInput.value > 20) {
    repeatInput.value = 20;
  }
  RenumberList();
});


function updateImageList() {
  imageList.innerHTML = '';
  images.forEach((file, index) => {
    
    // Create new draggable image item
    const listItem = document.createElement('div');
    listItem.classList.add('image-item');
    listItem.draggable = true;

    const itemNum = document.createElement('span');
    itemNum.textContent = index + 1;
    itemNum.classList.add('itemNumber');

    const imgPreview = document.createElement('img');
    imgPreview.src = URL.createObjectURL(file);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = file.name;
    nameSpan.classList.add('draggableFileName');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<svg height="12px" width="12px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-9.22 -9.22 479.21 479.21" xml:space="preserve" stroke-width="9.676275"><g stroke-width="9.676275"></g><g stroke-linecap="round" stroke-linejoin="round"></g><g> <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55 c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55 c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505 c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55 l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719 c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"></path> </g></svg>';
    deleteBtn.classList.add('deleteBtn');
    deleteBtn.setAttribute( "onClick", 'DeleteImage("'+file.name+'");' );

    listItem.appendChild(itemNum);
    listItem.appendChild(imgPreview);
    listItem.appendChild(nameSpan);
    listItem.appendChild(deleteBtn);
    
    
    // Desktop dragging functionality
    listItem.addEventListener('dragstart', () => {
      listItem.classList.add('dragging');
    });

    listItem.addEventListener('dragend', () => {
      listItem.classList.remove('dragging');
      updateImageOrder();
    });
    
    listItem.addEventListener('dragover', (event) => {
      event.preventDefault();
      const dragging = document.querySelector('.dragging');
      const siblings = [...imageList.querySelectorAll('.image-item')];

      const nextSibling = siblings.find((sibling) => {
        if (sibling === dragging) return false;
        const siblingRect = sibling.getBoundingClientRect();
        return event.clientY < siblingRect.top + siblingRect.height / 2;
      });

      imageList.insertBefore(dragging, nextSibling);
    });

    
    // Mobile dragging functionality
    listItem.addEventListener('touchstart', (event) => {
      listItem.classList.add('dragging');
      listItem.dataset.startY = event.touches[0].clientY;
    });
    
    listItem.addEventListener('touchmove', (event) => {
      event.preventDefault(); // Prevent screen scrolling during drag
      const touchY = event.touches[0].clientY;
      const dragging = document.querySelector('.dragging');
      const siblings = [...imageList.querySelectorAll('.image-item')];

      const nextSibling = siblings.find((sibling) => {
        if (sibling === dragging) return false;
        const siblingRect = sibling.getBoundingClientRect();
        return touchY < siblingRect.top + siblingRect.height / 2;
      });

      imageList.insertBefore(dragging, nextSibling);
    });

    listItem.addEventListener('touchend', () => {
      listItem.classList.remove('dragging');
      updateImageOrder();
    });

    
    // Add image item to image list
    imageList.appendChild(listItem);
  });
}


// Update the order of the image saved files based on the 
// reordering or deletion of draggable image items
function updateImageOrder() {
  const items = [...imageList.querySelectorAll('.image-item')];
  images = items.map(item => {
    const index = Array.from(imageList.children).indexOf(item);
    console.log(item);
    // let n = item.querySelectorAll('span')[0].innerText;
    let n = item.getElementsByClassName('draggableFileName')[0].innerText;
    for (let i=0; i<images.length; i++) {
      if (images[i].name == n) {
        return images[i];
      }
    }
  });

  RenumberList();
}

function DeleteImage(file_name) {
  let items = document.getElementsByClassName('image-item');
  for (let i=0; i<items.length; i++) {
    if (items[i].getElementsByClassName('draggableFileName')[0].innerText == file_name) {
      items[i].remove();
      updateImageOrder();
      RenumberList();
      return;
    }
  }
}

// Re-number the list items on screen after deletion, addition, or drag
function RenumberList() {
  let items = document.getElementsByClassName('image-item');
  for (let i=0; i<items.length; i++) {
    items[i].getElementsByClassName('itemNumber')[0].innerText = i+1;
  }

  if (items.length == 0) {
    document.getElementById('uploadLabel1').style.display = 'inline-block';
    document.getElementById('uploadLabel2').style.display = 'none';
    document.getElementById('durationField').style.display = 'none';
    document.getElementById('preview-div').style.display = 'none';
    document.getElementById('canvas').style.display = 'none';
  }

  // document.getElementById('downloadLink').style.display = 'none';
  document.getElementById('downloadLink').style.visibility = 'hidden';
  document.getElementById('file-name-div').style.visibility = 'hidden';
}


// "Preview Video" event listener initiates the recording of the video
convertBtn.addEventListener('click', async () => {
  if (images.length === 0) return;

  const duration = parseFloat(durationInput.value) || 0.5;
  const repeats = parseInt(repeatInput.value) || 3;
  convertBtn.disabled = true;
  // downloadLink.style.display = 'none';
  downloadLink.style.visibility = 'hidden';
  document.getElementById('file-name-div').style.visibility = 'hidden';

  document.getElementById("canvas").style.display = "block";

  const firstImage = await loadImage(images[0]);
  canvas.width = firstImage.width;
  canvas.height = firstImage.height;

  // Setup MediaRecorder
  const stream = canvas.captureStream(30); // 30 FPS
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' });
  const recordedChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  
  mediaRecorder.ondataavailable = (event) => {
    const mp4Blob = new Blob([event.data], { type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' });
    const url = URL.createObjectURL(mp4Blob);
  
    downloadLink.href = url;
    downloadLink.style.visibility = 'visible';
    document.getElementById('file-name-div').style.visibility = 'visible';
    convertBtn.disabled = false;
  };

  mediaRecorder.start();

  // Render images to canvas sequentially  
  for (let j=0; j<repeats; j++) {
    for (let i = 0; i < images.length; i++) {
      const img = await loadImage(images[i]);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      await delay(duration * 1000); 

      // Show first and final images for twice a long because of a recorder issue
      if ((i == 0 && j == 0) || (i == images.length-1 && j == repeats-1)) {
        const img = await loadImage(images[i]);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await delay(duration * 1000);
      }
    }
  }

  mediaRecorder.stop();

});

function loadImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// Title the video file to be downloaded based on user input
fileNameInput.addEventListener('change', () => {
  let new_name = fileNameInput.value;
  if (isValid(new_name) && new_name.split('.')[0].trim() != '') {
    downloadLink.download = new_name.split('.')[0].trim() + '.mp4';
  }
})

var isValid=(function(){
  var rg1=/^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
  var rg2=/^\./; // cannot start with dot (.)
  var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
  return function isValid(fname){
    return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
  }
})();

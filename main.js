import './style.css';

var canvas, pen, noteRadius, radiusArray, offsetsArray, baseSpeed, noLoops, scatterLevel, tunesArray, prevNoteY, noCircles, upperLimit, highlights;

function initParams() {
  canvas = document.getElementById('canvas');
  pen = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  //define params
  noCircles = 14;
  upperLimit = Math.min(canvas.width, canvas.height) / 2;
  noteRadius = Math.min(12, canvas.width / 100);

  //create array of equally spaced radius
  radiusArray = new Array(noCircles)
    .fill(0)
    .map((_, index) => index * upperLimit / noCircles)
    .filter(radius => radius > upperLimit / noCircles);

  noCircles = radiusArray.length;

  offsetsArray = new Array(noCircles).fill(0.5);
  prevNoteY = new Array(noCircles).fill(canvas.height / 2);

  tunesArray = new Array(noCircles).fill('').map((_, index) => { return new Audio(`${import.meta.env.BASE_URL}/tune${index}.wav`) });
  // tunesArray = new Array(noCircles).fill('').map((_, index) => { return new Audio(`tune${index}.wav`) });
  highlights = new Array(noCircles).fill(0);
  baseSpeed = 0.1;
  noLoops = 50;
  scatterLevel = 1 / 1000;
}

initParams();

var doit;
window.onresize = function () {
  clearTimeout(doit);
  doit = setTimeout(initParams, 100);
};

function drawNotes() {
  pen.clearRect(0, 0, canvas.width, canvas.height);

  // draw the horizontal line
  pen.beginPath();
  pen.strokeStyle = 'black';
  pen.moveTo(0, canvas.height / 2);
  pen.lineTo(canvas.width, canvas.height / 2);
  pen.stroke();

  //draw orbits
  radiusArray.forEach((radius) => {
    pen.beginPath();
    pen.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
    pen.stroke();
  });

  //iterate throught each orbit
  radiusArray.forEach((radius, index) => {
    const angle = Math.PI * offsetsArray[index];
    const noteX = canvas.width / 2 + radius * Math.sin(angle);
    const noteY = canvas.height / 2 + radius * Math.cos(angle);
    const noteGradient = pen.createRadialGradient(noteX, noteY, 1, noteX, noteY, noteRadius);
    noteGradient.addColorStop(0, `hsl(300, 100%, ${50 + highlights[index] * 50}%)`);
    noteGradient.addColorStop(1, `hsl(300, 100%, ${25 + highlights[index] * 75}%)`);

    //if note is on the horizontal line
    if (interpolate(prevNoteY[index]) * interpolate(noteY) <= 0) {
      //play sound
      const tune = tunesArray[index];
      tune.volume = 0.3;
      tune.play()
        .catch((error) => console.error(error));

      highlights[index] = 1;
    }

    //draw the note
    pen.beginPath();
    pen.arc(noteX, noteY, noteRadius, 0, 2 * Math.PI);
    pen.fillStyle = noteGradient;
    pen.fill();
    pen.strokeStyle = `hsl(300, 100%, ${25 + highlights[index] * 75}%)`;
    pen.stroke();
    //minus speed so it goes clockwise
    offsetsArray[index] -= (baseSpeed + index * scatterLevel) / noLoops;
    prevNoteY[index] = noteY;
    if (highlights[index] > 0) highlights[index] -= 0.01;
  });

  requestAnimationFrame(drawNotes);
}

/**
 * Maps a point on the screen height line to a value between -1 and 1
 *
 * @param {number} x - The value to be interpolated.
 * @return {number} The interpolated value.
 */
function interpolate(x) {
  return (x - canvas.height / 2) / (canvas.height / 2);
}

// Get the button element
const button = document.getElementById('start');
const initAnimation = () => {
  drawNotes();

  //play ambient background music
  const backgroundTune = new Audio(`${import.meta.env.BASE_URL}/background.wav`);
  // const backgroundTune = new Audio(`background.wav`);
  backgroundTune.volume = 0.1;
  backgroundTune.loop = true;
  backgroundTune.play()
    .catch((error) => console.error(error));
  setTimeout(() => {
    const backgroundTune2 = new Audio(`${import.meta.env.BASE_URL}/background.wav`);
    // const backgroundTune2 = new Audio(`background.wav`);
    backgroundTune2.volume = 0.1;
    backgroundTune2.loop = true;
    backgroundTune2.play()
      .catch((error) => console.error(error));
  }, 1500);
}

// Add an event listener
button.addEventListener('click', initAnimation);


document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
   
let isDrawing = false;
let isEraser = false;
let isFillMode = false;
let isDrawingShape = false;
let selectedShape = null;
let brushSize = 10;
let brushColor = '#000000';
let opacity = 1;
let startX, startY;

function selectShape(shape) {
  isDrawingShape = true;
  selectedShape = shape;
}

document.getElementById('shapeCircleButton').addEventListener('click', () => selectShape('circle'));
document.getElementById('shapeSquareButton').addEventListener('click', () => selectShape('square'));
document.getElementById('shapeRectangleButton').addEventListener('click', () => selectShape('rectangle'));
document.getElementById('shapeTriangleButton').addEventListener('click', () => selectShape('triangle'));


function startDrawing(e) {
  if (isDrawingShape) {
    startX = e.clientX;
    startY = e.clientY;
    return;
  }

  isDrawing = true;
  ctx.beginPath();
  draw(e.clientX, e.clientY);
}

function stopDrawing() {
  if (isDrawingShape) {
    isDrawingShape = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(startX, startY);
    return;
  }

  isDrawing = false;
}

function draw(x, y) {
  if (isFillMode) {
    fillCanvas(x, y);
    return;
  }

  if (isDrawingShape) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    switch (selectedShape) {
      case 'circle':
        drawCircle(x, y);
        break;
      case 'square':
        drawSquare(x, y);
        break;
      case 'rectangle':
        drawRectangle(x, y);
        break;
      case 'triangle':
        drawTriangle(x, y);
        break;
      default:
        break;
    }
    return;
  }

  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'white';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = brushColor;
  }

  ctx.lineTo(x, y);
  ctx.lineWidth = brushSize;
  ctx.globalAlpha = opacity;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function fillCanvas(x, y) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelStack = [[x, y]];
  const fillColor = hexToRgb(brushColor);

  const targetColor = getPixelColor(imageData, x, y);
  if (colorsMatch(targetColor, fillColor)) return;

  while (pixelStack.length) {
    const newPos = pixelStack.pop();
    const [nx, ny] = newPos;

    const currentColor = getPixelColor(imageData, nx, ny);
    if (colorsMatch(currentColor, targetColor)) {
      setPixelColor(imageData, nx, ny, fillColor);

      pixelStack.push([nx + 1, ny]);
      pixelStack.push([nx - 1, ny]);
      pixelStack.push([nx, ny + 1]);
      pixelStack.push([nx, ny - 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

function drawSquare(x, y) {
  const size = Math.max(Math.abs(x - startX), Math.abs(y - startY));
  ctx.beginPath();
  ctx.rect(startX, startY, size, size);
  ctx.stroke();
}

function drawRectangle(x, y) {
  const width = Math.abs(x - startX);
  const height = Math.abs(y - startY);
  ctx.beginPath();
  ctx.rect(startX, startY, width, height);
  ctx.stroke();
}

function drawTriangle(x, y) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX, y);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();
}

function getPixelColor(imageData, x, y) {
  const offset = (y * imageData.width + x) * 4;
  return [
    imageData.data[offset],
    imageData.data[offset + 1],
    imageData.data[offset + 2],
    imageData.data[offset + 3]
  ];
}

function setPixelColor(imageData, x, y, color) {
  const offset = (y * imageData.width + x) * 4;
  imageData.data[offset] = color[0];
  imageData.data[offset + 1] = color[1];
  imageData.data[offset + 2] = color[2];
  imageData.data[offset + 3] = color[3];
}

function colorsMatch(color1, color2) {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  );
}

function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255
      ]
    : null;
}

function selectTool() {
  const toolSelect = document.getElementById('toolSelect');
  const selectedTool = toolSelect.options[toolSelect.selectedIndex].value;

  isEraser = selectedTool === 'eraser';
  isFillMode = selectedTool === 'fill';
}

function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === 'admin' && password === 'password') {
    document.getElementById('startButton').disabled = false;
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('username').disabled = true;
    document.getElementById('password').disabled = true;
    document.getElementById('loginButton').disabled = true;
    document.getElementById('registerLoginButton').disabled = true;
  } else {
    alert('Invalid username or password. Please try again.');
  }
}

function redirectToRegister() {
  window.location.href = 'register-login.html';
}

canvas.addEventListener('mousedown', (e) => {
  startDrawing(e);
});

canvas.addEventListener('mouseup', () => {
  stopDrawing();
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    draw(e.clientX, e.clientY);
  }
});

document.getElementById('clearButton').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('saveButton').addEventListener('click', () => {
  const dataURL = canvas.toDataURL();
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'drawing.png';
  link.click();
});

document.getElementById('brushSize').addEventListener('input', (e) => {
  brushSize = e.target.value;
});

document.getElementById('brushColor').addEventListener('input', (e) => {
  brushColor = e.target.value;
});

document.getElementById('opacity').addEventListener('input', (e) => {
  opacity = e.target.value;
});

document.getElementById('toolSelect').addEventListener('change', selectTool);

document.getElementById('startButton').addEventListener('click', () => {
  const homeScreen = document.getElementById('homeScreen');
  const controls = document.getElementById('controls');

  homeScreen.style.display = 'none';
  controls.style.display = 'flex';
  canvas.style.display = 'block';

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.getElementById('loginButton').addEventListener('click', handleLogin);
document.getElementById('registerLoginButton').addEventListener('click', redirectToRegister);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
});
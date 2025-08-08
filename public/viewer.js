const socket = io();
let lines = [];
let currentLine = 0;

const textContainer = document.getElementById('text');

function renderLines() {
  textContainer.innerHTML = '';
  lines.forEach((line, idx) => {
    const span = document.createElement('span');
    span.textContent = line;
    span.id = `line-${idx}`;
    span.className = 'line';
    textContainer.appendChild(span);
  });
}

function updateHighlight(index) {
  const prev = document.querySelector('.highlight');
  if (prev) prev.classList.remove('highlight');
  const el = document.getElementById(`line-${index}`);
  if (el) {
    el.classList.add('highlight');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  currentLine = index;
}

socket.on('loadText', data => {
  lines = data;
  renderLines();
});

socket.on('highlight', updateHighlight);

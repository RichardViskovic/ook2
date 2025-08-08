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

document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  const file = document.getElementById('file').files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  await fetch('/upload', { method: 'POST', body: formData });
});

document.addEventListener('keydown', e => {
  if (!lines.length) return;
  if (e.key === 'ArrowDown' && currentLine < lines.length - 1) {
    socket.emit('highlight', currentLine + 1);
  } else if (e.key === 'ArrowUp' && currentLine > 0) {
    socket.emit('highlight', currentLine - 1);
  }
});

let lines = [];
let currentLine = 0;

const textContainer = document.getElementById('text');
const evtSource = new EventSource('/events');

evtSource.addEventListener('loadText', e => {
  lines = JSON.parse(e.data);
  renderLines();
});

evtSource.addEventListener('highlight', e => {
  updateHighlight(Number(e.data));
});

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

document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  const file = document.getElementById('file').files[0];
  if (!file) return;
  const text = await file.text();
  await fetch('/upload', { method: 'POST', body: text });
});

document.addEventListener('keydown', e => {
  if (!lines.length) return;
  if (e.key === 'ArrowDown' && currentLine < lines.length - 1) {
    fetch('/highlight', { method: 'POST', body: String(currentLine + 1) });
  } else if (e.key === 'ArrowUp' && currentLine > 0) {
    fetch('/highlight', { method: 'POST', body: String(currentLine - 1) });
  }
});

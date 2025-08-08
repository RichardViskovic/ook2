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

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const upload = multer();
let lines = [];
let currentLine = 0;

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
  const text = req.file.buffer.toString('utf-8');
  lines = text.split(/\r?\n/);
  currentLine = 0;
  io.emit('loadText', lines);
  io.emit('highlight', currentLine);
  res.sendStatus(200);
});

io.on('connection', socket => {
  socket.emit('loadText', lines);
  socket.emit('highlight', currentLine);

  socket.on('highlight', index => {
    currentLine = index;
    io.emit('highlight', currentLine);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const videosDir = path.join(__dirname, 'girl-video');
const userVideosDir = path.join(__dirname, 'user-video');

// Hàm tạo tên tệp ngẫu nhiên với độ dài 5 ký tự
const generateRandomFileName = () => {
  return Math.random().toString(36).substring(2, 7); // Tạo tên tệp ngẫu nhiên
};

// Kiểm tra loại tệp
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'audio/mp3', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Cho phép tệp
  } else {
    cb(new Error('Loại tệp không được phép!'), false); // Từ chối tệp
  }
};

// Cấu hình multer để lưu video
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userVideosDir);
  },
  filename: (req, file, cb) => {
    const randomFileName = generateRandomFileName() + path.extname(file.originalname); // Tạo tên ngẫu nhiên với phần mở rộng
    cb(null, randomFileName); // Lưu tệp với tên ngẫu nhiên
  },
});

const upload = multer({ storage, fileFilter }); // Thêm fileFilter vào multer

const stickerDir = path.join(__dirname, 'sticker'); // Thêm thư mục sticker

app.get('/', (req, res) => {
  fs.readdir(stickerDir, (err, files) => {
    if (err) return res.status(500).send('Error reading sticker directory');

    const stickerFiles = files.filter(file => /\.(png|jpg|jpeg|gif)$/.test(file));
    if (stickerFiles.length === 0) return res.status(404).send('No stickers found');

    const randomSticker = stickerFiles[Math.floor(Math.random() * stickerFiles.length)];
    const stickerUrl = `${req.protocol}://${req.get('host')}/sticker/${randomSticker}`;

    res.send(`
      <html>
        <head>
          <style>
            body {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #282c34;
              color: white;
              font-family: Arial, sans-serif;
              margin: 0;
            }
            h1 {
              font-size: 48px;
              color: #4CAF50;
              animation: jump 0.5s infinite alternate;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
            }
            @keyframes jump {
              0% { transform: translateY(0); }
              100% { transform: translateY(-20px); }
            }
            img {
              width: 150px;
              margin-top: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            }
            .container {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Project by HMHung</h1>
            <img src="${stickerUrl}" alt="Sticker">
          </div>
        </body>
      </html>
    `);
  });
});

// Endpoint để phục vụ sticker
app.get('/sticker/:filename', (req, res) => {
  const options = {
    root: stickerDir,
  };
  res.sendFile(req.params.filename, options);
});

app.get('/vdgai', (req, res) => {
  fs.readdir(videosDir, (err, files) => {
    if (err) return res.status(500).send('Error reading directory');

    const videoFiles = files.filter(file => /\.(mp4|mov|avi)$/.test(file)); 
    if (videoFiles.length === 0) return res.status(404).send('No videos found');

    const randomFile = videoFiles[Math.floor(Math.random() * videoFiles.length)];
    const url = `${req.protocol}://${req.get('host')}/girl/${randomFile}`;

    res.json({ url });
  });
});

app.get('/girl/:filename', (req, res) => {
  const options = {
    root: videosDir,
  };
  res.sendFile(req.params.filename, options);
});

// Endpoint POST để tải video lên
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const url = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
  res.json({ message: 'File uploaded successfully', url });
});

app.get('/files/', (req, res) => {
  fs.readdir(userVideosDir, (err, files) => {
    if (err) return res.status(500).send('Error reading directory');

    const videoFiles = files.filter(file => /\.(mp4|mov|avi)$/.test(file));
    if (videoFiles.length === 0) return res.status(404).send('No user videos found');

    const urls = videoFiles.map(file => `${req.protocol}://${req.get('host')}/files/${file}`);
    res.json({ files: urls });
  });
});

app.get('/files/:filename', (req, res) => {
  const options = {
    root: userVideosDir,
  };
  res.sendFile(req.params.filename, options);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

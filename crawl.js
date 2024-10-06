const axios = require('axios');
const fs = require('fs');
const path = require('path');

const videoUrls = require("./vdgai.json")

const generateRandomFileName = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + '.mp4';
};

const downloadVideo = async (url) => {
  const response = await axios.get(url, { responseType: 'stream' });
  const fileName = generateRandomFileName(5); // Tên tệp ngẫu nhiên dài 5 ký tự
  const filePath = path.join(__dirname, 'girl-video', fileName);
  response.data.pipe(fs.createWriteStream(filePath));

  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      console.log(`Downloaded: ${fileName}`);
      resolve();
    });
    response.data.on('error', reject);
  });
};

const downloadAllVideos = async () => {
  if (!fs.existsSync('girl-video')) {
    fs.mkdirSync('girl-video');
  }

  for (const url of videoUrls) {
    await downloadVideo(url);
  }
  console.log('All videos downloaded!');
};

downloadAllVideos();

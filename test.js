const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data'); // Thêm dòng này để import FormData

const uploadVideoToApi = async (videoUrl) => {
  const fileName = path.basename(videoUrl);
  const localPath = path.join(__dirname, fileName);

  try {
    // Tải video từ URL
    const response = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream',
    });

    // Lưu video tạm thời vào local
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    writer.on('finish', async () => {
      // Gửi video lên API
      const form = new FormData();
      form.append('video', fs.createReadStream(localPath));

      try {
        const uploadResponse = await axios.post('http://localhost:3000/upload', form, {
          headers: {
            ...form.getHeaders(), // Sử dụng form.getHeaders() đúng cách
          },
        });
        console.log(`Tải lên thành công: ${uploadResponse.data.url}`);
      } catch (uploadError) {
        console.error('Lỗi trong quá trình tải lên:', uploadError);
      }
    });

    writer.on('error', (error) => {
      console.error('Lỗi khi lưu tệp:', error);
    });

  } catch (error) {
    console.error('Lỗi trong quá trình tải video:', error);
  }
};

// Sử dụng hàm với URL video
const videoUrl = 'https://i.imgur.com/YT4fiIv.mp4'; // Thay đổi URL theo ý muốn
uploadVideoToApi(videoUrl);

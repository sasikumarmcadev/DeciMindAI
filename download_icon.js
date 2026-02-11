const fs = require('fs');
const https = require('https');

const fileUrl = 'https://res.cloudinary.com/dhw6yweku/image/upload/v1758440741/Gemini_Generated_Image_27zxt327zxt327zx-removebg-preview_evmvx3.png';
const filePath = 'src/app/icon.png';

const file = fs.createWriteStream(filePath);

https.get(fileUrl, (response) => {
    response.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log('Download Completed');
    });
}).on('error', (err) => {
    fs.unlink(filePath, () => { }); // Delete the file async. (But we don't check the result)
    console.error('Error downloading file:', err.message);
});

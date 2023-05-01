const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const config = require('./config.json');
const shortid = require('shortid');

const app = express();
app.use(cors());
app.use(express.static('public'));

const privateKey = fs.readFileSync(config.ssl.key, 'utf8');
const certificate = fs.readFileSync(config.ssl.cert, 'utf8');
const ca = fs.readFileSync(config.ssl.ca, 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

const httpsServer = https.createServer(credentials, app);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${shortid.generate()}.${fileExtension}`);
  },
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image Compression App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
        }
        form {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        input[type="file"] {
          margin-top: 20px;
        }
        button {
          background-color: #4CAF50;
          color: white;
          font-size: 1em;
          padding: 10px 20px;
          margin-top: 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <h1>Upload an Image</h1>
        <input type="file" name="image" required />
        <br>
        <button type="submit">Upload</button>
      </form>
    </body>
    </html>
  `);
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const compressedImagePath = `compressed/${req.file.filename}`;

    await sharp(req.file.path)
      .resize({ width: 800, height: 600, fit: 'inside' })
      .toFile(compressedImagePath);

    fs.unlinkSync(req.file.path);

    setTimeout(() => {
      fs.unlink(compressedImagePath, (err) => {
        if (err) {
          console.error(`Error deleting image ${req.file.filename}:`, err);
        } else {
          console.log(`Image ${req.file.filename} deleted after 10 minutes.`);
        }
      });
    }, 600000); // 10 minutes in milliseconds

    const imageUrl = `${req.protocol}://${req.get('host')}/image/${req.file.filename}`;
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upload Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
          }
          .message {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          a {
            color: #4CAF50;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>Upload Successful</h1>
          <p>Your image has been uploaded and compressed successfully.</p>
          <p><a href="${imageUrl}" target="_blank">View your compressed image</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process the image.' });
  }
});


app.get('/image/:link_id', (req, res) => {
  const filePath = `compressed/${req.params.link_id}`;

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { root: __dirname });
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Not Found</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
          }
          .message {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>Image Not Found</h1>
          <p>The image you are looking for does not exist or has expired.</p>
        </div>
      </body>
      </html>
    `);
  }
});

httpsServer.listen(config.port, () => {
  console.log(`Server running on https://localhost:${config.port}`);
});

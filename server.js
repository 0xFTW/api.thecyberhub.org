const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const path = require('path')
const port = process.env.PORT || 5000
const cors = require('cors');

connectDB()

const app = express()

const allowedOrigins = [
    'https://thecyberhub.org',
    'https://beta.thecyberhub.org',
    'https://dev.thecyberhub.org',
    'http://localhost:3000',
];
app.use(cors({origin: allowedOrigins}));

const AWS = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({storage});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    AWS.config.update({
        endpoint: process.env.SPACES_ENDPOINT,
        region: "nyc3",
        credentials: {
            accessKeyId: process.env.SPACES_KEY,
            secretAccessKey: process.env.SPACES_SECRET,
        },
    });
    const s3Client = new AWS.S3({});

    const fileName = req.body.key;
    const file = fs.createReadStream(req.file.path);

    s3Client.putObject({
        Bucket: 'thecyberhub',
        Key: fileName,
        Body: file,
        ACL: "public-read"
    }, (err, data) => {
        if (err) {
            res.sendStatus(500)
            console.error(err)
        } else {
            res.sendStatus(201)
            console.log(`File uploaded successfully`);
        }
    });
});

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/userDetails', require('./routes/userDetailRoutes'))
app.use('/api/blogs', require('./routes/blogRoutes'))
app.use('/api/goals', require('./routes/goalRoutes'))

// Serve Frontend
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => res.send(`
    <html>
      <head>
        <style>
          .api-server-message {display: flex;justify-content: center;align-items: center; font-size: 24px; font-family: "Montserrat", sans-serif;}
          a {color: #5ac8fa;text-decoration: none;text-underline: #0e0e0e;}
        </style>
      </head>
      <body>
        <div class="api-server-message">API Server. Please visit &nbsp;<a href="https://thecyberhub.org"> https://thecyberhub.org </a></div>
      </body>
    </html>
  `))
} else {
    app.get('/', (req, res) => res.send('Please set to production'))
}

app.use(errorHandler)

app.listen(port, () => console.log(`Server started on port ${port}`))

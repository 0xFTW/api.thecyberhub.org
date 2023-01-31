const express = require('express');
const router = express.Router();
const multer = require('multer');

const AWS = require("aws-sdk");
const fs = require("fs");

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({storage});

router.post('/', upload.single('file'), async (req, res) => {
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

    const Data = {
        Bucket: 'thecyberhub',
        Key: fileName,
        Body: file,
        ACL: "public-read"
    }

    s3Client.putObject(Data, (err, data) => {
        if (err) {
            res.sendStatus(500)
            console.error(err)
        } else {
            res.sendStatus(201)
            console.log(`File uploaded successfully: `.green.bold +`${Data.Key}`.green.underline.bold);
        }
    });

});

module.exports = router;
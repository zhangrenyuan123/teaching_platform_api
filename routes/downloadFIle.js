const express = require('express');
const router = express.Router();
const fs = require('fs');

router.post('/', (req, res) => {
    let { fileUrl } = req.body;
    // res.download(`uploads/${fileUrl}`);
    fs.createReadStream(`uploads/${fileUrl}`).pipe(res);
});

router.get('/', (req, res) => {
    let videoUrl = req.query.videoUrl;
    fs.createReadStream(`uploads/${videoUrl}`).pipe(res);
});

module.exports = router;
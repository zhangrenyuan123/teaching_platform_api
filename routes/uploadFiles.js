const express = require('express');
const router = express.Router();
const multer = require('multer');
// const fs = require('fs');
// const path = require('path');

//配置文件上传后文件存储的位置以及文件名
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let upload = multer({
    storage
});

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.json({
            meta: {
                message: '文件上传失败',
                status: 400
            }
        });
    }
    res.json({
        meta: {
            message: '文件上传成功',
            status: 200
        },
        filename: req.file.filename
    });
});


module.exports = router;
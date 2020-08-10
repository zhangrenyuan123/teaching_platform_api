const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

//连接数据库
require('../config/connect_mongodb');
//引入模型
const course = require('../config/models/courseModel');
let courseModel = course.exports;

router.get('/', (req, res) => {
    res.json({
        msg: '连接成功'
    })
});

//获取课程信息接口
router.post('/getCourseInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { courseName } = req.body;
    courseModel.findOne({ courseName: courseName }).exec((err, data) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '课程信息获取成功',
                status: 200
            },
            data
        });
    })
});

// //获取课程信息接口
// router.post('/getCourseInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
//     let { courseName } = req.body;
//     console.log(courseName);
//     courseModel.findOne({ 'courseName': courseName }).exec((err, data) => {
//         if (err) throw err;
//         res.json({
//             meta: {
//                 message: '获取课程信息成功',
//                 status: 200
//             },
//             data
//         })
//     })
// });


//添加课程信息接口
router.post('/addCourseInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        courseClasses,
        courseRequire,
        courseSuitableMajor,
        courseTotalTime,
        courseTotalScore,
        courseIntro,
        courseLaboratoryName,
        courseGoal,
        courseMethods
    } = req.body;
    //创建课程实例对象 用于添加课程信息
    let courseObj = new courseModel();
    courseObj.courseName = courseName;
    courseObj.courseClasses = courseClasses;
    courseObj.courseRequire = courseRequire;
    courseObj.courseSuitableMajor = courseSuitableMajor;
    courseObj.courseTotalTime = courseTotalTime;
    courseObj.courseTotalScore = courseTotalScore;
    courseObj.courseIntro = courseIntro;
    courseObj.courseLaboratoryName = courseLaboratoryName;
    courseObj.courseGoal = courseGoal;
    courseObj.courseMethods = courseMethods;
    courseObj.save(err => {
        if (err) throw err;
        res.json({
            meta: {
                message: '课程信息添加成功',
                status: 200
            }
        });
    });
});


//更新课程信息接口
router.post('/saveCourseEdit', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        oldCourseName,
        courseName,
        courseClasses,
        courseRequire,
        courseSuitableMajor,
        courseTotalTime,
        courseTotalScore,
        courseIntro,
        courseLaboratoryName,
        courseGoal,
        courseMethods
    } = req.body;
    courseModel.findOne({ courseName: oldCourseName }).exec((err, courseObj) => {
        if (err) throw err;
        courseObj.courseName = courseName;
        courseObj.courseClasses = courseClasses;
        courseObj.courseRequire = courseRequire;
        courseObj.courseSuitableMajor = courseSuitableMajor;
        courseObj.courseTotalTime = courseTotalTime;
        courseObj.courseTotalScore = courseTotalScore;
        courseObj.courseIntro = courseIntro;
        courseObj.courseLaboratoryName = courseLaboratoryName;
        courseObj.courseGoal = courseGoal;
        courseObj.courseMethods = courseMethods;
        courseObj.save(err => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '课程信息修改成功',
                    status: 200
                }
            });
        });
    });
});

//删除课程信息接口
router.post('/deleteCourseInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName
    } = req.body;
    courseModel.findOne({ courseName: courseName }).exec((err, courseObj) => {
        if (err) throw err;
        if (!courseObj) {
            res.json({
                meta: {
                    message: '课程信息删除成功',
                    status: 200
                }
            });
            return;
        }
        courseObj.remove(err => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '课程信息删除成功',
                    status: 200
                }
            });
        });
    });
});

module.exports = router;
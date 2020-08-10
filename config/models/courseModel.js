const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//创建课程模式
let courseSchema = new Schema({
    courseName: {
        type: String,
        required: true
    },
    courseClasses: String,
    courseRequire: String,
    courseSuitableMajor: String,
    courseTotalTime: Number,
    courseTotalScore: Number,
    courseIntro: String,
    courseLaboratoryName: String,
    courseGoal: String,
    courseMethods: String
});

//根据模型创建模型
let courseModel = mongoose.model('courses', courseSchema);

exports.exports = courseModel;
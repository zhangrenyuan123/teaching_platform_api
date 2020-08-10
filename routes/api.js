const express = require('express');
const router = express.Router();
// const connection = require('../config/connect_mysql');
const db = require('../config/connect_mysql');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const fs = require('fs');


//学生登入接口
router.post('/students/login', (req, res) => {
    let { studentNum, studentPwd } = req.body;
    db.query(`SELECT * FROM Students WHERE Student_num=${studentNum}`, (err, data) => {
        if (err) {
            throw err;
        } else if (data.length === 0) { //当data为空时，表示没有查询该学生的信息
            let studentObj = {
                meta: {
                    message: '没有此账号',
                    status: 400
                }
            };
            res.json(studentObj);
        } else {
            let [{ Student_pwd: pwd, Student_num: num, Student_email: email }] = data;
            if (studentPwd === pwd) { //判断密码是否正确
                //如果正确则生成一个token返回
                const rule = { num, email };
                jwt.sign(rule, 'secret', { expiresIn: 1800 }, (err, token) => {
                    if (err) throw err;
                    res.json({
                        meta: {
                            message: '登入成功',
                            status: 200
                        },
                        token: 'Bearer ' + token
                    });
                });
            } else {
                res.json({
                    meta: {
                        message: '密码错误',
                        status: 400
                    }
                })
            }
        }
    })
});

//教师登入接口
router.post('/teachers/login', (req, res) => {
    let { teacherNum, teacherPwd } = req.body;
    db.query(`SELECT * FROM Teachers WHERE Teacher_num=${teacherNum}`, (err, data) => {
        if (err) {
            throw err;
        } else if (data.length === 0) { //当data为空时，表示没有查询该教师的信息
            let teacherObj = {
                meta: {
                    message: '没有此账号',
                    status: 400
                }
            };
            res.json(teacherObj);
        } else {
            if (teacherPwd === data[0].Teacher_pwd) { //判断密码是否正确
                const rule = {
                    num: data[0].Teacher_num,
                    email: data[0].Teacher_email
                };
                jwt.sign(rule, 'secret', { expiresIn: 1800 }, (err, token) => {
                    if (err) throw err;
                    res.json({
                        meta: {
                            message: '登入成功',
                            status: 200
                        },
                        token: 'Bearer ' + token
                    });
                });
                // let teacherObj = {
                //     meta: {
                //         message: '登入成功',
                //         status: 200
                //     }
                // }
                // res.json(teacherObj);
            } else {
                res.json({
                    meta: {
                        message: '密码错误',
                        status: 400
                    }
                })
            }
        }
    })
});

//查询用户是否已经注册
router.post('/register_check', (req, res) => {
    let { isStudent, num } = req.body;
    let query_sql = '';
    if (isStudent) {
        query_sql = `SELECT Student_num FROM Students WHERE Student_num=${num}`;
    } else {
        query_sql = `SELECT Teacher_num FROM Teachers WHERE Teacher_num=${num}`;
    }
    db.query(query_sql, (err, result) => {
        if (err) throw err;
        if (result.length !== 0) {
            res.json({
                meta: {
                    message: '该账号已经完成注册',
                    status: 400
                }
            });
        } else {
            res.json({
                meta: {
                    message: '该账号没有被注册',
                    status: 200
                }
            })
        }
    });
});


//学生注册接口
router.post('/students/register', (req, res) => {
    let {
        stuNum,
        name,
        pwd,
        email,
        tel
    } = req.body;
    //将请求体中的数据保存到数据库中
    let sql_add = `INSERT INTO 
                        Students(Student_num,Student_name,Student_pwd,Student_email,Student_tel) 
                        VALUES(${stuNum},'${name}','${pwd}','${email}','${tel}')`
    db.query(sql_add, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '添加成功',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '添加失败',
                    status: 400
                }
            });
        }
    });
});

//教师注册接口
router.post('/teachers/register', (req, res) => {
    let {
        teaNum,
        name,
        pwd,
        email,
        tel,
        level
    } = req.body;
    //将请求体中的数据保存到数据库中
    let sql_add = `INSERT INTO 
                        Teachers(Teacher_num,Teacher_name,Teacher_pwd,Teacher_email,Teacher_tel,Teacher_level) 
                        VALUES(${teaNum},'${name}','${pwd}','${email}','${tel}','${level}')`
    db.query(sql_add, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '添加成功',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '添加失败',
                    status: 400
                }
            });
        }
    });
});

//test 接口
// router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => {
//     res.json({
//         message: 'success'
//     })
// })

//获取学生信息接口
router.get('/getStudentInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { num } = req.user;
    let sql = `SELECT * FROM Students WHERE Student_num = ${num}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    })
});

router.post('/getStudentInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `SELECT * FROM Students WHERE Student_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '获取学生信息成功',
                status: 200
            },
            data: result[0]
        });
    })
});

//获取学生列表信息接口
router.post('/getStudentList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        pageSize,
        currentPage,
        query
    } = req.body;
    let sql = '';
    if (query) {
        sql = `SELECT * FROM Students WHERE Student_name LIKE '%${query}%'`;
    } else {
        sql = `SELECT * FROM Students`;
    }
    db.query(sql, (err, result) => {
        if (err) throw err;
        let total = result.length;
        let stuData = result.splice(pageSize * currentPage - pageSize, pageSize);
        res.json({
            total,
            data: stuData,
            meta: {
                message: '获取教师信息列表成功',
                status: 200
            }
        })
    })
});


//更新学生信息接口
router.post('/updateStudentInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        num,
        name,
        sex,
        tel,
        email,
        qq,
        intro
    } = req.body;
    let sql = `UPDATE Students SET Student_name = '${name}',
                                   Student_sex='${sex}',
                                   Student_tel='${tel}',
                                   Student_email='${email}',
                                   Student_qq='${qq}',
                                   Student_intro='${intro}'
                                   WHERE Student_num = ${num}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '更新成功',
                status: 200
            }
        });
    })
});

//检查用户当前密码是否正确
router.post('/checkPwd', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        currentPwd,
        num,
        isStudent
    } = req.body;
    // res.json(req.body);

    let stuSql = `SELECT Student_pwd FROM Students WHERE Student_num=${num}`;
    let teaSql = `SELECT Teacher_pwd FROM Teachers WHERE Teacher_num=${num}`;

    if (isStudent) {
        db.query(stuSql, (err, result) => {
            if (err) throw err;
            if (result.length !== 0) {
                if (result[0].Student_pwd === currentPwd) {
                    res.json({
                        meta: {
                            message: '密码正确',
                            status: 200
                        }
                    })
                } else {
                    res.json({
                        meta: {
                            message: '密码不正确',
                            status: 400
                        }
                    })
                }
            }
        });
    } else {
        db.query(teaSql, (err, result) => {
            if (err) throw err;
            if (result.length !== 0) {
                if (result[0].Teacher_pwd === currentPwd) {
                    res.json({
                        meta: {
                            message: '密码正确',
                            status: 200
                        }
                    })
                } else {
                    res.json({
                        meta: {
                            message: '密码不正确',
                            status: 400
                        }
                    })
                }
            }
        });
    }
});

//修改用户密码
router.post('/updatePwd', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        isStudent,
        num,
        editPwd
    } = req.body;

    let stuSql = `UPDATE Students SET Student_pwd='${editPwd}' WHERE Student_num=${num}`;
    let teaSql = `UPDATE Teachers SET Teacher_pwd='${editPwd}' WHERE Teacher_num=${num}`;

    if (isStudent) {
        db.query(stuSql, (err, result) => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '密码修改成功',
                    status: 200
                }
            })
        });
    } else {
        db.query(teaSql, (err, result) => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '密码修改成功',
                    status: 200
                }
            })
        });
    }
});

//获取教师信息接口
router.get('/getTeacherInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { num } = req.user;
    let sql = `SELECT * FROM Teachers WHERE Teacher_num = ${num}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    })
});

router.post('/getTeacherInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `SELECT * FROM Teachers WHERE Teacher_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '获取教师信息成功',
                status: 200
            },
            data: result[0]
        });
    });
})

//获取教师列表信息接口
router.post('/getTeacherList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        pageSize,
        currentPage,
        query
    } = req.body;
    let sql = '';
    if (query) {
        sql = `SELECT * FROM Teachers WHERE Teacher_name LIKE '%${query}%'`;
    } else {
        sql = `SELECT * FROM Teachers`;
    }
    db.query(sql, (err, result) => {
        if (err) throw err;
        let total = result.length;
        let teaData = result.splice(pageSize * currentPage - pageSize, pageSize);
        res.json({
            total,
            data: teaData,
            meta: {
                message: '获取教师信息列表成功',
                status: 200
            }
        });
    })
});

//更新教师信息接口
router.post('/updateTeacherInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        num,
        name,
        sex,
        tel,
        email,
        qq,
    } = req.body;
    let sql = `UPDATE Teachers SET Teacher_name = '${name}',
                                   Teacher_sex='${sex}',
                                   Teacher_tel='${tel}',
                                   Teacher_email='${email}',
                                   Teacher_qq='${qq}'
                                   WHERE Teacher_num = ${num}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '更新成功',
                status: 200
            }
        });
    })
});

//获取课程列表信息
router.get('/getCourseList', passport.authenticate('jwt', { session: false }), (req, res) => {
    // res.json(req.user);
    let { num } = req.user;
    let sql = `SELECT Course_name FROM Courses 
                    WHERE Course_author in (SELECT Teacher_name From Teachers WHERE Teacher_num = ${num})`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

//获取正在进行的课程列表信息
router.get('/getCourseStatusList', passport.authenticate('jwt', { session: false }), (req, res) => {
    // res.json(req.user);
    let { num } = req.user;
    let getTeacherNameSql = `SELECT Teacher_name From Teachers WHERE Teacher_num = ${num}`;
    db.query(getTeacherNameSql, (err, teacherNameArr) => {
        if (err) throw err;
        let teacherName = teacherNameArr[0].Teacher_name;
        let sql = `SELECT Course_name FROM Courses WHERE Course_author = '${teacherName}' AND Course_status = 0`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            // res.json(result);
            res.json({
                meta: {
                    message: '获取正在进行的课程名称成功',
                    status: 200
                },
                data: result
            });
        });
    });
});

router.post('/getCourseList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        pageSize,
        currentPage,
        query
    } = req.body;
    let { num } = req.user;
    let getTeacherNameSql = `SELECT Teacher_name FROM Teachers WHERE Teacher_num = ${num}`;
    db.query(getTeacherNameSql, (err, result) => {
        if (err) throw err;
        if (result) {
            let teacherName = result[0].Teacher_name;
            let courseSql = '';
            if (query) {
                courseSql = `SELECT * FROM Courses WHERE Course_name LIKE '%${query}%' and Course_author = '${teacherName}'`;
            } else {
                courseSql = `SELECT * FROM Courses WHERE Course_author = '${teacherName}'`;
            }
            // courseSql = `SELECT * FROM Courses WHERE Course_name="面向对象程序设计"`;
            db.query(courseSql, (err, result1) => {
                if (err) throw err;
                let total = result1.length;
                let courseData = result1.splice(pageSize * currentPage - pageSize, pageSize);
                res.json({
                    total,
                    data: courseData,
                    meta: {
                        message: '获取课程信息列表成功',
                        status: 200
                    }
                });
            })
        }
    })
});

//添加课程信息接口
router.post('/addCourse', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        courseGrade,
        courseMajor
    } = req.body;
    let { num } = req.user;
    let getTeacherNameSql = `SELECT Teacher_name FROM Teachers WHERE Teacher_num = ${num}`;
    db.query(getTeacherNameSql, (err, result) => {
        if (err) throw err;
        let teacherName = result[0].Teacher_name;
        let startTime = new Date().toLocaleString();
        let sql = `INSERT INTO 
                        Courses(Course_name,Course_author,Course_grade,Course_major,Course_startTime,Course_status)
                        VALUES('${courseName}','${teacherName}','${courseGrade}','${courseMajor}','${startTime}',0)`;
        db.query(sql, (err, result1) => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '添加成功',
                    status: 200
                }
            });
        })
    });
});
//获取当前课程信息
router.post('/getCourseInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `SELECT * FROM Courses WHERE Course_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '获取课程信息成功',
                status: 200
            },
            data: result
        })
    });
});
//更新课程信息接口
router.post('/saveCourseEdit', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        id,
        courseName,
        courseGrade,
        courseMajor
    } = req.body;
    let sql = `UPDATE Courses SET 
                                Course_name = '${courseName}',
                                Course_grade = '${courseGrade}',
                                Course_major = '${courseMajor}'
                                WHERE Course_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '修改成功',
                status: 200
            }
        });
    })
});
//删除当前课程接口
router.post('/deleteCourseInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        id
    } = req.body;
    let courseNameSql = `SELECT Course_name FROM Courses WHERE Course_id = ${id}`;
    db.query(courseNameSql, (err, courseName) => {
        if (err) throw err;
        let worksSql = `SELECT Work_id FROM Works WHERE Work_courseName = '${courseName[0].Course_name}'`;
        db.query(worksSql, (err, worksId) => {
            if (err) throw err;
            if (worksId.length !== 0) {
                worksId.forEach(work => {
                    let deleteSelfWorksSql = `DELETE FROM SelfWorks WHERE Work_id = ${work.Work_id}`;
                    db.query(deleteSelfWorksSql, (err, result1) => {
                        if (err) throw err;
                    });
                    let deleteWorksSql = `DELETE FROM Works WHERE Work_id = ${work.Work_id}`;
                    db.query(deleteWorksSql, (err, result2) => {
                        if (err) throw err;
                    });
                });
            }
        });
    });
    let deleteScoreSql = `DELETE FROM Scores WHERE Course_id = ${id}`;
    db.query(deleteScoreSql, (err, result3) => {
        if (err) throw err;
    });
    let sql = `DELETE FROM Courses WHERE Course_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '课程删除成功',
                status: 200
            }
        });
    });
});

//获取当前课程作业列表信息
router.post('/getWorksList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        pageSize,
        currentPage
    } = req.body;
    let sql = `SELECT * FROM Works WHERE Work_courseName = '${courseName}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        let total = result.length;
        let worksData = result.splice(pageSize * currentPage - pageSize, pageSize);
        res.json({
            total,
            data: worksData,
            meta: {
                message: '获取作业列表成功',
                status: 200
            }
        });
    })
});

//课程作业添加
router.post('/addWorks', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        name,
        courseName,
        endTime,
        content,
        fileName,
        videoFileName
    } = req.body;
    let { num } = req.user;
    endTime = new Date(endTime).toLocaleString();
    let startTime = new Date().toLocaleString();
    let courseSql = `SELECT Course_grade,Course_major FROM Courses WHERE Course_name='${courseName}'`;
    db.query(courseSql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '添加失败',
                    status: 400
                }
            });
            return;
        }
        let grade = result[0].Course_grade;
        let major = result[0].Course_major;
        let worksSql = `INSERT INTO 
                            Works(Work_name,Work_courseName,Work_startTime,Work_endTime,Work_content,Work_status,Work_grade,Work_major,Work_url,Work_videoUrl) 
                            VALUES('${name}','${courseName}','${startTime}','${endTime}','${content}',0,'${grade}','${major}','${fileName}','${videoFileName}')`;
        db.query(worksSql, (err, data) => {
            if (err) throw err;
            if (data) {
                let teacher_id = '';
                let teacherIdSql = `SELECT Teacher_id FROM Teachers WHERE Teacher_num = ${num}`;
                db.query(teacherIdSql, (err, teacherId) => {
                    if (err) throw err;
                    teacher_id = teacherId[0].Teacher_id;
                });
                let works_id = '';
                let worksIdSql = `SELECT Work_id FROM Works WHERE Work_name = '${name}'`;
                db.query(worksIdSql, (err, worksId) => {
                    if (err) throw err;
                    works_id = worksId[0].Work_id;
                });
                let studentSql = `SELECT Student_id FROM Students WHERE Student_grade = '${grade}' AND Student_major = '${major}'`;
                db.query(studentSql, (err, studentData) => {
                    if (err) throw err;
                    if (studentData) {
                        studentData.forEach(studentId => {
                            let addStudentWorkSql = `INSERT INTO SelfWorks(Work_id,Teacher_id,Student_id,Teacher_status,Student_status)
                                                        VALUE(${works_id},${teacher_id},${studentId.Student_id},0,0)`;
                            db.query(addStudentWorkSql, (err, data1) => {
                                if (err) throw err;
                            });
                        });
                    }
                })
            }
            res.json({
                meta: {
                    message: '添加成功',
                    status: 200
                }
            });
        })
    })
});

//课程作业信息查询
router.post('/getWorksInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `SELECT * FROM Works WHERE Work_id=${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '作业信息获取成功',
                status: 200
            },
            data: result
        });
    })
});

//课程作业编辑
router.post('/editWorksInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        Work_id,
        Work_name,
        Work_courseName,
        Work_endTime,
        Work_content,
        Work_grade,
        Work_major,
        Work_url,
        Work_videoUrl
    } = req.body;
    let sql = `UPDATE Works SET Work_name = '${Work_name}',
                                Work_courseName = '${Work_courseName}',
                                Work_endTime = '${Work_endTime}',
                                Work_content = '${Work_content}',
                                Work_grade = '${Work_grade}',
                                Work_Major = '${Work_major}',
                                Work_url = '${Work_url}',
                                Work_videoUrl = '${Work_videoUrl}'
                                WHERE Work_id = ${Work_id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '修改成功',
                status: 200
            }
        })
    })
});

//删除当前课程作业接口
router.post('/deleteWorks', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let deleteSelfWorksSql = `DELETE FROM SelfWorks WHERE Work_id = ${id}`;
    db.query(deleteSelfWorksSql, (err, result1) => {
        if (err) throw err;
        if (result1) {
            let sql = `DELETE FROM Works WHERE Work_id = ${id}`;
            db.query(sql, (err, result2) => {
                if (err) throw err;
                res.json({
                    meta: {
                        message: '删除成功',
                        status: 200
                    }
                });
            });
        }
    });
});

//获取当前未批改作业列表
router.post('/getNoCorrectingWorks', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        pageSize,
        currentPage
    } = req.body;
    let sql = `SELECT * FROM Works WHERE Work_Coursename = '${courseName}' and Work_status != 1`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        let arr = [];
        result.forEach(work => {
            let currentTime = new Date();
            let endTime = new Date(work.Work_endTime);
            if (currentTime > endTime) {
                let updateSelfWorkStatusSql = `UPDATE SelfWorks SET Student_score = 0,
                                                                    Teacher_status = 1,
                                                                    Student_status = 1
                                                                    WHERE Work_id = ${work.Work_id} AND Student_status = 0`;
                db.query(updateSelfWorkStatusSql, (err, result1) => {
                    if (err) throw err;
                    if (result1) {
                        let checkStatusSql = `SELECT * FROM SelfWorks WHERE Work_id = ${work.Work_id} AND Student_status = 1 AND Teacher_status = 0`;
                        db.query(checkStatusSql, (err, result2) => {
                            if (err) throw err;
                            if (result2.length === 0) {
                                let updateWorkStatusSql = `UPDATE Works SET Work_status = 1 WHERE Work_id = ${work.Work_id}`;
                                db.query(updateWorkStatusSql, (err, result3) => {
                                    if (err) throw err;
                                });
                            } else {
                                let getWorksNumSql = `SELECT * FROM SelfWorks WHERE Work_id = ${work.Work_id}`;
                                db.query(getWorksNumSql, (err, result4) => {
                                    if (err) throw err;
                                    if (result2.length < result4.length) {
                                        let updateWorkStatusSql = `UPDATE Works SET Work_status = 2 WHERE Work_id = ${work.Work_id}`;
                                        db.query(updateWorkStatusSql, (err, result5) => {
                                            if (err) throw err;
                                        });
                                    }
                                })
                            }
                        });
                    }
                });
            }
        });
        setTimeout(() => {
            db.query(sql, (err, result4) => {
                if (err) throw err;
                let total = result4.length;
                let worksData = result4.splice(pageSize * currentPage - pageSize, pageSize);
                res.json({
                    total,
                    data: worksData,
                    meta: {
                        message: '获取未批改作业列表成功',
                        status: 200
                    }
                });
            });
        }, 500);
    })
});

//获取当前已批改完成列表
router.post('/getCorrectedWorks', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        pageSize,
        currentPage
    } = req.body;
    let sql = `SELECT * FROM Works WHERE Work_Coursename = '${courseName}' and Work_status = 1`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        let total = result.length;
        let worksData = result.splice(pageSize * currentPage - pageSize, pageSize);
        res.json({
            total,
            data: worksData,
            meta: {
                message: '获取已批改作业列表成功',
                status: 200
            }
        });
    })
});

//获取当前学生的年级和专业
router.get('/getGradeAndMajor', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { num } = req.user;
    let sql = `SELECT Student_grade,Student_major FROM Students WHERE Student_num = '${num}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '获取年级和专业失败',
                    status: 400
                }
            });
        }
        result = result[0];
        res.json({
            meta: {
                message: '获取年级和专业成功',
                status: 200
            },
            data: result
        });
    })
});

//获取当前学生所拥有的课程
router.post('/getStudentCourseList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        grade,
        major,
        pageSize,
        currentPage
    } = req.body;
    let sql = `SELECT * FROM Courses WHERE Course_grade = '${grade}' and Course_major = '${major}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        let total = result.length;
        result.sort((courseA, courseB) => {
            // return new Date(courseA.Course_startTime) - new Date(courseB.Course_startTime);
            return courseA.Course_status - courseB.Course_status;
        });
        let coursesData = result.splice(pageSize * currentPage - pageSize, pageSize);
        res.json({
            total,
            data: coursesData,
            meta: {
                message: '获取学生课程列表成功',
                status: 200
            }
        });
    })
});

//获取未截止的课程名称列表
router.post('/getNotEndCourseList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        grade,
        major
    } = req.body;
    let sql = `SELECT Course_name,Course_startTime FROM Courses WHERE Course_grade = '${grade}' AND Course_major = '${major}' AND Course_status = 0`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '未获取到数据',
                    status: 400
                }
            });
            return;
        }
        result.sort((courseA, courseB) => {
            return courseA.Course_startTime < courseB.Course_startTime;
        });
        res.json({
            meta: {
                message: '获取数据成功',
                status: 200
            },
            data: result
        });
    });
});
//获取所有的课程名称列表
router.post('/getAllCoursesList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        grade,
        major
    } = req.body;
    let sql = `SELECT Course_name,Course_startTime FROM Courses WHERE Course_grade = '${grade}' AND Course_major = '${major}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '未获取到数据',
                    status: 400
                }
            });
            return;
        }
        result.sort((courseA, courseB) => {
            return courseA.Course_startTime < courseB.Course_startTime;
        });
        res.json({
            meta: {
                message: '获取数据成功',
                status: 200
            },
            data: result
        });
    });
});


//获取当前所有未完成的作业列表
router.post('/getnotFinishWorksList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        pageSize,
        currentPage
    } = req.body;
    let { num } = req.user;
    let worksSql = `SELECT * FROM Works WHERE Work_courseName = '${courseName}' AND Work_status != 1`;
    db.query(worksSql, (err, worksData) => {
        if (err) throw err;
        if (worksData.length === 0) {
            res.json({
                meta: {
                    message: '未获取到数据',
                    status: 400
                }
            });
            return;
        };
        let notFinishWorks = [];
        let studentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
        db.query(studentIdSql, (err, studentIdData) => {
            if (err) throw err;
            let student_id = studentIdData[0].Student_id;
            worksData.forEach(work => {
                let studentStatusSql = `SELECT Student_status FROM SelfWorks WHERE Student_id = ${student_id} AND Work_id = ${work.Work_id}`;
                db.query(studentStatusSql, (err, studentStatus) => {
                    if (err) throw err;
                    if (studentStatus.length === 0) {
                        return;
                    }
                    if (studentStatus[0].Student_status === 0) {
                        let currentTime = new Date();
                        let endTime = new Date(work.Work_endTime);
                        if (endTime > currentTime) {
                            notFinishWorks.push(work);
                        }
                    }
                });
            });
        });
        setTimeout(() => {
            if (notFinishWorks.length === 0) {
                res.json({
                    meta: {
                        message: '未获取到数据',
                        status: 400
                    }
                });
            } else {
                let total = notFinishWorks.length;
                let worksData = notFinishWorks.splice(pageSize * currentPage - pageSize, pageSize);
                res.json({
                    meta: {
                        message: '获取数据成功',
                        status: 200
                    },
                    data: worksData,
                    total
                });
            }
        }, 500);
    })
});
//获取当前所有已完成的作业列表
router.post('/getFinishedWorksList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        pageSize,
        currentPage
    } = req.body;
    let { num } = req.user;
    let worksSql = `SELECT * FROM Works WHERE Work_courseName = '${courseName}'`;
    db.query(worksSql, (err, worksData) => {
        if (err) throw err;
        if (worksData.length === 0) {
            res.json({
                meta: {
                    message: '未获取到数据',
                    status: 400
                }
            });
            return;
        };
        let finishWorks = [];
        let studentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
        db.query(studentIdSql, (err, studentIdData) => {
            if (err) throw err;
            let student_id = studentIdData[0].Student_id;
            worksData.forEach(work => {
                let studentStatusSql = `SELECT Student_status,Student_score FROM SelfWorks WHERE Student_id = ${student_id} AND Work_id = ${work.Work_id}`;
                db.query(studentStatusSql, (err, studentStatus) => {
                    if (err) throw err;
                    if (studentStatus.length === 0) {
                        return;
                    }
                    if (studentStatus[0].Student_status === 1) {
                        work.Student_score = studentStatus[0].Student_score;
                        finishWorks.push(work);
                    } else {
                        let currentTime = new Date();
                        let endTime = new Date(work.Work_endTime);
                        if (endTime < currentTime) {
                            let updateStatusSql = `UPDATE SelfWorks SET Student_status = 1,
                                                                        Teacher_status = 1,
                                                                        Student_score = 0
                                                                        WHERE Work_id = ${work.Work_id} AND Student_id = ${student_id}`;
                            db.query(updateStatusSql, (err, result) => {
                                if (err) throw err;
                                // let updateWorkStatusSql = `UPDATE Works SET Work_status = 1 WHERE Work_id = ${work.Work_id}`;
                                // db.query(updateWorkStatusSql, (err, result1) => {
                                //     if (err) throw err;
                                // })
                            });
                            work.Student_score = 0;
                            work.Student_status = 1;
                            work.Teacher_status = 1;
                            finishWorks.push(work);
                        }
                    }
                });
            });
        });
        setTimeout(() => {
            if (finishWorks.length === 0) {
                res.json({
                    meta: {
                        message: '未获取到数据',
                        status: 400
                    }
                });
            } else {
                let total = finishWorks.length;
                let worksData = finishWorks.splice(pageSize * currentPage - pageSize, pageSize);
                res.json({
                    meta: {
                        message: '获取数据成功',
                        status: 200
                    },
                    data: worksData,
                    total
                });
            }
        }, 500);
    })
});

//获取当前已完成作业信息
router.post('/getFinishedWorksInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let { num } = req.user;
    let sql = `SELECT Work_name,Work_endTime,Work_content FROM Works WHERE Work_id = ${id}`;
    db.query(sql, (err, worksData) => {
        if (err) throw err;
        let works_data = worksData[0];
        let studentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
        db.query(studentIdSql, (err, studentIdData) => {
            if (err) throw err;
            let student_id = studentIdData[0].Student_id;
            let selfWorksSql = `SELECT Student_language,Student_score,Submit_time,Student_url,Teacher_language
                                    FROM SelfWorks WHERE Student_id = ${student_id} AND Work_id = ${id}`;
            db.query(selfWorksSql, (err, selfWorkData) => {
                if (err) throw err;
                works_data.Student_language = selfWorkData[0].Student_language;
                works_data.Student_score = selfWorkData[0].Student_score;
                works_data.Submit_time = selfWorkData[0].Submit_time;
                works_data.Student_url = selfWorkData[0].Student_url;
                works_data.Teacher_language = selfWorkData[0].Teacher_language;
                res.json({
                    meta: {
                        message: '获取已完成作业信息成功',
                        status: 200
                    },
                    data: works_data
                });
            });
        })
    });
});

//保存提交作业
router.post('/submitWorks', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { content, id } = req.body;
    let { num } = req.user;
    let submitTime = new Date().toLocaleString();
    let studentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
    db.query(studentIdSql, (err, studentId) => {
        if (err) throw err;
        let student_id = studentId[0].Student_id;
        let sql = `UPDATE SelfWorks SET Student_status = 1,
                                        Student_language='${content}',
                                        Submit_time='${submitTime}'
                                        WHERE Student_id = ${student_id} AND Work_id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '提交完成',
                    status: 200
                }
            });

        })
    })
});

//保存文件名
router.post('/saveFilename', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { fileName, worksId } = req.body;
    let { num } = req.user;
    let studentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
    db.query(studentIdSql, (err, studentId) => {
        if (err) throw err;
        let student_id = studentId[0].Student_id;
        let sql = `UPDATE SelfWorks SET Student_url = '${fileName}' WHERE Student_id = ${student_id} AND Work_id = ${worksId}`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '保存文件名成功',
                    status: 200
                }
            });
        });
    })
});

//获取文件名
router.post('/getFileName', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let { num } = req.user;
    let studentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
    db.query(studentIdSql, (err, studentId) => {
        if (err) throw err;
        let student_id = studentId[0].Student_id;
        let sql = `SELECT Student_url FROM SelfWorks WHERE Student_id = ${student_id} AND Work_id = ${id}`;
        db.query(sql, (err, fileName) => {
            if (err) throw err;
            if (!fileName[0].Student_url) {
                res.json({
                    meta: {
                        message: '没有相应的文件',
                        status: 400
                    }
                });
            } else {
                res.json({
                    meta: {
                        message: '获取到相应的文件名',
                        status: 200
                    },
                    data: fileName[0].Student_url
                });
            }
        });
    });
});
//删除文件
router.post('/removeFiles', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        fileName,
        worksId
    } = req.body;
    let { num } = req.user;
    fs.unlink(`uploads/${fileName}`, (err) => {
        if (err) {
            res.json({
                meta: {
                    message: '删除失败',
                    status: 400
                }
            });
            throw err;
        } else {
            let studentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
            db.query(studentIdSql, (err, studentId) => {
                if (err) throw err;
                let student_id = studentId[0].Student_id;
                let sql = `UPDATE SelfWorks SET Student_url = '' WHERE Student_id = ${student_id} AND Work_id = ${worksId}`;
                db.query(sql, (err, result) => {
                    if (err) throw err;
                    res.json({
                        meta: {
                            message: '删除文件成功',
                            status: 200
                        }
                    });
                });
            })
        }
    })
});
router.post('/removeWorksFiles', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        fileName,
        worksId
    } = req.body;
    if (!fileName) {
        return;
    }
    fs.unlink(`uploads/${fileName}`, (err) => {
        if (err) {
            res.json({
                meta: {
                    message: '删除失败',
                    status: 400
                }
            });
            throw err;
        } else {
            if (worksId !== 0) {
                let sql = `UPDATE Works SET Work_url = '' WHERE Work_id = ${worksId}`;
                db.query(sql, (err, result) => {
                    if (err) throw err;
                    res.json({
                        meta: {
                            message: '删除成功',
                            status: 200
                        }
                    })
                });
            } else {
                res.json({
                    meta: {
                        message: '删除成功',
                        status: 200
                    }
                });
            }

        }
    });
});

//获取学生作业列表
router.post('/getStudentWorksList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        workStatus,
        currentPage,
        pageSize,
        work_id
    } = req.body;
    let sql = '';
    if (workStatus) {
        sql = `SELECT * FROM SelfWorks WHERE Work_id = ${work_id} AND Student_status = ${workStatus}`;
    } else {
        sql = `SELECT * FROM SelfWorks WHERE Work_id = ${work_id}`;
    }
    db.query(sql, (err, result) => {
        if (err) throw err;
        result.forEach(selfWork => {
            let studentInfoSql = `SELECT Student_num,Student_name FROM Students WHERE Student_id = ${selfWork.Student_id}`;
            db.query(studentInfoSql, (err, studentInfo) => {
                if (err) throw err;
                selfWork.Student_name = studentInfo[0].Student_name;
                selfWork.Student_num = studentInfo[0].Student_num;
            });
        });
        setTimeout(() => {
            let total = result.length;
            let worksData = result.splice(pageSize * currentPage - pageSize, pageSize);
            res.json({
                meta: {
                    message: '获取学生作业列表成功',
                    status: 200
                },
                data: worksData,
                total
            })
        }, 500);
    });
});

//获取教师批改作业的详情信息
router.post('/getStudentWorksInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        workId,
        studentId
    } = req.body;
    let sql = `SELECT Student_language,Submit_time,Student_url,Correct_time,Student_score,Teacher_language FROM SelfWorks WHERE Student_id = ${studentId} AND Work_id = ${workId}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        let workInfoSql = `SELECT Work_name,Work_content,Work_endTime FROM Works WHERE Work_id = ${workId}`;
        db.query(workInfoSql, (err, workInfo) => {
            if (err) throw err;
            let workData = workInfo[0];
            workData.Student_language = result[0].Student_language;
            workData.Submit_time = result[0].Submit_time;
            workData.Student_url = result[0].Student_url;
            workData.Correct_time = result[0].Correct_time;
            workData.Student_score = result[0].Student_score;
            workData.Teacher_language = result[0].Teacher_language;
            res.json({
                meta: {
                    message: '获取学生作业详情信息成功',
                    status: 200
                },
                data: workData
            });
        });
    });
});

//提交教师批改作业
router.post('/saveSelfWorksCorrection', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        workId,
        studentId,
        score,
        language
    } = req.body;
    let currentTime = new Date().toLocaleString();
    let sql = `UPDATE SelfWorks SET Student_score = ${score},
                                    Teacher_status = 1,
                                    Correct_time = '${currentTime}',
                                    Teacher_language = '${language}'
                                    WHERE Student_id = ${studentId} AND Work_id = ${workId}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            let getWorkStatusSql = `SELECT * FROM SelfWorks WHERE Work_id = ${workId}`;
            db.query(getWorkStatusSql, (err, selfWorksData) => {
                if (err) throw err;
                let n = 0;
                selfWorksData.forEach(selfWork => {
                    if (selfWork.Teacher_status === 1) {
                        n++;
                    }
                });
                let updateWorkStatusSql = '';
                if (n === selfWorksData.length) {
                    updateWorkStatusSql = `UPDATE Works SET Work_status = 1 WHERE Work_id = ${workId}`;
                } else if (n === 1) {
                    updateWorkStatusSql = `UPDATE Works SET Work_status = 2 WHERE Work_id = ${workId}`;
                } else {
                    return;
                }
                db.query(updateWorkStatusSql, (err, result1) => {
                    if (err) throw err;
                });
            });
            res.json({
                meta: {
                    message: '作业批改成功',
                    status: 200
                }
            });
        }
    })
});

//发布成绩
router.post('/addCourseScore', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        usualPercent,
        testPercent
    } = req.body;
    let courseIdSql = `SELECT Course_id,Course_grade,Course_major FROM Courses WHERE Course_name = '${courseName}'`;
    db.query(courseIdSql, (err, courseInfo) => {
        if (err) throw err;
        if (courseInfo.length !== 0) {
            let course_id = courseInfo[0].Course_id;
            let course_grade = courseInfo[0].Course_grade;
            let course_major = courseInfo[0].Course_major;
            let studentIdSql = `SELECT Student_id FROM Students WHERE Student_grade = ${course_grade} AND Student_major = '${course_major}'`;
            db.query(studentIdSql, (err, studentId) => {
                if (err) throw err;
                studentId.forEach(id => {
                    let addScoreSql = `INSERT INTO Scores(Course_id,Student_id,Usual_percent,Experimental_percent)
                                                    VALUE(${course_id},${id.Student_id},'${usualPercent}','${testPercent}')`;
                    db.query(addScoreSql, (err, result) => {
                        if (err) throw err;
                    });
                });
                res.json({
                    meta: {
                        message: '添加成绩数据成功',
                        status: 200
                    }
                });
            });
        }
    });
});

//获取课程占比
router.post('/getScorePercent', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { courseName } = req.body;
    let courseIdSql = `SELECT Course_id FROM Courses WHERE Course_name = '${courseName}'`;
    db.query(courseIdSql, (err, courseId) => {
        if (err) throw err;
        let course_id = courseId[0].Course_id;
        let sql = `SELECT * FROM Scores WHERE Course_id = ${course_id}`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length === 0) {
                res.json({
                    meta: {
                        message: '获取成绩占比失败',
                        status: 400
                    }
                });
            } else {
                let percentData = result[0]
                res.json({
                    meta: {
                        message: '获取成绩占比成功',
                        status: 200
                    },
                    data: percentData
                });
            }
        });
    })
});

//更新课程成绩占比
router.post('/updateCourseScore', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName,
        usualPercent,
        testPercent
    } = req.body;
    let courseIdSql = `SELECT Course_id FROM Courses WHERE Course_name = '${courseName}'`;
    db.query(courseIdSql, (err, courseId) => {
        if (err) throw err;
        let course_id = courseId[0].Course_id;
        let sql = `UPDATE Scores SET Usual_percent = '${usualPercent}',
                                     Experimental_percent = '${testPercent}' 
                                     WHERE Course_id = ${course_id}`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '更新课程成绩占比成功',
                    status: 200
                }
            });
        });
    });
});

//获取课程平时成绩列表
router.post('/getUsualScoreList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        currentPage,
        pageSize,
        courseName
    } = req.body;
    let courseIdSql = `SELECT Course_id FROM Courses WHERE Course_name = '${courseName}'`;
    db.query(courseIdSql, (err, courseId) => {
        if (err) throw err;
        let course_id = courseId[0].Course_id;
        let scoresSql = `SELECT * FROM Scores WHERE Course_id = ${course_id}`;
        db.query(scoresSql, (err, scores) => {
            if (err) throw err;
            if (scores.length !== 0) {
                scores.forEach(score => {
                    let studentInfo = `SELECT Student_num,Student_name FROM Students WHERE Student_id = ${score.Student_id}`;
                    db.query(studentInfo, (err, studentInfo) => {
                        if (err) throw err;
                        score.Student_num = studentInfo[0].Student_num;
                        score.Student_name = studentInfo[0].Student_name;
                    });
                });
                setTimeout(() => {
                    let total = scores.length;
                    let scoreData = scores.splice(pageSize * currentPage - pageSize, pageSize);
                    res.json({
                        meta: {
                            message: '获取数据成功',
                            status: 200
                        },
                        data: scoreData,
                        total
                    });
                }, 300);
            }
        })
    });
});
//获取学生个人平时成绩的详情信息
router.post('/getStudentUsualScoreInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        scoreId,
        studentId
    } = req.body;
    let studentInfoSql = `SELECT Student_num,Student_name FROM Students WHERE Student_id = ${studentId}`;
    db.query(studentInfoSql, (err, studentInfo) => {
        if (err) throw err;
        let scoreInfoSql = `SELECT Usual_score,Usual_percent,Publish_time FROM Scores WHERE Score_id = ${scoreId}`;
        db.query(scoreInfoSql, (err, scoreInfo) => {
            if (err) throw err;
            let data = scoreInfo[0];
            data.Student_name = studentInfo[0].Student_name;
            data.Student_num = studentInfo[0].Student_num;
            res.json({
                meta: {
                    message: '获取数据成功',
                    status: 200
                },
                data
            });
        });
    });
});

//更新学生平时成绩信息
router.post('/updateStudentUsualScore', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        usualScore,
        scoreId
    } = req.body;
    let publishTime = new Date().toLocaleString();
    let sql = `UPDATE Scores SET Usual_score = ${usualScore},Publish_time = '${publishTime}' WHERE Score_id = ${scoreId}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '更新成功',
                status: 200
            }
        });
    });
});

//更新成绩列表
router.post('/updateScoreList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        courseName
    } = req.body;
    let gradeAndMajorSql = `SELECT Course_grade,Course_major,Course_id FROM Courses WHERE Course_name = '${courseName}'`;
    db.query(gradeAndMajorSql, (err, gradeAndMajor) => {
        if (err) throw err;
        let grade = gradeAndMajor[0].Course_grade;
        let major = gradeAndMajor[0].Course_major;
        let course_id = gradeAndMajor[0].Course_id;
        let studentIdSql = `SELECT Student_id FROM Students WHERE Student_grade = '${grade}' AND Student_major = '${major}'`;
        db.query(studentIdSql, (err, studentIds) => {
            if (err) throw err;
            if (studentIds.length !== 0) {
                studentIds.forEach(studentId => {
                    let workIdSql = `SELECT Work_id FROM Works WHERE Work_courseName = '${courseName}'`;
                    db.query(workIdSql, (err, workIds) => {
                        if (err) throw err;
                        if (workIds.length !== 0) {
                            let totalScore = 0;
                            let n = 0;
                            workIds.forEach(workId => {
                                let getScoreSql = `SELECT Student_score FROM SelfWorks WHERE Student_id = ${studentId.Student_id} AND Work_id = ${workId.Work_id}`;
                                db.query(getScoreSql, (err, score) => {
                                    if (err) throw err;
                                    if (score.length !== 0) {
                                        if (score[0].Student_score) {
                                            totalScore += score[0].Student_score;
                                            n++;
                                        }
                                    }
                                });
                            });
                            setTimeout(() => {
                                let scores = 0;
                                if (totalScore !== 0 && n !== 0) {
                                    scores = totalScore / n;
                                }
                                let getTotalScoreSql = `SELECT Usual_score,Usual_percent,Experimental_percent FROM Scores WHERE Student_id = ${studentId.Student_id} AND Course_id = ${course_id}`;
                                db.query(getTotalScoreSql, (err, scoreInfo) => {
                                    if (err) throw err;
                                    if (scoreInfo.length === 0) {
                                        return;
                                    }
                                    if (scoreInfo[0].Usual_score) {
                                        let totalStudentScore = Math.round(scoreInfo[0].Usual_score * scoreInfo[0].Usual_percent + scores * scoreInfo[0].Experimental_percent);
                                        let updateScoreSql = `UPDATE Scores SET Experimental_score = ${Math.round(scores)},
                                                                                Total_score = ${totalStudentScore}
                                                                                WHERE Student_id = ${studentId.Student_id} AND Course_id = ${course_id}`;
                                        db.query(updateScoreSql, (err, result) => {
                                            if (err) throw err;
                                        });
                                    } else {
                                        let updateScoreSql = `UPDATE Scores SET Experimental_score = ${Math.round(scores)}
                                                                                WHERE Student_id = ${studentId.Student_id} AND Course_id = ${course_id}`;
                                        db.query(updateScoreSql, (err, result) => {
                                            if (err) throw err;
                                        });
                                    }
                                })
                            }, 300);
                        }
                    });
                });
            }
            res.json({
                meta: {
                    message: '更新成功',
                    status: 200
                }
            });
        });
    });
});

//结课
router.post('/courseFinish', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { courseName } = req.body;
    let getCourseIdSql = `SELECT Course_id FROM Courses WHERE Course_name = '${courseName}'`;
    db.query(getCourseIdSql, (err, courseIdArr) => {
        if (err) throw err;
        let courseId = courseIdArr[0].Course_id;
        let checkScoreStatusSql = `SELECT * FROM Scores WHERE Course_id = ${courseId}`;
        db.query(checkScoreStatusSql, (err, result1) => {
            if (err) throw err;
            if (result1.length !== 0) {
                let totalScoreStatus = result1.some(scoreObj => {
                    return !scoreObj.Total_score;
                });
                if (totalScoreStatus) {
                    res.json({
                        meta: {
                            message: '结课失败',
                            status: 400
                        }
                    });
                } else {
                    let sql = `UPDATE Courses SET Course_status = 1 WHERE  Course_name = '${courseName}'`;
                    db.query(sql, (err, result) => {
                        if (err) throw err;
                        res.json({
                            meta: {
                                message: '结课成功',
                                status: 200
                            }
                        });
                    });
                }
            } else {
                res.json({
                    meta: {
                        message: '结课失败',
                        status: 400
                    }
                });
            }
        });
    });

});

//检查作业状态
router.post('/checkWorksStatus', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { courseName } = req.body;
    let sql = `SELECT * FROM Works WHERE Work_courseName = '${courseName}' AND Work_status != 1`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '课程作业批改完成',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '课程作业未批改完成',
                    status: 400
                }
            });
        }
    });
});


//获取课程成绩
router.post('/getCourseScore', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        Student_grade,
        Student_major
    } = req.body;
    let { num } = req.user;
    let getStudentIdSql = `SELECT Student_id FROM Students WHERE Student_num = ${num}`;
    db.query(getStudentIdSql, (err, studentObj) => {
        if (err) throw err;
        let studentId = studentObj[0].Student_id;
        let getCourseNameSql = `SELECT Course_id,Course_name,Course_startTime FROM Courses WHERE Course_grade = ${Student_grade} AND Course_major = '${Student_major}'`;
        db.query(getCourseNameSql, (err, courseObj) => {
            if (err) throw err;
            if (courseObj.length !== 0) {
                courseObj.forEach(course => {
                    let getScoreInfoSql = `SELECT * FROM Scores WHERE Course_id = ${course.Course_id} AND Student_id = ${studentId}`;
                    db.query(getScoreInfoSql, (err, scoreInfoObj) => {
                        if (err) throw err;
                        if (scoreInfoObj.length !== 0) {
                            course.Usual_score = scoreInfoObj[0].Usual_score;
                            course.Experimental_score = scoreInfoObj[0].Experimental_score;
                            course.Total_score = scoreInfoObj[0].Total_score;
                        } else {
                            course.Usual_score = '';
                            course.Experimental_score = '';
                            course.Total_score = '';
                        }
                    });
                });
                setTimeout(() => {
                    courseObj.sort((courseA, courseB) => {
                        return courseA.Course_startTime < courseB.Course_startTime;
                    });
                    res.json({
                        meta: {
                            message: '获取课程成绩成功',
                            status: 200
                        },
                        data: courseObj
                    })
                }, 500);
            }
        });
    });
});

//管理员登入验证
router.post('/adminLogin', (req, res) => {
    let { adminName, adminPwd } = req.body;
    db.query(`SELECT * FROM Admins WHERE Admin_name='${adminName}'`, (err, data) => {
        if (err) {
            throw err;
        } else if (data.length === 0) {
            res.json({
                meta: {
                    message: '没有此账号',
                    status: 400
                }
            });
        } else {
            let [{ Admin_name: name, Admin_pwd: pwd }] = data;
            if (adminPwd === pwd) { //判断密码是否正确
                //如果正确则生成一个token返回
                const rule = { name, pwd };
                jwt.sign(rule, 'secret', { expiresIn: 1800 }, (err, token) => {
                    if (err) throw err;
                    res.json({
                        meta: {
                            message: '登入成功',
                            status: 200
                        },
                        token: 'Bearer ' + token
                    });
                });
            } else {
                res.json({
                    meta: {
                        message: '密码错误',
                        status: 400
                    }
                });
            }
        }
    });
});

//获取最大的教师编号
router.get('/getMaxTeacherNum', passport.authenticate('jwt', { session: false }), (req, res) => {
    let sql = 'SELECT Teacher_num FROM Teachers';
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '未获取到最大编号',
                    status: 200
                },
                num: 1000
            });
        } else {
            let numArr = [];
            result.forEach(v => {
                numArr.push(v.Teacher_num);
            });
            let maxNum = Math.max(...numArr);
            res.json({
                meta: {
                    message: '获取到最大编号',
                    status: 200
                },
                num: maxNum
            });
        }
    })
});

//添加教师
router.post('/addTeacher', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        teaNum,
        name,
        pwd,
        sex,
        email,
        level,
        tel,
        qq
    } = req.body;
    let checkTeacherNumSql = `SELECT * FROM Teachers WHERE Teacher_num = ${teaNum}`;
    db.query(checkTeacherNumSql, (err, result) => {
        if (err) throw err;
        if (result.length !== 0) {
            res.json({
                meta: {
                    message: '此账户存在',
                    status: 400
                }
            });
        } else {
            let addTeacherSql = `INSERT INTO 
                Teachers(Teacher_num,Teacher_name,Teacher_pwd,Teacher_sex,Teacher_level,Teacher_tel,Teacher_email,Teacher_qq)
                VALUE(${teaNum},'${name}','${pwd}','${sex}','${level}','${tel}','${email}','${qq}')`;
            db.query(addTeacherSql, (err, result1) => {
                if (err) throw err;
                if (result1) {
                    res.json({
                        meta: {
                            message: '创建教师成功',
                            status: 200
                        }
                    });
                }
            });
        }
    });
});

//保存修改
router.post('/editTeacherInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        teaNum,
        name,
        pwd,
        sex,
        level,
        tel,
        email,
        qq,
        id
    } = req.body;
    let checkTeacherNumSql = `SELECT Teacher_num FROM Teachers WHERE Teacher_id = ${id}`;
    db.query(checkTeacherNumSql, (err, result) => {
        if (err) throw err;
        if (result[0].Teacher_num === teaNum) {
            let editTeacherInfoSql = `UPDATE Teachers SET Teacher_name = '${name}',
                                                        Teacher_pwd = '${pwd}',
                                                        Teacher_sex = '${sex}',
                                                        Teacher_level = '${level}',
                                                        Teacher_tel = '${tel}',
                                                        Teacher_email = '${email}',
                                                        Teacher_qq = '${qq}'
                                                        WHERE Teacher_id = ${id}`;
            db.query(editTeacherInfoSql, (err, result2) => {
                if (err) throw err;
                res.json({
                    meta: {
                        message: '修改成功',
                        status: 200
                    }
                });
            });
        } else {
            let teacherNumSql = `SELECT * FROM Teachers WHERE Teacher_num = ${teaNum}`;
            db.query(teacherNumSql, (err, result1) => {
                if (err) throw err;
                if (result1.length !== 0) {
                    res.json({
                        meta: {
                            message: '此账户存在',
                            status: 400
                        }
                    });
                } else {
                    let editTeacherInfoSql = `UPDATE Teachers SET Teacher_num = ${teaNum}, 
                                                                Teacher_name = '${name}',
                                                                Teacher_pwd = '${pwd}',
                                                                Teacher_sex = '${sex}',
                                                                Teacher_level = '${level}',
                                                                Teacher_tel = '${tel}',
                                                                Teacher_email = '${email}',
                                                                Teacher_qq = '${qq}'
                                                                WHERE Teacher_id = ${id}`;
                    db.query(editTeacherInfoSql, (err, result3) => {
                        if (err) throw err;
                        res.json({
                            meta: {
                                message: '修改成功',
                                status: 200
                            }
                        });
                    });
                }
            });
        }
    });
});

//获取课程id
router.post('/getCourseId', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let getTeacherNameSql = `SELECT Teacher_name FROM Teachers WHERE Teacher_id = ${id}`;
    db.query(getTeacherNameSql, (err, teacherNameArr) => {
        if (err) throw err;
        let teacherName = teacherNameArr[0].Teacher_name;
        let getCourseIdSql = `SELECT Course_id FROM Courses WHERE Course_author = '${teacherName}'`;
        db.query(getCourseIdSql, (err, courseIdArr) => {
            if (err) throw err;
            res.json({
                meta: {
                    message: '获取课程id成功',
                    status: 200
                },
                data: courseIdArr
            });
        });
    });
});

//删除教师
router.post('/deleteTeacher', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `DELETE FROM Teachers WHERE Teacher_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '教师删除成功',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '教师删除失败',
                    status: xxxx
                }
            });
        }
    });
});

//获取学生号
router.get('/getStudentNum', passport.authenticate('jwt', { session: false }), (req, res) => {
    let year = new Date().getFullYear();
    let sql = `SELECT Student_num FROM Students`;
    db.query(sql, (err, studentNumArr) => {
        if (err) throw err;
        if (studentNumArr.length === 0) {
            res.json({
                meta: {
                    message: '获取成功',
                    status: 200
                },
                data: year * 1000000
            });
        } else {
            let arr = [];
            studentNumArr.forEach(v => {
                arr.push(v.Student_num);
            });
            let maxNum = Math.max(...arr);
            if (year * 1000000 > maxNum) { //判断是否是新一届学生
                res.json({
                    meta: {
                        message: '获取成功',
                        status: 200
                    },
                    data: year * 1000000
                });
            } else {
                res.json({
                    meta: {
                        message: '获取成功',
                        status: 200
                    },
                    data: maxNum
                });
            }
        }
    });
});

//添加学生
router.post('/addStudent', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        stuNum,
        name,
        pwd,
        sex,
        email,
        tel,
        qq
    } = req.body;
    let checkStudentNumSql = `SELECT * FROM Students WHERE Student_num = ${stuNum}`;
    db.query(checkStudentNumSql, (err, result) => {
        if (err) throw err;
        if (result.length !== 0) {
            res.json({
                meta: {
                    message: '此账户存在',
                    status: 400
                }
            });
        } else {
            let addStudentSql = `INSERT INTO 
                Students(Student_num,Student_name,Student_pwd,Student_sex,Student_tel,Student_email,Student_qq)
                VALUE(${stuNum},'${name}','${pwd}','${sex}','${tel}','${email}','${qq}')`;
            db.query(addStudentSql, (err, result1) => {
                if (err) throw err;
                if (result1) {
                    res.json({
                        meta: {
                            message: '创建学生成功',
                            status: 200
                        }
                    });
                }
            });
        }
    });
});

//保存学生信息修改
router.post('/editStudentInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        stuNum,
        name,
        pwd,
        sex,
        grade,
        major,
        tel,
        email,
        qq,
        id
    } = req.body;
    let checkStudentNumSql = `SELECT Student_num FROM Students WHERE Student_id = ${id}`;
    db.query(checkStudentNumSql, (err, result) => {
        if (err) throw err;
        if (result[0].Student_num === stuNum) {
            let editStudentInfoSql = `UPDATE Students SET Student_name = '${name}',
                                                        Student_pwd = '${pwd}',
                                                        Student_sex = '${sex}',
                                                        Student_grade = '${grade}',
                                                        Student_major = '${major}',
                                                        Student_tel = '${tel}',
                                                        Student_email = '${email}',
                                                        Student_qq = '${qq}'
                                                        WHERE Student_id = ${id}`;
            db.query(editStudentInfoSql, (err, result2) => {
                if (err) throw err;
                res.json({
                    meta: {
                        message: '修改成功',
                        status: 200
                    }
                });
            });
        } else {
            let studentNumSql = `SELECT * FROM Students WHERE Student_num = ${stuNum}`;
            db.query(studentNumSql, (err, result1) => {
                if (err) throw err;
                if (result1.length !== 0) {
                    res.json({
                        meta: {
                            message: '此账户存在',
                            status: 400
                        }
                    });
                } else {
                    let editStudentInfoSql = `UPDATE Students SET Student_num = ${stuNum}, 
                                                                Student_name = '${name}',
                                                                Student_pwd = '${pwd}',
                                                                Student_sex = '${sex}',
                                                                Student_grade = '${grade}',
                                                                Student_major = '${major}',
                                                                Student_tel = '${tel}',
                                                                Student_email = '${email}',
                                                                Student_qq = '${qq}'
                                                                WHERE Student_id = ${id}`;
                    db.query(editStudentInfoSql, (err, result3) => {
                        if (err) throw err;
                        res.json({
                            meta: {
                                message: '修改成功',
                                status: 200
                            }
                        });
                    });
                }
            });
        }
    });
});

//删除学生信息
router.post('/deleteStudent', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let deleteSelfWorksSql = `DELETE FROM SelfWorks WHERE Student_id = ${id}`;
    db.query(deleteSelfWorksSql, (err, result) => {
        if (err) throw err;
        if (result) {
            let deleteScoresSql = `DELETE FROM Scores WHERE Student_id = ${id}`;
            db.query(deleteScoresSql, (err, result1) => {
                if (err) throw err;
                if (result1) {
                    let deleteStudentSql = `DELETE FROM Students WHERE Student_id = ${id}`;
                    db.query(deleteStudentSql, (err, result2) => {
                        if (err) throw err;
                        if (result2) {
                            res.json({
                                meta: {
                                    message: '删除成功',
                                    status: 200
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

//获取管理员列表
router.get('/getAdminList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let sql = `SELECT * FROM Admins`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '获取管理员列表成功',
                    status: 200
                },
                data: result
            });
        }
    });
});

router.post('/addAdmins', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        name,
        pwd,
        status
    } = req.body;
    let checkAdminNameSql = `SELECT * FROM Admins WHERE Admin_name = '${name}'`;
    db.query(checkAdminNameSql, (err, result) => {
        if (err) throw err;
        if (result.length !== 0) {
            res.json({
                meta: {
                    message: '管理员已存在',
                    status: 400
                }
            });
        } else {
            let sql = `INSERT INTO Admins(Admin_name,Admin_pwd,Admin_status)
                                VALUE('${name}','${pwd}',${status})`;
            db.query(sql, (err, result1) => {
                if (err) throw err;
                if (result1) {
                    res.json({
                        meta: {
                            message: '添加成功',
                            status: 200
                        }
                    });
                }
            });
        }
    });
});

//获取管理员信息
router.post('/getAdminInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `SELECT * FROM Admins WHERE id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '获取管理员信息成功',
                    status: 200
                },
                data: result[0]
            });
        }
    })
});

//保存管理员信息修改
router.post('/editAdminInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        id,
        name,
        pwd,
        status
    } = req.body;
    let checkAdminNameSql = `SELECT Admin_name FROM Admins WHERE id = ${id}`;
    db.query(checkAdminNameSql, (err, adminNameArr1) => {
        if (err) throw err;
        if (adminNameArr1[0].Admin_name !== name) {
            let adminNameSql = `SELECT * FROM Admins WHERE Admin_name = '${name}'`;
            db.query(adminNameSql, (err, adminNameArr2) => {
                if (err) throw err;
                if (adminNameArr2.length !== 0) {
                    res.json({
                        meta: {
                            message: '此账户已存在',
                            status: 400
                        }
                    });
                } else {
                    let saveAdminInfoSql = `UPDATE Admins SET
                                                Admin_name = '${name}',
                                                Admin_pwd = '${pwd}',
                                                Admin_status = ${status}
                                                WHERE id = ${id}`;
                    db.query(saveAdminInfoSql, (err, result) => {
                        if (err) throw err;
                        if (result) {
                            res.json({
                                meta: {
                                    message: '保存成功',
                                    status: 200
                                }
                            });
                        }
                    });
                }
            })
        } else {
            let saveAdminInfoSql = `UPDATE Admins SET
                                        Admin_pwd = '${pwd}',
                                        Admin_status = ${status}
                                        WHERE id = ${id}`;
            db.query(saveAdminInfoSql, (err, result) => {
                if (err) throw err;
                if (result) {
                    res.json({
                        meta: {
                            message: '保存成功',
                            status: 200
                        }
                    });
                }
            });
        }
    });
});
//删除管理员
router.post('/deleteAdmin', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `DELETE FROM Admins WHERE id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '删除成功',
                    status: 200
                }
            });
        }
    });
});

//检查管理员权限
router.get('/checkAdminRight', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { name } = req.user;
    let sql = `SELECT Admin_status FROM Admins WHERE Admin_name = '${name}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result[0].Admin_status === 0) {
            res.json({
                meta: {
                    message: '超级管理员',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '普通管理员',
                    status: 400
                }
            });
        }
    })
});

//获取班级列表
router.get('/getClassList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let sql = 'SELECT * FROM Classes';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '获取班级列表成功',
                status: 200
            },
            data: result
        });
    })
});

//创建班级
router.post('/addClasses', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { grade, major } = req.body;
    let checkClassSql = `SELECT * FROM Classes WHERE Class_grade = '${grade}' AND Class_major = '${major}'`;
    db.query(checkClassSql, (err, result) => {
        if (err) throw err;
        if (result.length !== 0) {
            res.json({
                meta: {
                    message: '班级已存在',
                    status: 400
                }
            });
        } else {
            let addClassSql = `INSERT INTO Classes(Class_grade,Class_major)
                                        VALUE('${grade}','${major}')`;
            db.query(addClassSql, (err, result1) => {
                if (err) throw err;
                if (result1) {
                    res.json({
                        meta: {
                            message: '创建成功',
                            status: 200
                        }
                    });
                }
            });
        }
    });
});

//获取班级学生信息
router.post('/getClassStudentList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        pageSize,
        currentPage,
        query,
        major,
        grade
    } = req.body;
    let sql = '';
    if (query) {
        sql = `SELECT * FROM Students WHERE Student_name LIKE '%${query}%' AND Student_grade = '${grade}' AND Student_major = '${major}'`;
    } else {
        sql = `SELECT * FROM Students WHERE Student_grade = '${grade}' AND Student_major = '${major}'`;
    }
    db.query(sql, (err, result) => {
        if (err) throw err;
        let total = result.length;
        let stuData = result.splice(pageSize * currentPage - pageSize, pageSize);
        res.json({
            total,
            data: stuData,
            meta: {
                message: '获取班级学生列表成功',
                status: 200
            }
        });
    });
});

//获取未分配班级学生和当前班级学生信息
router.post('/getAllStudentList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        grade,
        major
    } = req.body;
    let notClassStudentSql = `SELECT Student_id,Student_num,Student_name FROM Students WHERE Student_grade = '' AND Student_major = ''`;
    db.query(notClassStudentSql, (err, notClassStudentArr) => {
        if (err) throw err;
        let getClassStudentSql = `SELECT Student_id,Student_num,Student_name FROM Students WHERE Student_grade = '${grade}' AND Student_major = '${major}'`;
        db.query(getClassStudentSql, (err, classStudentArr) => {
            if (err) throw err;
            let allStudentArr = classStudentArr.concat(notClassStudentArr);
            res.json({
                meta: {
                    message: '数据获取成功',
                    status: 200
                },
                data: {
                    notClassStudentArr,
                    classStudentArr,
                    allStudentArr
                }
            });
        });
    });
});

//将当前学生分配给某个班级
router.post('/updateClassStudent', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        id,
        grade,
        major
    } = req.body;
    let sql = `UPDATE Students SET Student_grade = '${grade}',
                                Student_major = '${major}'
                                WHERE Student_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '分配成功',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '分配失败',
                    status: 400
                }
            });
        }
    });
});

//将学生从当前班级移除
router.post('/updateNotClassStudent', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `UPDATE Students SET Student_grade = '',
                                Student_major = ''
                                WHERE Student_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '移除成功',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '移除失败',
                    status: 400
                }
            });
        }
    });
});
//保存编辑班级信息
router.post('/saveClassInfo', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        id,
        grade,
        major,
        oldGrade,
        oldMajor
    } = req.body;
    let checkClassSql = `SELECT * FROM Classes WHERE Class_grade = '${grade}' AND Class_major = '${major}'`;
    db.query(checkClassSql, (err, classArr) => {
        if (err) throw err;
        if (classArr.length !== 0) {
            res.json({
                meta: {
                    message: '该班级已存在',
                    status: 400
                }
            });
        } else {
            let updateStudentSql = `UPDATE Students SET Student_grade = '${grade}',
                                                                Student_major = '${major}'
                                                                WHERE Student_grade = '${oldGrade}' AND Student_major = '${oldMajor}'`;
            db.query(updateStudentSql, (err, result) => {
                if (err) throw err;
                if (result) {
                    let updateCourseSql = `UPDATE Courses SET Course_grade = '${grade}',
                                                                Course_major = '${major}'
                                                                WHERE Course_grade = '${oldGrade}' AND Course_major = '${oldMajor}'`;
                    db.query(updateCourseSql, (err, result2) => {
                        if (err) throw err;
                        if (result2) {
                            let updateClassSql = `UPDATE Classes SET Class_grade = '${grade}',
                                                                        Class_major = '${major}'
                                                                        WHERE Class_id = ${id}`;
                            db.query(updateClassSql, (err, result1) => {
                                if (err) throw err;
                                if (result1) {
                                    res.json({
                                        meta: {
                                            message: '修改成功',
                                            status: 200
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

//删除班级
router.post('/deleteClass', passport.authenticate('jwt', { session: false }), (req, res) => {
    let { id } = req.body;
    let sql = `DELETE FROM Classes WHERE Class_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '删除成功',
                    status: 200
                }
            });
        }
    });
});

//将班级所有学生移除班级
router.post('/updateClassAllStudentStatus', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        grade,
        major
    } = req.body;
    let sql = `UPDATE Students SET Student_grade = '',
                                Student_major = ''
                                WHERE Student_grade = '${grade}' AND Student_major = '${major}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json({
            meta: {
                message: '更新成功',
                status: 200
            }
        });
    });
});
//检查学生手机号是否与该学生进行绑定
router.post('/checkStudentTel', (req, res) => {
    let {
        stuNum,
        tel
    } = req.body;
    let sql = `SELECT * FROM Students WHERE Student_num = ${stuNum} AND Student_tel = '${tel}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '该学生与该手机未进行绑定',
                    status: 400
                }
            });
        } else {
            res.json({
                meta: {
                    message: '该学生与该手机进行了绑定',
                    status: 200
                }
            });
        }
    });
});

//检查教师手机号是否与该教师进行绑定
router.post('/checkTeacherTel', (req, res) => {
    let {
        teaNum,
        tel
    } = req.body;
    let sql = `SELECT * FROM Teachers WHERE Teacher_num = ${teaNum} AND Teacher_tel = '${tel}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.json({
                meta: {
                    message: '该教师与该手机未进行绑定',
                    status: 400
                }
            });
        } else {
            res.json({
                meta: {
                    message: '该教师与该手机进行了绑定',
                    status: 200
                }
            });
        }
    });
});


// 短信接口
router.post('/sendSms', (req, res) => {
    let { phoneNumber } = req.body;
    let sms = require('./sms');
    let randomNumber = 100000 + Math.floor(899999 * Math.random());
    sms(`+86${phoneNumber}`, randomNumber);
    res.json({
        meta: {
            message: '获取验证码成功',
            status: 200
        },
        data: randomNumber
    });
});

//修改学生密码
router.post('/updateStudentPwd', (req, res) => {
    let {
        num,
        pwd
    } = req.body;
    let sql = `UPDATE Students SET Student_pwd = '${pwd}' WHERE Student_num = ${num}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '修改密码成功',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '修改密码失败',
                    status: 400
                }
            });
        }
    });
});

//修改教师密码
router.post('/updateTeacherPwd', (req, res) => {
    let {
        num,
        pwd
    } = req.body;
    let sql = `UPDATE Teachers SET Teacher_pwd = '${pwd}' WHERE Teacher_num = ${num}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            res.json({
                meta: {
                    message: '修改密码成功',
                    status: 200
                }
            });
        } else {
            res.json({
                meta: {
                    message: '修改密码失败',
                    status: 400
                }
            });
        }
    });
});

//获取班级课程列表
router.post('/getClassCourseList', passport.authenticate('jwt', { session: false }), (req, res) => {
    let {
        id
    } = req.body;
    let getClassSql = `SELECT * FROM Classes WHERE Class_id = ${id}`;
    db.query(getClassSql, (err, classArr) => {
        if (err) throw err;
        if (classArr !== 0) {
            let grade = classArr[0].Class_grade;
            let major = classArr[0].Class_major;
            let getCoursesSql = `SELECT Course_id FROM Courses WHERE Course_grade = '${grade}' AND Course_major = '${major}'`;
            db.query(getCoursesSql, (err, courseArr) => {
                if (err) throw err;
                if (courseArr.length !== 0) {
                    res.json({
                        meta: {
                            message: '获取到班级对应的所有课程',
                            status: 200
                        },
                        data: courseArr
                    });
                } else {
                    res.json({
                        meta: {
                            message: '没有班级所对应的课程',
                            status: 400
                        }
                    });
                }
            });
        } else {
            res.json({
                meta: {
                    message: '未获取班级',
                    status: 400
                }
            });
        }
    });
});


module.exports = router
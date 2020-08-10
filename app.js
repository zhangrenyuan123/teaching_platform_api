var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');
const passport = require('passport');
const uploadFilesRouter = require('./routes/uploadFiles');
const mongoApiRouter = require('./routes/mongoApi');
const downloadFileRouter = require('./routes/downloadFIle');


// require('./config/connect_mongodb');

var app = express();

//跨域
app.use(cors());

// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); //项目上线后改成页面的地址
//     res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     next();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//使用bodyParser中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//passport 初始化
app.use(passport.initialize());
//配置passport
require('./config/passport')(passport);


app.use('/', indexRouter);
//api请求
app.use('/api', apiRouter);
//文件上传
app.use('/uploadFiles', uploadFilesRouter);
//mongo数据库操作接口路由
app.use('/api/mongo', mongoApiRouter);
//下载文件接口
app.use('/api/downloadFile', downloadFileRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// import './config/connect_db'

app.listen(3000, () => {
    console.log('Server is running...');
})

module.exports = app;
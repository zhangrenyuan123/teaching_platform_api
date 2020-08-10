// 连接mondb数据库
let mongo = require('mongoose');

//数据库连接的地址 teaching_platform表示数据库
const url = "mongodb://127.0.0.1/teaching_platform";

//连接数据库
mongo.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

//取得数据库连接状态
const db = mongo.connection;

//当数据库连接失败，打印错误信息
db.on("error", (err) => {
    console.log("faild to connect Mongodb...");
});

//数据库连接成功
db.once("open", () => {
    console.log("succeed to connect Mongodb...");
});
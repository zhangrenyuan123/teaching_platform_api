// const mysql = require('mysql')
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '044032',
//     database: 'teaching_platform'
// });
// module.exports = connection;

const mysql = require('mysql');

//创建连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '044032',
    database: 'teaching_platform',
    connectionLimit: 50 //连接数量限制
});

let db = {
    query(sql, callback) {
        //连接数据库
        pool.getConnection((err, connection) => {
            if (err) {
                console.log('连接失败');
                throw err;
            } else {
                connection.query(sql, (err, result) => {
                    callback(err, result);
                    connection.release(); //释放连接
                })
            }
        })
    }
};

module.exports = db;
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./connect_mysql');
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';


module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        // console.log(jwt_payload);
        // let sql = `SELECT * FROM Students WHERE Student_num = ${jwt_payload.num}`;
        // db.query(sql, (err, result) => {
        //     if (err) throw err;
        //     // console.log(result.length === 0);
        //     if (result.length === 0) {
        //         return done(null, false);
        //     } else {
        //         // console.log(result);
        //         return done(null, result);
        //     }
        // })
        return done(null, jwt_payload);
    }));
};
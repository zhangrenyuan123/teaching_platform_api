let mongo = require('mongoose');


let usersScheam = new mongo.Schema({
    name: String,
    age: Number
});

let usersModel = mongo.model("users", usersScheam, "users");

module.exports = {
    usersModel
}
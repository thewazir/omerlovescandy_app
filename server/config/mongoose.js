var mongoose = require('mongoose'),
    crypto = require('crypto');

module.exports = function(config){
    /*
    * MongoDB connection
    */
    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error',console.error.bind(console,'connection error...'));
    db.once('open',function callback(){
        console.log('mongolab connection open');
    });

    var userSchema = mongoose.Schema({
        firstName: String,
        lastName: String,
        userName: String,
        salt: String,
        hashed_pwd: String,
        roles: [String]
    });

    userSchema.methods = {
        authenticate: function(passwordToMatch){
            return hashPwd(this.salt, passwordToMatch) === this.hashed_pwd;
        }
    }

    var User = mongoose.model('User', userSchema);

    User.find({}).exec(function(err,collection){
        if(collection.length === 0){
            var salt,hash;
            salt = createSalt();
            hash = hashPwd(salt,'leo')
            User.create({firstName:'Leo',lastName:'Tolstoy',userName:'leo', salt:salt, hashed_pwd:hash, roles:['admin']});
            salt = createSalt();
            hash = hashPwd(salt,'emily')
            User.create({firstName:'Emily',lastName:'Bronte',userName:'emily', salt:salt, hashed_pwd:hash, roles:[]});
            salt = createSalt();
            hash = hashPwd(salt,'cormac')
            User.create({firstName:'Cormac',lastName:'McCarthy',userName:'cormac', salt:salt, hashed_pwd:hash});
        }
    });
}

function createSalt(){
    return crypto.randomBytes(128).toString('base64');
}

function hashPwd(salt,pwd){
    var hmac = crypto.createHmac('sha1', salt);
    return hmac.update(pwd).digest('hex');
}
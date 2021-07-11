const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// 不用specify username和 pwd，因為 passport-local-mongoose會幫我們
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// add username and pwd field in UserSchema
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);
module.exports = User;
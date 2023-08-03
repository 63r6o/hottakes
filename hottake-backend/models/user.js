const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        minLength: [
            3,
            "The username has to be at least 3 characters long. '{VALUE}' is too short.",
        ],
        maxLength: [25, "The username can not be longer than 25 characters."],
    },
    passwordHash: String,
    takes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Take",
        },
    ],
    likedTakes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Take",
        },
    ],
    dislikedTakes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Take",
        },
    ],
});

userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject.updatedAt;
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHash;
    },
});

userSchema.set("timestamps", true);

userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require("mongoose");

const takeSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: [1, "The take can not be empty"],
        maxLength: [
            240,
            "The take is too long, it has to bee less than 240 characters long",
        ],
        required: [true, "Content is required"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    dislikedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Take",
    },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Take",
        },
    ],
});

takeSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        if (returnedObject.likedBy) {
            returnedObject.likes = returnedObject.likedBy.length;
        }
        if (returnedObject.dislikedBy) {
            returnedObject.dislikes = returnedObject.dislikedBy.length;
        }

        delete returnedObject.likedBy;
        delete returnedObject.dislikedBy;
        delete returnedObject.updatedAt;
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

takeSchema.set("timestamps", true);

const Take = mongoose.model("Take", takeSchema);

module.exports = Take;

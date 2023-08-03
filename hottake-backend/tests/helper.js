const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Take = require("../models/take");

const initialUsers = [
    { username: "RowanAtkinson", password: "johnnyEnglish12" },
    { username: "HughLaurie", password: "blackadder1234" },
    { username: "SonGoku", password: "budokaitenkaichi" },
];

const initialTakes = (users) => {
    return [
        {
            content: "Java applets are the future",
            user: users[0]._id,
            likedBy: [users[2]._id],
            dislikedBy: [users[1]._id],
            replyTo: null,
            replies: [],
        },
        {
            content: "HTMX is mid",
            user: users[1]._id,
            likedBy: [],
            dislikedBy: [users[2]._id],
            replyTo: null,
            replies: [],
        },
        {
            content: "SPAs were a mistake",
            user: users[1]._id,
            likedBy: [users[0]._id, users[2]._id],
            dislikedBy: [],
            replyTo: null,
            replies: [],
        },
        {
            content: "The Last Jedi is unironically good",
            user: users[2]._id,
            likedBy: [users[1]._id],
            dislikedBy: [users[0]._id],
            replyTo: null,
            replies: [],
        },
    ];
};

const createReply = (user, take) => {
    return new Take({
        content: "It's literally me",
        user: user._id,
        likedBy: [],
        dislikedBy: [],
        replyTo: take._id,
        replies: [],
    });
};

const usersInDb = async () => {
    const users = await User.find({});
    return users.map((u) => u.toJSON());
};

const takesInDb = async () => {
    const takes = await Take.find({});
    return takes.map((t) => t.toJSON());
};

const topLevelTakesInDb = async () => {
    const topLevelTakes = await Take.find({ replyTo: null });
    return topLevelTakes.map((t) => t.toJSON());
};

const getTokenFrom = (user) => {
    const userForToken = {
        username: user.username,
        id: user._id,
    };

    return jwt.sign(userForToken, process.env.SECRET);
};

module.exports = {
    initialUsers,
    initialTakes,
    createReply,
    usersInDb,
    takesInDb,
    topLevelTakesInDb,
    getTokenFrom,
};

const bcrypt = require("bcrypt");
const { userExtractor } = require("../utils/middleware");
const User = require("../models/user");
const Take = require("../models/take");
const usersRouter = require("express").Router();

usersRouter.get("/", userExtractor, async (req, res) => {
    const users = await User.find({});

    res.json(users);
});

usersRouter.get("/:userid", userExtractor, async (req, res) => {
    const user = await User.findById(req.params.userid).populate("takes");
    if (!user) return res.status(404).end();

    res.json(user);
});

usersRouter.get("/:userid/takes", userExtractor, async (req, res) => {
    const usersTakes = await User.findById(req.params.userid, {
        takes: 1,
    }).populate("takes", { user: 0 });
    if (!usersTakes) return res.status(404).end();

    res.json(usersTakes);
});

usersRouter.get("/:userid/likedtakes", userExtractor, async (req, res) => {
    const usersLikes = await User.findById(req.params.userid, {
        likedTakes: 1,
    }).populate({
        path: "likedTakes",
        select: { content: 1, user: 1 },
        populate: { path: "user", select: { username: 1 } },
    });

    if (!usersLikes) return res.status(404).end();

    res.json(usersLikes);
});

usersRouter.get("/:userid/dislikedtakes", userExtractor, async (req, res) => {
    const usersDisikes = await User.findById(req.params.userid, {
        dislikedTakes: 1,
    }).populate({
        path: "dislikedTakes",
        select: { content: 1, user: 1 },
        populate: { path: "user", select: { username: 1 } },
    });

    if (!usersDisikes) return res.status(404).end();

    res.json(usersDisikes);
});

usersRouter.post("/", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({
            error: "Username and password are required for user registration.",
        });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({ username, passwordHash });

    const savedUser = await user.save();

    res.status(201).json(savedUser);
});

module.exports = usersRouter;

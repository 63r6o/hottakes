const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const loginRouter = require("express").Router();

loginRouter.post("/", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const passwordCorrect =
        user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return res.status(401).json({ error: "invalid username or password" });
    }

    const userForToken = {
        username,
        id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: 60 * 60,
    });

    res.status(200).send({ token, username, id: user._id });
});

module.exports = loginRouter;

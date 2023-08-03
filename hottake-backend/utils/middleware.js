const jwt = require("jsonwebtoken");
const User = require("../models/user");

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (err, req, res, next) => {
    // todo CastError
    // todo VersionError
    if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
    } else if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "token expired" });
    } else if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "invalid token" });
    }

    next(err);
};

const tokenExtractor = (req, res, next) => {
    const authorization = req.get("authorization");

    if (authorization && authorization.startsWith("Bearer ")) {
        req.token = authorization.replace("Bearer ", "");
    } else {
        req.token = null;
    }

    next();
};

const userExtractor = async (req, res, next) => {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    if (!decodedToken.id) {
        return res.status(401).json({ error: "token invalid" });
    }

    req.user = await User.findById(decodedToken.id);

    next();
};

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor,
};

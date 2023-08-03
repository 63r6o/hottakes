const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const cors = require("cors");

const config = require("./utils/config");
const loginRouter = require("./controllers/login");
const usersRouter = require("./controllers/users");
const takesRouter = require("./controllers/takes");

const middleware = require("./utils/middleware");
const app = express();

console.log("connecting to MongoDB...");

mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch((err) => {
        console.error("error connecting to MongoDB:", err);
    });

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(middleware.tokenExtractor);

app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/takes", takesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

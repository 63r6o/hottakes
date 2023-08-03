const takesRouter = require("express").Router();
const { userExtractor } = require("../utils/middleware");
const Take = require("../models/take");

takesRouter.get("/", async (req, res) => {
    const takes = await Take.find({ replyTo: null }).populate("user", {
        username: 1,
    });

    res.json(takes);
});

takesRouter.get("/:takeid", async (req, res) => {
    const take = await Take.findById(req.params.takeid)
        .populate("user", {
            username: 1,
        })
        .populate("replies");

    if (!take) return res.status(404).end();

    res.json(take);
});

takesRouter.get("/:takeid/replies", async (req, res) => {
    const replies = await Take.findById(req.params.takeid, {
        replies: 1,
    }).populate("replies");
    if (!replies) return res.status(404).end();

    res.json(replies);
});

takesRouter.post("/", userExtractor, async (req, res) => {
    const { user } = req;
    if (!req.body.content)
        return res.status(400).json({
            error: "Content is required",
        });

    const newTake = new Take({
        content: req.body.content,
        user: user._id,
        likedBy: [],
        dislikedBy: [],
        replyTo: null,
        replies: [],
    });

    const savedTake = await newTake.save();
    await savedTake.populate("user", { username: 1 });

    user.takes = user.takes.concat(savedTake._id);
    await user.save();

    res.status(201).json(savedTake);
});

takesRouter.post("/:takeid/replies", userExtractor, async (req, res) => {
    const { user } = req;
    if (!req.body.content) return res.status(400).end();

    const takeToReply = await Take.findById(req.params.takeid);
    if (!takeToReply) return res.status(404).end();

    const newTake = new Take({
        content: req.body.content,
        user: user._id,
        likedBy: [],
        dislikedBy: [],
        replyTo: takeToReply._id,
        replies: [],
    });

    const savedTake = await newTake.save();
    await savedTake.populate("user", { username: 1 });

    takeToReply.replies = takeToReply.replies.concat(savedTake._id);
    await takeToReply.save();

    user.takes = user.takes.concat(savedTake._id);
    await user.save();

    res.status(201).json(savedTake);
});

takesRouter.post("/:takeid/likes", userExtractor, async (req, res) => {
    const { user } = req;

    const take = await Take.findById(req.params.takeid);
    if (!take) return res.status(404).end();
    if (take.user.equals(user._id))
        return res.status(400).json({
            error: "Liking your own take is not allowed.",
        });
    if (user.likedTakes.includes(take._id)) return res.json(take);

    user.likedTakes = user.likedTakes.concat(take._id);
    user.dislikedTakes = user.dislikedTakes.filter((t) => !t.equals(take._id));

    take.likedBy = take.likedBy.concat(user._id);
    take.dislikedBy = take.dislikedBy.filter((u) => !u.equals(user._id));

    await user.save();
    const likedTake = await take.save();
    await likedTake.populate("user", { username: 1 });

    return res.json(likedTake);
});

takesRouter.post("/:takeid/dislikes", userExtractor, async (req, res) => {
    const { user } = req;

    const take = await Take.findById(req.params.takeid);
    if (!take) return res.status(404).end();
    if (take.user.equals(user._id))
        return res.status(400).json({
            error: "Disliking your own take is not allowed.",
        });
    if (user.dislikedTakes.includes(take._id)) return res.json(take);

    user.dislikedTakes = user.dislikedTakes.concat(take._id);
    user.likedTakes = user.likedTakes.filter((t) => !t.equals(take._id));

    take.dislikedBy = take.dislikedBy.concat(user._id);
    take.likedBy = take.likedBy.filter((u) => !u.equals(user._id));

    await user.save();
    const dislikedTake = await take.save();
    await dislikedTake.populate("user", { username: 1 });

    return res.json(dislikedTake);
});

takesRouter.delete(
    "/:takeid/likes/:userid",
    userExtractor,
    async (req, res) => {
        const { user } = req;
        if (user.id !== req.params.userid)
            return res.status(403).json({
                error: "You do not have permission to delete this like.",
            });

        const take = await Take.findById(req.params.takeid);
        if (!take) return res.status(404).end();

        user.likedTakes = user.likedTakes.filter((t) => !t.equals(take._id));
        take.likedBy = take.likedBy.filter((u) => !u.equals(user._id));

        await user.save();
        const returnedTake = await take.save();

        return res.json(returnedTake);
    }
);

takesRouter.delete(
    "/:takeid/dislikes/:userid",
    userExtractor,
    async (req, res) => {
        const { user } = req;
        if (user.id !== req.params.userid)
            return res.status(403).json({
                error: "You do not have permission to delete this dislike.",
            });

        const take = await Take.findById(req.params.takeid);
        if (!take) return res.status(404).end();

        user.dislikedTakes = user.dislikedTakes.filter((t) => !t.equals(take._id));
        take.dislikedBy = take.dislikedBy.filter((u) => !u.equals(user._id));

        await user.save();
        const returnedTake = await take.save();

        return res.json(returnedTake);
    }
);

module.exports = takesRouter;

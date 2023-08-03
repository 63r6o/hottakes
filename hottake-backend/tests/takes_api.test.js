const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const User = require("../models/user");
const Take = require("../models/take");
const {
    initialUsers,
    initialTakes,
    createReply,
    getTokenFrom,
} = require("./helper");

afterAll(async () => await mongoose.connection.close());

describe("when there are no takes", () => {
    beforeEach(async () => {
        await User.deleteMany({});
        await Take.deleteMany({});
        await User.insertMany(initialUsers);
    });

    test("the api returns an empyt array", async () => {
        const response = await api
            .get("/api/takes")
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body).toHaveLength(0);
    });
});

describe("when there are takes", () => {
    beforeEach(async () => {
        await User.deleteMany({});
        await Take.deleteMany({});
        const users = await User.insertMany(initialUsers);
        const takes = await Take.insertMany(initialTakes(users));

        for (const take of takes) {
            const reply = await createReply(users[0], take).save();
            take.replies = take.replies.concat(reply._id);
            await take.save();

            users[0].takes = users[0].takes.concat(reply._id);
            await users[0].save();

            for (const likedby of take.likedBy) {
                const user = users.find((u) => u._id === likedby);
                user.likedTakes = user.likedTakes.concat(take);
                await user.save();
            }

            for (const dislikedby of take.dislikedBy) {
                const user = users.find((u) => u._id === dislikedby);
                user.dislikedTakes = user.dislikedTakes.concat(take);
                await user.save();
            }
        }
    });

    test("the api returns them all in json", async () => {
        const users = await User.find({});
        const lengthAtStart = initialTakes(users).length;

        const response = await api
            .get("/api/takes")
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body).toHaveLength(lengthAtStart);
    });

    test("it is possible to access an individual one with it's id", async () => {
        const take = await Take.findOne({});

        const response = await api
            .get(`/api/takes/${take.id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body.content).toBe(take.content);
        expect(response.body.user.id).toBe(take.user.toString());
        expect(response.body.replyTo).toBe(take.replyTo);
        expect(response.body.replies).toHaveLength(take.replies.length);
        expect(response.body.likes).toBe(take.likedBy.length);
        expect(response.body.dislikes).toBe(take.dislikedBy.length);
    });

    test("it's possible to access the replies to an individual one with it's id", async () => {
        const take = await Take.findOne({});

        const response = await api
            .get(`/api/takes/${take.id}/replies`)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body.replies).toHaveLength(take.replies.length);
        const responseIds = response.body.replies.map((r) => r.id);
        const responseIdStrings = take.replies.map((r) => r.toString());
        expect(responseIds).toEqual(responseIdStrings);
    });

    describe("and the user is not logged in", () => {
        test("it's not possible to post a new take", async () => {
            const takesAtStart = await Take.find({});
            const newTake = { content: "We are a legion" };

            await api
                .post("/api/takes")
                .send(newTake)
                .expect(401)
                .expect("Content-Type", /application\/json/);

            const takesAtEnd = await Take.find({});
            expect(takesAtEnd).toHaveLength(takesAtStart.length);
        });

        test("it's not possible to like a take", async () => {
            const takeAtStart = await Take.findOne({});

            await api
                .post(`/api/takes/${takeAtStart.id}/likes`)
                .expect(401)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            expect(takeAtEnd.likedBy).toHaveLength(takeAtStart.likedBy.length);
        });

        test("it's not possible to dislike a take", async () => {
            const takeAtStart = await Take.findOne({});

            await api
                .post(`/api/takes/${takeAtStart.id}/dislikes`)
                .expect(401)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            expect(takeAtEnd.dislikedBy).toHaveLength(takeAtStart.dislikedBy.length);
        });

        test("it's not possible to remove a like from a take", async () => {
            const takeAtStart = await Take.findOne({ likedBy: { $ne: [] } });
            const userAtStart = await User.findById(takeAtStart.likedBy[0]);

            await api
                .delete(`/api/takes/${takeAtStart.id}/likes/${userAtStart.id}`)
                .expect(401)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            const userAtEnd = await User.findById(userAtStart._id);
            expect(takeAtEnd.likedBy).toHaveLength(takeAtStart.likedBy.length);
            expect(userAtEnd.likedTakes).toHaveLength(userAtStart.likedTakes.length);
        });

        test("it's not possible to remove a dislike from a take", async () => {
            const takeAtStart = await Take.findOne({ dislikedBy: { $ne: [] } });
            const userAtStart = await User.findById(takeAtStart.dislikedBy[0]);

            await api
                .delete(`/api/takes/${takeAtStart.id}/dislikes/${userAtStart.id}`)
                .expect(401)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            const userAtEnd = await User.findById(userAtStart._id);
            expect(takeAtEnd.dislikedBy).toHaveLength(takeAtStart.dislikedBy.length);
            expect(userAtEnd.dislikedTakes).toHaveLength(
                userAtStart.dislikedTakes.length
            );
        });
    });

    describe("and the user is logged in", () => {
        test("it's not possible to post a take without a content", async () => {
            const userAtStart = await User.findOne({});
            const token = getTokenFrom(userAtStart);

            const takesAtStart = await Take.find({});
            const newTake = {
                gibberish: "Tottenham could easily win the PL this year",
            };

            await api
                .post("/api/takes")
                .set("Authorization", `Bearer ${token}`)
                .send(newTake)
                .expect(400)
                .expect("Content-Type", /application\/json/);

            const takesAtEnd = await Take.find({});
            const userAtEnd = await User.findById(userAtStart._id);

            expect(takesAtEnd).toHaveLength(takesAtStart.length);
            expect(userAtEnd.takes).toHaveLength(userAtStart.takes.length);
        });
        test("it's possible to post a new take", async () => {
            const userAtStart = await User.findOne({});
            const token = getTokenFrom(userAtStart);

            const takesAtStart = await Take.find({});
            const newTake = {
                content: "Mbappe was the MVP of the final, not Messi",
            };

            await api
                .post("/api/takes")
                .set("Authorization", `Bearer ${token}`)
                .send(newTake)
                .expect(201)
                .expect("Content-Type", /application\/json/);

            const takesAtEnd = await Take.find({});
            const userAtEnd = await User.findById(userAtStart._id);

            expect(takesAtEnd).toHaveLength(takesAtStart.length + 1);
            expect(userAtEnd.takes).toHaveLength(userAtStart.takes.length + 1);
        });

        test("it's possible to reply to a take", async () => {
            const userAtStart = await User.findOne({});
            const token = getTokenFrom(userAtStart);

            const takesAtStart = await Take.find({});
            const takeToReplyAtStart = await Take.findOne({
                user: { $ne: userAtStart._id },
            });

            const newReply = {
                content: "Cancelled, absolutely cancelled",
            };

            await api
                .post(`/api/takes/${takeToReplyAtStart.id}/replies`)
                .set("Authorization", `Bearer ${token}`)
                .send(newReply)
                .expect(201)
                .expect("Content-Type", /application\/json/);

            const takesAtEnd = await Take.find({});
            const takeToReplyAtEnd = await Take.findById(takeToReplyAtStart._id);
            const userAtEnd = await User.findById(userAtStart._id);

            expect(takesAtEnd).toHaveLength(takesAtStart.length + 1);
            expect(userAtEnd.takes).toHaveLength(userAtStart.takes.length + 1);
            expect(takeToReplyAtEnd.replies).toHaveLength(
                takeToReplyAtStart.replies.length + 1
            );
        });

        test("it's possible to like a take", async () => {
            const userAtStart = await User.findOne({});
            const token = getTokenFrom(userAtStart);

            const takeAtStart = await Take.findOne({
                user: { $ne: userAtStart._id },
            });

            await api
                .post(`/api/takes/${takeAtStart.id}/likes`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            const userAtEnd = await User.findById(userAtStart._id);

            expect(userAtEnd.likedTakes).toHaveLength(
                userAtStart.likedTakes.length + 1
            );
            expect(userAtEnd.likedTakes).toContainEqual(takeAtStart._id);

            expect(takeAtEnd.likedBy).toHaveLength(takeAtStart.likedBy.length + 1);
            expect(takeAtEnd.likedBy).toContainEqual(userAtStart._id);
        });

        test("it's possible to dislike a take", async () => {
            const userAtStart = await User.findOne({});
            const token = getTokenFrom(userAtStart);

            const takeAtStart = await Take.findOne({
                user: { $ne: userAtStart._id },
            });

            await api
                .post(`/api/takes/${takeAtStart.id}/dislikes`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            const userAtEnd = await User.findById(userAtStart._id);

            expect(userAtEnd.dislikedTakes).toHaveLength(
                userAtStart.dislikedTakes.length + 1
            );
            expect(userAtEnd.dislikedTakes).toContainEqual(takeAtStart._id);

            expect(takeAtEnd.dislikedBy).toHaveLength(
                takeAtStart.dislikedBy.length + 1
            );
            expect(takeAtEnd.dislikedBy).toContainEqual(userAtStart._id);
        });

        test("it's not possible to like their own take", async () => {
            const userAtStart = await User.findOne({});
            const token = getTokenFrom(userAtStart);

            const takeAtStart = await Take.findOne({
                user: userAtStart._id,
            });

            await api
                .post(`/api/takes/${takeAtStart.id}/likes`)
                .set("Authorization", `Bearer ${token}`)
                .expect(400)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            const userAtEnd = await User.findById(userAtStart._id);

            expect(userAtEnd.likedTakes).toHaveLength(userAtStart.likedTakes.length);
            expect(userAtEnd.likedTakes).not.toContainEqual(takeAtStart._id);

            expect(takeAtEnd.likedBy).toHaveLength(takeAtStart.likedBy.length);
            expect(takeAtEnd.likedBy).not.toContainEqual(userAtStart._id);
        });

        test("it's not possible to dislike their own take", async () => {
            const userAtStart = await User.findOne({});
            const token = getTokenFrom(userAtStart);

            const takeAtStart = await Take.findOne({
                user: userAtStart._id,
            });

            await api
                .post(`/api/takes/${takeAtStart.id}/dislikes`)
                .set("Authorization", `Bearer ${token}`)
                .expect(400)
                .expect("Content-Type", /application\/json/);

            const takeAtEnd = await Take.findById(takeAtStart._id);
            const userAtEnd = await User.findById(userAtStart._id);

            expect(userAtEnd.dislikedTakes).toHaveLength(
                userAtStart.dislikedTakes.length
            );
            expect(userAtEnd.dislikedTakes).not.toContainEqual(takeAtStart._id);

            expect(takeAtEnd.dislikedBy).toHaveLength(takeAtStart.dislikedBy.length);
            expect(takeAtEnd.dislikedBy).not.toContainEqual(userAtStart._id);
        });

        describe("and the user has already liked a post", () => {
            test("it's possible to remove their like from a take", async () => {
                const userAtStart = await User.findOne({});
                const token = getTokenFrom(userAtStart);

                const takeAtStart = await Take.findOne({
                    likedBy: userAtStart._id,
                });

                await api
                    .delete(`/api/takes/${takeAtStart.id}/likes/${userAtStart.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect("Content-Type", /application\/json/);

                const takeAtEnd = await Take.findById(takeAtStart._id);
                const userAtEnd = await User.findById(userAtStart._id);

                expect(userAtEnd.likedTakes).toHaveLength(
                    userAtStart.likedTakes.length - 1
                );
                expect(userAtEnd.likedTakes).not.toContainEqual(takeAtStart._id);

                expect(takeAtEnd.likedBy).toHaveLength(takeAtStart.likedBy.length - 1);
                expect(takeAtEnd.likedBy).not.toContainEqual(userAtStart._id);
            });

            test("it's possible to remove their dislike from a take", async () => {
                const userAtStart = await User.findOne({});
                const token = getTokenFrom(userAtStart);

                const takeAtStart = await Take.findOne({
                    dislikedBy: userAtStart._id,
                });

                await api
                    .delete(`/api/takes/${takeAtStart.id}/dislikes/${userAtStart.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect("Content-Type", /application\/json/);

                const takeAtEnd = await Take.findById(takeAtStart._id);
                const userAtEnd = await User.findById(userAtStart._id);

                expect(userAtEnd.dislikedTakes).toHaveLength(
                    userAtStart.dislikedTakes.length - 1
                );
                expect(userAtEnd.dislikedTakes).not.toContainEqual(takeAtStart._id);

                expect(takeAtEnd.dislikedBy).toHaveLength(
                    takeAtStart.dislikedBy.length - 1
                );
                expect(takeAtEnd.dislikedBy).not.toContainEqual(userAtStart._id);
            });

            test("it's not possible to remove someone else's like from a take", async () => {
                const userAtStart = await User.findOne({});
                const token = getTokenFrom(userAtStart);

                const takeAtStart = await Take.findOne({
                    likedBy: { $ne: userAtStart._id },
                });

                const alienId = takeAtStart.likedBy[0];

                await api
                    .delete(`/api/takes/${takeAtStart.id}/likes/${alienId.toString()}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(403)
                    .expect("Content-Type", /application\/json/);

                const takeAtEnd = await Take.findById(takeAtStart._id);
                const userAtEnd = await User.findById(userAtStart._id);

                expect(userAtEnd.likedTakes).toHaveLength(
                    userAtStart.likedTakes.length
                );

                expect(takeAtEnd.likedBy).toHaveLength(takeAtStart.likedBy.length);
                expect(takeAtEnd.likedBy).toContainEqual(alienId);
            });

            test("it's not possible to remove someone else's dislike from a take", async () => {
                const userAtStart = await User.findOne({});
                const token = getTokenFrom(userAtStart);

                const takeAtStart = await Take.findOne({
                    dislikedBy: { $ne: userAtStart._id },
                });

                const alienId = takeAtStart.dislikedBy[0];

                await api
                    .delete(`/api/takes/${takeAtStart.id}/dislikes/${alienId.toString()}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(403)
                    .expect("Content-Type", /application\/json/);

                const takeAtEnd = await Take.findById(takeAtStart._id);
                const userAtEnd = await User.findById(userAtStart._id);

                expect(userAtEnd.dislikedTakes).toHaveLength(
                    userAtStart.dislikedTakes.length
                );

                expect(takeAtEnd.dislikedBy).toHaveLength(
                    takeAtStart.dislikedBy.length
                );
                expect(takeAtEnd.dislikedBy).toContainEqual(alienId);
            });
        });
    });
});

const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const User = require("../models/user");
const Take = require("../models/take");
const {
    usersInDb,
    initialUsers,
    initialTakes,
    createReply,
    getTokenFrom,
} = require("./helper");

afterAll(async () => await mongoose.connection.close());

describe("when the db is empty", () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    test("it's possible to save a new user", async () => {
        const newUser = { username: "JohnnyNeumann", password: "Messi1234" };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(1);
    });

    test("it's not possible to save an user without an username", async () => {
        const usersAtStart = await usersInDb();

        const newUser = { password: "Messi1234" };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await usersInDb();

        expect(usersAtStart).toHaveLength(usersAtEnd.length);
    });

    test("it's not possible to save a short username", async () => {
        const newUser = { username: "gg", password: "Messi1234" };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(0);
    });

    test("it's not possible to save a long username", async () => {
        const newUser = {
            username:
                "TaumatawhakatangihangakoauauoTamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu",
            password: "Messi1234",
        };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(0);
    });
});

describe("when the db has users in it", () => {
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

    test("it's not possible to save a non-unique username", async () => {
        const username = initialUsers[0].username;
        const newUser = { username, password: "Messi1234" };

        const usersAtStart = await usersInDb();

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await usersInDb();

        expect(usersAtStart).toHaveLength(usersAtEnd.length);
    });

    describe("and there is no user logged in", () => {
        test("it's not possible to see the users", async () => {
            await api
                .get("/api/users")
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });

        test("it's not possible to access an individual user with it's id", async () => {
            const userToCheck = await User.findOne({});

            await api
                .get(`/api/users/${userToCheck.id}`)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });

        test("it's not possible to access an individual users takes with it's id", async () => {
            const userToCheck = await User.findOne({});

            await api
                .get(`/api/users/${userToCheck.id}/takes`)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });

        test("it's not possible to access an individual users liked takes with it's id", async () => {
            const userToCheck = await User.findOne({});

            await api
                .get(`/api/users/${userToCheck.id}/likedtakes`)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });

        test("it's not possible to access an individual users disliked takes with it's id", async () => {
            const userToCheck = await User.findOne({});

            await api
                .get(`/api/users/${userToCheck.id}/dislikedtakes`)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });
    });

    describe("and a user is logged in", () => {
        test("users are returned as json", async () => {
            const user = await User.findOne({});
            const token = getTokenFrom(user);

            await api
                .get("/api/users")
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);
        });

        test("the returned json doesn't contain the passwordHash and __v", async () => {
            const user = await User.findOne({});
            const token = getTokenFrom(user);

            const response = await api
                .get("/api/users")
                .set("Authorization", `Bearer ${token}`);

            response.body.forEach((user) => {
                expect(user).not.toHaveProperty("passwordHash");
            });

            response.body.forEach((user) => {
                expect(user).not.toHaveProperty("__v");
            });
        });

        test("all users are returned", async () => {
            const user = await User.findOne({});
            const token = getTokenFrom(user);

            const response = await api
                .get("/api/users")
                .set("Authorization", `Bearer ${token}`);

            expect(response.body).toHaveLength(initialUsers.length);
        });

        test("it's possible to access an individual user with it's id", async () => {
            const userToLogin = await User.findOne({});
            const token = getTokenFrom(userToLogin);

            const userToCheck = await User.findOne({ _id: { $ne: userToLogin._id } });

            const response = await api
                .get(`/api/users/${userToCheck.id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            expect(response.body.username).toBe(userToCheck.username);
            expect(response.body.takes).toEqual(userToCheck.takes);

            const userLikes = userToCheck.likedTakes.map((t) => t.toString());
            expect(response.body.likedTakes).toEqual(userLikes);

            const userDisikes = userToCheck.dislikedTakes.map((t) => t.toString());
            expect(response.body.dislikedTakes).toEqual(userDisikes);
        });

        test("it's possible to access an individual users takes with it's id", async () => {
            const userToLogin = await User.findOne({});
            const token = getTokenFrom(userToLogin);

            const userToCheck = await User.findOne({ _id: { $ne: userToLogin._id } });

            const response = await api
                .get(`/api/users/${userToCheck.id}/takes`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            expect(response.body.id).toBe(userToCheck.id);
            expect(response.body.takes).toEqual(userToCheck.takes);
        });

        test("it's possible to access an individual users liked takes with it's id", async () => {
            const userToLogin = await User.findOne({});
            const token = getTokenFrom(userToLogin);

            const userToCheck = await User.findOne({ _id: { $ne: userToLogin._id } });

            const response = await api
                .get(`/api/users/${userToCheck.id}/likedtakes`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            expect(response.body.id).toBe(userToCheck.id);

            const responseIds = response.body.likedTakes.map((t) => t.id);
            const userLikeIds = userToCheck.likedTakes.map((t) => t.toString());
            expect(responseIds).toEqual(userLikeIds);
        });

        test("it's possible to access an individual users disliked takes with it's id", async () => {
            const userToLogin = await User.findOne({});
            const token = getTokenFrom(userToLogin);

            const userToCheck = await User.findOne({ _id: { $ne: userToLogin._id } });

            const response = await api
                .get(`/api/users/${userToCheck.id}/dislikedtakes`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            expect(response.body.id).toBe(userToCheck.id);

            const responseIds = response.body.dislikedTakes.map((t) => t.id);
            const userDislikeIds = userToCheck.dislikedTakes.map((t) => t.toString());
            expect(responseIds).toEqual(userDislikeIds);
        });
    });
});

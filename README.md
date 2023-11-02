# hotTakes <img width="50" alt="hottakes-logo" src="https://raw.githubusercontent.com/63r6o/hottakes/ecd74febc4e70d22beaec2e95108f1f0bdd79ab5/hottake-frontend/public/lit.svg">


A small, twitter-like toy application using the MERN stack, where you can
***post***, ***like*** or ***dislike*** a hot take
_(since we don't have enough places like this on the internet)_.

It has been deployed [here](https://hottakes-1nqu.onrender.com/). *

_* on a free render instance, which takes ~30 seconds to spin up_


## Technologies Used

### Frontend
- React
- Redux with Redux Toolkit
- Tailwind CSS
- React Router

### Backend
- Node.js and Express for building the REST API.
- MongoDB Database to store user information and posts ("takes").
- Jest for backend unit tests.

## Installation

If you'd like to run this locally, you have to install the required dependencies with `npm install` in both the `hottake-backend` and the `hottake-frontend` directory.

You'd also have to fire up a mongodb instance, and add a `.env` file in the root of the `hottake-backend` directory:
```
PORT= # The port number to use

MONGODB_URI= # The URI for your main mongodb instance

TEST_MONGODB_URI= # The URI for your test mongodb instance

SECRET= # a secret phrase needed for the JWT signature
```

You can either build the ui from the backend directory with `npm run build:ui` then start the server with `npm start`, or run both the back- and frontend with `npm run dev`, so you're changes will be reflected in real-time.

## Features

- User Registration and Authentication using JSON webtokens
- Adding posts ("Takes")
- Liking and Disliking Posts
- Replying to Posts (which hasn't been implemented on the frontend yet, but it's possible trough the api)

![Demonstrating the UI](https://github.com/63r6o/hottakes/assets/102681223/bd5f521b-4a18-4ca2-a3bb-3573f73f0e38)
## Testing

Running `npm run test` in the `hottake-backend` folder should run all the unit tests.

## Deployment

The Database is running in MongoDB Atlas, while the application itself is hosted on Render (deployed from this repository).

## Acknowledgements

The typeface used in the Header of the application is the beautiful [Surreal Psychedelic Typeface](https://pixelbuddha.net/fonts/surreal-psychedelic-typeface-free-download).

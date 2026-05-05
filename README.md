# Backend README

This folder contains the Node.js, Express, MongoDB, and JWT backend for the authentication app.

## What This Backend Does

- Registers users with name, email, and password.
- Stores passwords securely using bcrypt hashing.
- Logs users in and returns a JWT token.
- Sends password reset emails through Nodemailer.
- Validates reset tokens before allowing password changes.
- Uses MongoDB Atlas through Mongoose.
- Adds basic security middleware with Helmet, CORS, and rate limiting.

## Important Changes Made

- Updated server startup so Express waits for MongoDB before listening for requests.
- Added clearer MongoDB connection errors for Atlas and missing `.env` setup.
- Added a `/api` database availability guard that returns `503` if MongoDB disconnects.
- Improved controller error handling so Mongo network errors do not print huge stack traces to users.
- Added request validation using `express-validator`.
- Normalized emails to lowercase before registration, login, and password recovery.
- Improved auth responses for duplicate users, invalid credentials, and validation errors.

## Folder Structure

```text
backend/
  app.js                  Main Express app and server startup
  config/db.js            MongoDB connection setup
  controller/             Route controller logic
  models/                 Mongoose schemas
  routes/                 Express API routes
  utils/sendemail.js      Password reset email helper
  .env                    Local environment variables
```

## Environment Variables

Create a `.env` file in this folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
CLIENT_URL=https://your-frontend-live-url.com
```

Set `CLIENT_URL` to your deployed frontend URL. For multiple allowed frontend URLs, separate them with commas.

Do not commit real secrets. If credentials were shared publicly, rotate them in MongoDB Atlas and Gmail.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the backend in development mode:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The API runs on the port from `PORT`.

```text
GET /
```

## API Routes

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

## MongoDB Atlas Notes

If you see errors like `ENOTFOUND`, `ECONNRESET`, or `ReplicaSetNoPrimary`, check:

- Your current IP is added in MongoDB Atlas Network Access.
- Your database username and password are correct.
- VPN/proxy/firewall is not blocking MongoDB.
- Outbound TCP port `27017` is allowed.
- Your DNS can resolve the Atlas host.

For testing only, Atlas can temporarily allow `0.0.0.0/0`, but it should be removed later.

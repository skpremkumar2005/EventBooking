# EventHub Backend API

This is the backend API for the EventHub application, a platform for creating, discovering, and booking events. It is built with Node.js, Express, and MongoDB, providing a robust RESTful API for all event and user management functionalities.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Navigate to Directory](#2-navigate-to-directory)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Set Up Environment Variables](#4-set-up-environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints Guide](#api-endpoints-guide)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Events](#events)
- [Error Handling](#error-handling)

## Features

- **User Authentication**: Secure user registration and login using JSON Web Tokens (JWT).
- **Event Management**: Full CRUD (Create, Read, Update, Delete) functionality for events.
- **Event Booking**: Users can book tickets for events, with capacity checks.
- **Email Notifications**: Automated email confirmations for event creation and bookings.
- **Authorization**: Secure endpoints to ensure only authenticated users can perform certain actions (e.g., only the event host can update or delete their event).
- **Data Validation**: Robust validation and error handling on the server-side.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` for password hashing
- **Emailing**: `nodemailer` for sending emails via SMTP
- **Environment Management**: `dotenv`
- **CORS**: `cors` package
- **Development**: `nodemon` for live-reloading during development

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16.x or newer recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (a local instance or a cloud-hosted service like MongoDB Atlas)
- An **SMTP Server** for sending emails (e.g., SendGrid, Mailgun, or a local tool like [MailHog](https://github.com/mailhog/MailHog) for development).

## Installation & Setup

### 1. Clone the Repository

```bash
# If you are cloning the entire project
git clone <repository-url>
```

### 2. Navigate to Directory

Change into the backend project directory:

```bash
cd eventhub-backend
```

### 3. Install Dependencies

Install the required npm packages:

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the `eventhub-backend` root directory. You can copy the example below and fill in your own configuration values.

`.env.example`:

```env
# Server Configuration
PORT=5001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/eventhub

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# Email Configuration (using MailHog for local development as an example)
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM="EventHub <no-reply@eventhub.com>"
```

**Note:**
- `MONGODB_URI`: Replace with your actual MongoDB connection string.
- `JWT_SECRET`: Change this to a long, random, and secure string.
- `FRONTEND_URL`: Set this to the URL where your frontend application is running to enable CORS.
- `EMAIL_*`: Fill these with your SMTP provider's details. The example is configured for MailHog. For production, use a service like SendGrid.

## Running the Application

You can run the server in two modes:

- **Development Mode**: Uses `nodemon` to automatically restart the server on file changes.

  ```bash
  npm run dev
  ```

- **Production Mode**: Runs the server using `node`.

  ```bash
  npm start
  ```

The console will output `Server running on port 5001` and `MongoDB Connected...` if the setup is successful.

## API Endpoints Guide

The base URL for all API endpoints is `/api`.

### Authentication

**Route**: `/api/auth`

| Method | Endpoint    | Description                     | Access  |
| ------ | ----------- | ------------------------------- | ------- |
| `POST` | `/signup`   | Register a new user.            | Public  |
| `POST` | `/login`    | Authenticate a user & get token.| Public  |

### Users

**Route**: `/api/users`

| Method | Endpoint    | Description                           | Access             |
| ------ | ----------- | ------------------------------------- | ------------------ |
| `GET`  | `/me`       | Get the current authenticated user's profile. | Private (Requires Token) |

### Events

**Route**: `/api/events`

| Method   | Endpoint           | Description                                    | Access                           |
| -------- | ------------------ | ---------------------------------------------- | -------------------------------- |
| `GET`    | `/`                | Get a list of all events.                      | Public                           |
| `POST`   | `/`                | Create a new event.                            | Private (Requires Token)         |
| `GET`    | `/:eventId`        | Get details of a single event by its ID.       | Public                           |
| `PUT`    | `/:eventId`        | Update an event.                               | Private (Requires Token, Host only) |
| `DELETE` | `/:eventId`        | Delete an event.                               | Private (Requires Token, Host only) |
| `POST`   | `/:eventId/book`   | Book a ticket for an event.                    | Private (Requires Token)         |

**Note:** For private routes, you must include the JWT in the request headers:
`Authorization: Bearer <your_jwt_token>`

## Error Handling

The API uses a global error handler to catch and format errors consistently.

- **`400 Bad Request`**: For validation errors, missing required fields, or malformed IDs.
- **`401 Unauthorized`**: For missing, invalid, or expired authentication tokens.
- **`403 Forbidden`**: When an authenticated user tries to access a resource they don't have permission for (e.g., editing an event they don't own).
- **`404 Not Found`**: When a requested resource (like an event or user) does not exist.
- **`500 Internal Server Error`**: For unexpected server-side errors.

The error response is always in the format:
```json
{
  "message": "Error description here"
}
```

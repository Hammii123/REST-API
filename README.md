# User Settings Management API

A REST API built with Node.js and Express to manage user settings. Data is stored in a local JSON file (`data/userSettings.json`) instead of a database, and all file access uses the `fs` module with async/await.

## Features

- Create, read, update and delete user settings
- Input validation before anything is written to the file
- Proper HTTP status codes (`200`, `201`, `400`, `404`, `409`, `500`)
- Duplicate `userId` prevention
- `createdAt` / `updatedAt` timestamps added manually on create and update
- Console logging for create, update and delete operations
- All file operations wrapped in try/catch
- Each request reads the file only once

## Tech Stack

- Node.js
- Express
- Local JSON file storage (`fs.promises`)

## Project Structure

```
user-setting-api/
├── data/
│   └── userSettings.json
├── src/
│   ├── server.js
│   ├── app.js
│   ├── routes/
│   │   └── settings.routes.js
│   ├── controllers/
│   │   └── settings.controller.js
│   ├── services/
│   │   └── settings.service.js
│   └── utils/
│       └── validate.js
├── package.json
└── README.md
```

- **routes**: maps each endpoint to a controller function
- **controllers**: validates input, calls the service, sends the response
- **services**: all reading and writing of the JSON file
- **utils**: validation functions

## Getting Started

### Prerequisites

- Node.js installed

### Installation

```bash
git clone <your-repository-url>
cd user-setting-api
npm install
```

Make sure `data/userSettings.json` exists and contains at least an empty array:

```json
[]
```

### Run the server

```bash
npm start
```

For auto-restart during development:

```bash
npm run dev
```

The server runs on `http://localhost:3000` by default. Set the `PORT` environment variable to use a different port.

## Data Model

| Field | Type | Rules |
|---|---|---|
| `userId` | String | Required, unique |
| `language` | String | `EN` or `UR` |
| `notificationsEnabled` | Boolean | `true` or `false` |
| `timezone` | String | Valid timezone name, e.g. `Asia/Karachi` |
| `createdAt` | ISO date string | Set by the server on create |
| `updatedAt` | ISO date string | Set by the server on create and update |

## API Endpoints

Base URL: `http://localhost:3000/api/settings`

### Get settings for a user

`GET /api/settings/:userId`

Example: `GET /api/settings/user001`

Response `200`:

```json
{
  "userId": "user001",
  "language": "EN",
  "notificationsEnabled": true,
  "timezone": "Asia/Karachi",
  "createdAt": "2026-09-29T06:55:16.914Z",
  "updatedAt": "2026-09-29T06:55:16.914Z"
}
```

### Create settings

`POST /api/settings`

All four fields are required. Do not send `createdAt` or `updatedAt`.

Request body:

```json
{
  "userId": "user010",
  "language": "EN",
  "notificationsEnabled": true,
  "timezone": "Asia/Karachi"
}
```

Response `201`: the created record, including `createdAt` and `updatedAt`.

### Update settings

`PUT /api/settings/:userId`

Send only the fields you want to change (at least one). `userId` and `createdAt` cannot be changed.

Example: `PUT /api/settings/user010`

Request body:

```json
{
  "language": "UR"
}
```

Response `200`: the full updated record, with a new `updatedAt`.

### Delete settings

`DELETE /api/settings/:userId`

Example: `DELETE /api/settings/user010`

Response `200`:

```json
{
  "message": "User settings deleted",
  "settings": { "userId": "user010", "...": "..." }
}
```

## Status Codes

| Code | Meaning |
|---|---|
| `200` | Request succeeded (GET, PUT, DELETE) |
| `201` | Settings created (POST) |
| `400` | Validation failed or invalid JSON body |
| `404` | `userId` not found, or route does not exist |
| `409` | `userId` already exists (POST) |
| `500` | Unexpected server or file error |

Validation errors are returned as a list:

```json
{
  "errors": [
    "language must be one of: EN, UR",
    "notificationsEnabled must be a boolean (true or false)"
  ]
}
```

## Testing

Use Postman, Thunder Client or curl. For POST and PUT requests, set the body type to **raw** and **JSON**.

Suggested test order:

1. `POST /api/settings` with a valid body (expect `201`)
2. `POST` the same `userId` again (expect `409`)
3. `POST` with invalid values (expect `400`)
4. `GET /api/settings/:userId` (expect `200`)
5. `PUT /api/settings/:userId` with `{"language": "UR"}` (expect `200`, and check that only `updatedAt` changed)
6. `GET` an unknown user (expect `404`)
7. `DELETE /api/settings/:userId` (expect `200`), then `GET` again (expect `404`)
8. 

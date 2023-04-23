# Simple eCommerce Backend

This is a simple eCommerce backend application built with Node.js, Express.js, and MongoDB. The backend provides RESTful API endpoints for managing products, orders, and customers. It also includes authentication and authorization mechanisms to secure the API endpoints.

## Getting Started

### Prerequisites

- Node.js (version 10 or later)
- MongoDB (version 3.6 or later)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/simple-ecommerce-backend.git
```

2. Install dependencies:

```bash
cd simple-ecommerce-backend
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory of the project and add the following environment variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-jwt-secret
```

4. Start the server:

```bash
npm start
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register

Create a new user account.

Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password"
}
```

#### POST /auth/login

Authenticate a user and generate a JWT token.

Request Body:

```json
{
  "email": "john@example.com",
  "password": "password"
}
```


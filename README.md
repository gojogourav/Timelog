# TimeLog

TimeLog is a web application that allows users to create, manage, and track their activities and associated time logs. Built with Next.js, Prisma, and PostgreSQL, it offers a modern and type-safe approach to managing user data and relationships.

## Features

- **User Authentication:** Secure login using JWT tokens.
- **Activity Management:** Create, view, and manage activities.
- **Time Logging:** Record time logs associated with specific activities.
- **Relational Data Handling:** Efficient data management using Prisma ORM with relationships between Users, Activities, and TimeLogs.
- **RESTful API Endpoints:** Easily interact with the backend through Next.js API routes.

## Tech Stack

- **Next.js:** React framework for building both the frontend and API routes.
- **Prisma:** ORM for database interactions with type safety.
- **PostgreSQL:** Relational database for data persistence.
- **JWT:** Secure authentication using JSON Web Tokens.
- **TypeScript:** Ensures type safety across the application.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or later)
- [PostgreSQL](https://www.postgresql.org/) database
- Package manager: npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/timelog.git
   cd timelog

### environment variables
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_ACCESS_SECRET=yourjwtsecrethere
JWT_REFRESH_SECRET=yourjwtsecrethere

## install dependencies
npm install
# or
yarn install

## prisma migration
npx prisma migrate dev --name init


## start the server
npm run dev

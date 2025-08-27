# SkillSwap

SkillSwap is a peer-to-peer skill exchange platform where users can teach and learn new skills by connecting with others in the community. The project is built with a React frontend and a Node.js/Express backend, using MongoDB for data storage.

## Features

- User authentication (register, login, JWT-based sessions)
- Create and browse skill listings
- Send and manage skill exchange requests
- Matchmaking and notifications
- User profiles with skills, bio, and reputation
- Responsive UI with Tailwind CSS

## Project Structure

```
/
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── contexts/       # React context providers
│   ├── data/           # Mock data and constants
│   ├── lib/            # API utilities
│   └── ...
├── server/             # Node.js/Express backend
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── ...
├── package.json        # Project scripts and dependencies
├── .env.example        # Example environment variables
├── README.md           # Project documentation
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB Atlas account (or local MongoDB)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/skillswap.git
   cd skillswap
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the root and `server/.env` for backend.
   - Fill in your MongoDB URI and other secrets.

4. **Start the development servers:**
   ```sh
   npm run dev
   ```
   This will start both the frontend (Vite) and backend (Express) servers concurrently.

5. **Access the app:**
   - Frontend: https://skillswap-frontend-hdeq.onrender.com
   - Backend API: https://skillswap-backend-2zyk.onrender.com

## Scripts

- `npm run dev` — Start both frontend and backend in development mode
- `npm run client` — Start frontend only
- `npm run server` — Start backend only
- `npm run build` — Build frontend for production
- `npm run lint` — Run ESLint

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication

## Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

## License

MIT

## Contact

For questions or support, open an issue or contact

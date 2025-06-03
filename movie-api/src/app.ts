/**
 * Entry point of the Movie API server.
 * Sets up Express, middleware, routing, and starts the server.
 */

import express = require('express');
import moviesRouter from './routes/movies.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Register routes under /api/movies
app.use('/api/movies', moviesRouter);

// Health check or root endpoint
app.get('/', (req, res) => {
  res.send('Movie API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

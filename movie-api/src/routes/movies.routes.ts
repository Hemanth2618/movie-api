import { Router } from 'express';
import {
  listAllMovies,
  getMovieDetailsByImdbId,
  listMoviesByYear,
  getMoviesByGenre,
} from '../controllers/movies.controller';

const router = Router();

// GET /?page=1 — List all movies paginated (default 50 per page)
router.get('/', listAllMovies);

// GET /:imdbId — Get detailed info for a single movie by IMDb ID
router.get('/:imdbId', getMovieDetailsByImdbId);

// GET /year/:year?page=1&sort=asc|desc — List movies released in a given year
router.get('/year/:year', listMoviesByYear);

// GET /genre/:genre?page=1 — List movies by genre
router.get('/genre/:genre', getMoviesByGenre);

export default router;

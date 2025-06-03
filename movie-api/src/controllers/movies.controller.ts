import { Request, Response } from 'express';
import {
  getPaginatedMovies,
  getMovieDetailsByImdbId as getMovieDetailsByImdbIdService,
} from '../services/movies.service';
import { MovieDetails } from '../types/movie.interface';
import { getMoviesByYear } from '../services/movies.service';
import { getMoviesByGenre as getMoviesByGenreService } from '../services/movies.service';

/**
 * Controller to handle listing all movies with pagination.
 * Supports optional `page` query parameter to retrieve paginated results.
 *
 * @param req - Express Request object containing optional `page` query parameter
 * @param res - Express Response object used to return the list of movies
 */
export const listAllMovies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const movies = await getPaginatedMovies(page);
    res.json({ page, movies });
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Controller to fetch detailed information about a movie by its IMDb ID.
 * Returns 404 if the movie is not found, otherwise returns movie details.
 *
 * @param req - Express Request object containing `imdbId` as a URL parameter
 * @param res - Express Response object used to return movie details or error
 */
export const getMovieDetailsByImdbId = async (req: Request, res: Response) => {
  const imdbId: string = req.params.imdbId;

  try {
    const movie: MovieDetails | null = await getMovieDetailsByImdbIdService(imdbId);

    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
};

/**
 * Controller to fetch a paginated list of movies released in a specific year.
 * Allows sorting results in ascending or descending order of release date.
 *
 * @param req - Express Request object containing `year` as a URL parameter, and `page` and `sort` as query parameters
 * @param res - Express Response object used to return the list of movies or an error message
 */
export const listMoviesByYear = async (req: Request, res: Response) => {
  const { year } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const sort = (req.query.sort as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

  try {
    const movies = await getMoviesByYear(year, page, sort as 'asc' | 'desc');
    res.json({ page, movies });
  } catch (err) {
    console.error('Error fetching movies by year:', err);
    res.status(500).json({ error: 'Failed to fetch movies by year' });
  }
};

/**
 * Controller to fetch a paginated list of movies filtered by genre.
 *
 * @param req - Express Request object containing `genre` as a URL parameter and `page` as a query parameter
 * @param res - Express Response object used to return the filtered list of movies or an error message
 */
export const getMoviesByGenre = async (req: Request, res: Response) => {
  const { genre } = req.params;
  const page = parseInt(req.query.page as string) || 1;

  try {
    const movies = await getMoviesByGenreService(genre, page);
    res.json({ page, movies });
  } catch (err) {
    console.error('Error fetching movies by genre:', err);
    res.status(500).json({ error: 'Failed to fetch movies by genre' });
  }
};

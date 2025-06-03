import { moviesDb } from '../db/moviesDatabase';
import { ratingsDb } from '../db/ratingsDatabase';
import { Movie, MovieRow, MovieDetails } from '../types/movie.interface';

/**
 * Retrieves a paginated list of movies from the database.
 *
 * @param page - The current page number (1-based index)
 * @returns A Promise that resolves to an array of movies with formatted genres and budget
 *
 * Each movie includes: imdbId, title, genres (parsed as array), releaseDate, and budget (as $ value or 'N/A')
 */
export const getPaginatedMovies = (page: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const pageSize = 50;
    const offset = (page - 1) * pageSize;

    const query = `
        SELECT imdbId, title, genres,
        releaseDate, budget
        FROM movies
        LIMIT ? OFFSET ?`;
    moviesDb.all(query, [pageSize, offset], (err, rows: Movie[]) => {
      if (err) {
        reject(err);
      } else {
        const formatted = rows.map((movie) => ({
          ...movie,
          genres: JSON.parse(movie.genres),
          budget: movie.budget !== null && movie.budget !== undefined ? `$${movie.budget}` : 'N/A',
        }));
        resolve(formatted);
      }
    });
  });
};

/**
 * Retrieves detailed information for a specific movie by its IMDb ID.
 *
 * @param imdbId - The IMDb ID of the movie to fetch details for
 * @returns A Promise that resolves to a MovieDetails object or null if not found
 *
 * The details include: imdbId, title, description, release date, budget (formatted as $ or 'N/A'),
 * runtime, average rating (rounded to 1 decimal), genres (as an array), original language,
 * and production companies (as an array).
 */
export const getMovieDetailsByImdbId = (imdbId: string): Promise<MovieDetails | null> => {
  return new Promise((resolve, reject) => {
    const movieQuery = `
      SELECT movieId, imdbId, title, overview,
             releaseDate, budget, runtime, language,
             genres, productionCompanies
      FROM movies
      WHERE imdbId = ?
    `;
    moviesDb.get(movieQuery, [imdbId], (err, row: MovieRow) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      const movieId = row.movieId;

      const ratingQuery = `
        SELECT AVG(rating) as averageRating
        FROM ratings
        WHERE movieId = ?
      `;

      ratingsDb.get(ratingQuery, [movieId], (ratingErr, ratingRow: { averageRating: number }) => {
        if (ratingErr) return reject(ratingErr);

        const movie: MovieDetails = {
          imdbId: row.imdbId,
          title: row.title,
          description: row.overview,
          releaseDate: row.releaseDate,
          budget: row.budget !== null && row.budget !== undefined ? `$${row.budget}` : 'N/A',
          runtime: row.runtime ?? null,
          averageRating: ratingRow?.averageRating
            ? parseFloat(ratingRow.averageRating.toFixed(1))
            : null,
          genres: row.genres ? JSON.parse(row.genres) : [],
          originalLanguage: row.language,
          productionCompanies: row.productionCompanies ? JSON.parse(row.productionCompanies) : [],
        };
        resolve(movie);
      });
    });
  });
};

/**
 * Fetches a paginated list of movies released in a specific year, sorted by release date.
 *
 * @param year - The release year to filter movies by (e.g., "2010")
 * @param page - The page number for pagination (default page size is 50)
 * @param sortOrder - Sorting order by release date, either 'asc' or 'desc' (defaults to 'asc')
 * @returns A Promise that resolves to a list of Movie objects
 *
 * Each movie object includes: imdbId, title, genres (parsed as an array), releaseDate,
 * and budget (formatted as $ or 'N/A').
 */
export const getMoviesByYear = (
  year: string,
  page: number,
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<Movie[]> => {
  return new Promise((resolve, reject) => {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT imdbId, title, genres, releaseDate, budget
      FROM movies
      WHERE substr(releaseDate, 1, 4) = ?
      ORDER BY releaseDate ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    moviesDb.all(query, [year, limit, offset], (err, rows: Movie[]) => {
      if (err) return reject(err);
      resolve(
        rows.map((row) => ({
          ...row,
          genres: row.genres ? JSON.parse(row.genres) : [],
          budget: row.budget !== null && row.budget !== undefined ? `$${row.budget}` : 'N/A',
        }))
      );
    });
  });
};

/**
 * Fetches a paginated list of movies filtered by a specific genre.
 *
 * @param genre - The genre string to search for (e.g., "Action", "Drama").
 * @param page - The page number for pagination (default page size is 50).
 * @returns A Promise that resolves to a list of Movie objects.
 *
 * Each movie object includes: imdbId, title, genres (parsed as an array),
 * releaseDate, and budget (formatted as $ or 'N/A').
 *
 * The genre filter uses a partial match against the 'genres' field in the database.
 */
export const getMoviesByGenre = (genre: string, page: number): Promise<Movie[]> => {
  return new Promise((resolve, reject) => {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT m.imdbId, m.title, m.genres, m.releaseDate, m.budget
      FROM movies m
      WHERE m.genres LIKE ?
      LIMIT ? OFFSET ?
    `;

    const genreMatch = `%${genre}%`;

    moviesDb.all(query, [genreMatch, limit, offset], (err, rows: Movie[]) => {
      if (err) return reject(err);
      resolve(
        rows.map((row) => ({
          ...row,
          genres: row.genres ? JSON.parse(row.genres) : [],
          budget: row.budget !== null && row.budget !== undefined ? `$${row.budget}` : 'N/A',
        }))
      );
    });
  });
};

/**
 * Represents the basic movie information returned in listing APIs.
 */
export interface Movie {
  imdbId: string;
  title: string;
  genres: string;
  releaseDate: string;
  budget: string; // in dollars
}

/**
 * Represents detailed movie information including metadata and rating,
 * returned by the getMovieDetailsByImdbId API.
 */
export interface MovieDetails {
  imdbId: string;
  title: string;
  description: string;
  releaseDate: string;
  budget: string; // in dollars
  runtime: number | null;
  averageRating: number | null;
  genres: { id: number; name: string }[];
  originalLanguage: string;
  productionCompanies: { id: number; name: string }[];
}

/**
 * Represents the raw database row structure returned from the movies table.
 * Used internally to transform DB fields into the MovieDetails format.
 */
export interface MovieRow {
  movieId: number;
  imdbId: string;
  title: string;
  overview: string;
  productionCompanies: string;
  releaseDate: string;
  budget: number;
  revenue: number;
  runtime: number;
  language: string;
  genres: string;
  status: string;
}

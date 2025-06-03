import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import * as movieController from '../../src/controllers/movies.controller'
import * as movieService from '../../src/services/movies.service';
import { listAllMovies, listMoviesByYear, getMoviesByGenre } from '../../src/controllers/movies.controller';
import {MovieDetails, Movie} from "../../src/types/movie.interface";

/**
 * Unit tests for the `listAllMovies` controller function.
 *
 * This controller handles the GET `/api/movies?page=N` route and returns a paginated list of movies.
 * It relies on the `getPaginatedMovies` service to fetch movie data from the database.
 */
describe('listAllMovies Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;

  beforeEach(() => {
    // Setup mock request and response objects
    req = {
      query: { page: '2' },
    };

    // Stub res.status().json() chain
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub } as any);

    res = {
      json: jsonStub,
      status: statusStub,
    };
  });

  afterEach(() => {
    // Restore sinon stubs after each test
    sinon.restore();
  });

  it('should return movies and page number when successful', async () => {
    const fakeMovies = [
      { imdbId: 'tt123', title: 'Movie 1', genres: [], releaseDate: '2020-01-01', budget: '$1000' },
    ];

    // Stub getPaginatedMovies to return fakeMovies
    sinon.stub(movieService, 'getPaginatedMovies').resolves(fakeMovies);

    await listAllMovies(req as Request, res as Response);

    expect(jsonStub.calledOnce).to.be.true;
    expect(jsonStub.calledWith({ page: 2, movies: fakeMovies })).to.be.true;
  });

  it('should handle errors and return status 500', async () => {
    const error = new Error('DB error');

    // Simulate service throwing error
    sinon.stub(movieService, 'getPaginatedMovies').rejects(error);

    await listAllMovies(req as Request, res as Response);

    expect(statusStub.calledOnceWith(500)).to.be.true;
    expect(jsonStub.calledOnceWith({ error: 'Internal Server Error' })).to.be.true;
  });
});

/**
 * Unit tests for the `getMovieDetailsByImdbId` controller function.
 *
 * This controller handles the GET `/api/movies/:imdbId` route and returns detailed
 * information for a specific movie based on its IMDb ID.
 *
 * It uses the `getMovieDetailsByImdbId` service to fetch data from the database.
 */
describe('getMovieDetailsByImdbId controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;

  beforeEach(() => {
    // Mock request with a sample IMDb ID
    req = {
      params: { imdbId: 'tt1234567' }
    };

    // Stub response methods
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });

    res = {
      status: statusStub,
      json: jsonStub
    };
  });

  afterEach(() => {
    // Restore sinon stubs after each test
    sinon.restore();
  });

  it('should return movie details for a valid imdbId', async () => {
    const mockMovie: MovieDetails = {
      imdbId: 'tt1234567',
      title: 'Test Movie',
      description: 'Test description',
      releaseDate: '2023-01-01',
      budget: '$1000000',
      runtime: 120,
      averageRating: 8.2,
      genres: [{ id: 1, name: 'Action' }],
      originalLanguage: 'en',
      productionCompanies: [{ id: 1, name: 'Test Studio' }]
    };

    // Stub the service to return a mock movie object
    sinon.stub(movieService, 'getMovieDetailsByImdbId').resolves(mockMovie);

    await movieController.getMovieDetailsByImdbId(
      req as Request,
      res as Response
    );

    expect(jsonStub.calledWith(mockMovie)).to.be.true;
  });

  it('should return 404 if movie not found', async () => {
    // Stub the service to return null (movie not found)
    sinon.stub(movieService, 'getMovieDetailsByImdbId').resolves(null);

    await movieController.getMovieDetailsByImdbId(
      req as Request,
      res as Response
    );

    expect(statusStub.calledWith(404)).to.be.true;
    expect(jsonStub.calledWith({ error: 'Movie not found' })).to.be.true;
  });

  it('should return 500 on service error', async () => {
    const fakeError = new Error('DB failure');
    // Stub the service to throw an error
    sinon.stub(movieService, 'getMovieDetailsByImdbId').rejects(fakeError);

    await movieController.getMovieDetailsByImdbId(
      req as Request,
      res as Response
    );

    expect(statusStub.calledWith(500)).to.be.true;
    expect(jsonStub.calledWith({ error: 'Failed to fetch movie details' })).to.be.true;
  });
});

/**
 * Unit tests for the `listMoviesByYear` controller function.
 *
 * This controller handles GET requests to `/api/movies/year/:year` and
 * returns a paginated list of movies released in the specified year,
 * optionally sorted by release date.
 */
describe('listMoviesByYear controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;

  const mockMovies: Movie[] = [
    {
      imdbId: 'tt001',
      title: 'Year Movie',
      genres: '[]',
      releaseDate: '2020-01-01',
      budget: '$100000',
    }
  ];

  beforeEach(() => {
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub } as any);
    res = {
      json: jsonStub,
      status: statusStub
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return movies for a given year and page', async () => {
    req = {
      params: { year: '2020' },
      query: { page: '2', sort: 'desc' }
    };

    const serviceStub = sinon
      .stub(movieService, 'getMoviesByYear')
      .resolves(mockMovies);

    await listMoviesByYear(req as Request, res as Response);

    expect(serviceStub.calledWith('2020', 2, 'desc')).to.be.true;
    expect(jsonStub.calledWith({ page: 2, movies: mockMovies })).to.be.true;
  });

  it('should default sort to asc and page to 1 if not provided', async () => {
    req = {
      params: { year: '2021' },
      query: {}
    };

    const serviceStub = sinon
      .stub(movieService, 'getMoviesByYear')
      .resolves(mockMovies);

    await listMoviesByYear(req as Request, res as Response);

    expect(serviceStub.calledWith('2021', 1, 'asc')).to.be.true;
    expect(jsonStub.calledWith({ page: 1, movies: mockMovies })).to.be.true;
  });

  it('should handle service error and return 500', async () => {
    req = {
      params: { year: '2022' },
      query: {}
    };

    const mockError = new Error('DB failure');
    sinon.stub(movieService, 'getMoviesByYear').rejects(mockError);

    await listMoviesByYear(req as Request, res as Response);

    expect(statusStub.calledWith(500)).to.be.true;
    expect(jsonStub.calledWith({ error: 'Failed to fetch movies by year' })).to.be.true;
  });
});

/**
 * Unit tests for the `getMoviesByGenre` controller function.
 *
 * This controller handles GET requests to `/api/movies/genre/:genre`
 * and returns a paginated list of movies matching the specified genre.
 */
describe('getMoviesByGenre controller', () => {
  let jsonStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;
  let res: Partial<Response>;

  const mockMovies: Movie[] = [
    {
      imdbId: 'tt001',
      title: 'Genre Movie',
      genres: '[]',
      releaseDate: '2020-01-01',
      budget: '$100000'
    }
  ];

  beforeEach(() => {
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = {
      json: jsonStub,
      status: statusStub
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return movies for a given genre and page', async () => {
    const req = {
      params: { genre: 'Action' },
      query: { page: '2' }
    } as unknown as Request;

    const serviceStub = sinon.stub(movieService, 'getMoviesByGenre').resolves(mockMovies);

    await getMoviesByGenre(req, res as Response);

    // Ensure the genre and page are passed to the service
    expect(serviceStub.calledWith('Action', 2)).to.be.true;
    expect(jsonStub.calledWith({ page: 2, movies: mockMovies })).to.be.true;
  });

  it('should default to page 1 if not provided', async () => {
    const req = {
      params: { genre: 'Drama' },
      query: {}
    } as unknown as Request;

    const serviceStub = sinon.stub(movieService, 'getMoviesByGenre').resolves(mockMovies);

    await getMoviesByGenre(req, res as Response);

     // Default page 1 should be used
    expect(serviceStub.calledWith('Drama', 1)).to.be.true;
    expect(jsonStub.calledWith({ page: 1, movies: mockMovies })).to.be.true;
  });

  it('should return 500 on service error', async () => {
    const req = {
      params: { genre: 'Comedy' },
      query: {}
    } as unknown as Request;

    const error = new Error('DB failure');
    sinon.stub(movieService, 'getMoviesByGenre').rejects(error);

    await getMoviesByGenre(req, res as Response);

    expect(statusStub.calledWith(500)).to.be.true;
    expect(jsonStub.calledWith({ error: 'Failed to fetch movies by genre' })).to.be.true;
  });
});
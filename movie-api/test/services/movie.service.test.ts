import { expect } from 'chai';
import sinon from 'sinon';
import * as movieService from '../../src/services/movies.service';
import { Movie } from '../../src/types/movie.interface';
// Fake DB module
import * as dbModule from '../../src/db/moviesDatabase';
import * as ratingsModule from '../../src/db/ratingsDatabase';

/**
 * Unit tests for the `getPaginatedMovies` service function.
 *
 * This function queries the movies database and returns a paginated
 * and formatted list of movie entries with genre and budget formatting.
 */
describe('getPaginatedMovies', () => {
  let dbStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub the actual DB call used inside the service
    dbStub = sinon.stub(dbModule.moviesDb, 'all');
  });

  afterEach(() => {
    sinon.restore(); // Reset all stubs
  });
  it('should return formatted movies for given page', async () => {
    const fakeRows: Movie[] = [
      {
        imdbId: 'tt1234567',
        title: 'Test Movie',
        genres: JSON.stringify([{ id: 1, name: 'Drama' }]),
        releaseDate: '2023-01-01',
        budget: '1000000'
      }
    ];
    dbStub.yields(null, fakeRows);
    const result = await movieService.getPaginatedMovies(1);
    expect(result).to.be.an('array');
    expect(result[0].genres).to.deep.equal([{ id: 1, name: 'Drama' }]);
    expect(result[0].budget).to.equal('$1000000');
  });
  it('should return "$0" if budget is 0', async () => {
    const fakeRows: Movie[] = [
      {
        imdbId: 'tt7654321',
        title: 'Low Budget Movie',
        genres: JSON.stringify([{ id: 2, name: 'Comedy' }]),
        releaseDate: '2022-01-01',
        budget: '0'
      }
    ];
    dbStub.yields(null, fakeRows);
    const result = await movieService.getPaginatedMovies(1);
    expect(result[0].budget).to.equal('$0');
  });
  it('should reject with an error on DB failure', async () => {
    const fakeError = new Error('DB failure');
    dbStub.yields(fakeError, null);

    try {
      await movieService.getPaginatedMovies(1);
      expect.fail('Expected function to throw');
    } catch (err) {
      const error = err as Error;
      expect(error.message).to.equal('DB failure');
    }
  });
});

/**
 * Unit tests for the `getMovieDetailsByImdbId` service function.
 *
 * This function fetches detailed movie information by IMDb ID
 * from the movies database and augments it with average rating
 * from the ratings database. It also parses genre and company fields.
 */
describe('getMovieDetailsByImdbId', () => {
  let movieDbStub: sinon.SinonStub;
  let ratingDbStub: sinon.SinonStub;

  beforeEach(() => {
    movieDbStub = sinon.stub(dbModule.moviesDb, 'get');
    ratingDbStub = sinon.stub(ratingsModule.ratingsDb, 'get');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return movie details with parsed genres and companies', async () => {
    const fakeMovieRow = {
      movieId: 1,
      imdbId: 'tt1234567',
      title: 'Test Movie',
      overview: 'A test movie.',
      releaseDate: '2024-01-01',
      budget: 1000000,
      runtime: 120,
      language: 'en',
      genres: JSON.stringify([{ id: 1, name: 'Drama' }]),
      productionCompanies: JSON.stringify([{ id: 10, name: 'Test Studio' }])
    };

    const fakeRatingRow = { averageRating: 4.5 };

    movieDbStub.yields(null, fakeMovieRow);
    ratingDbStub.yields(null, fakeRatingRow);

    const result = await movieService.getMovieDetailsByImdbId('tt1234567');

    expect(result).to.deep.equal({
      imdbId: 'tt1234567',
      title: 'Test Movie',
      description: 'A test movie.',
      releaseDate: '2024-01-01',
      budget: '$1000000',
      runtime: 120,
      averageRating: 4.5,
      genres: [{ id: 1, name: 'Drama' }],
      originalLanguage: 'en',
      productionCompanies: [{ id: 10, name: 'Test Studio' }]
    });
  });

  it('should return null if movie is not found', async () => {
    movieDbStub.yields(null, null);

    const result = await movieService.getMovieDetailsByImdbId('tt0000000');

    expect(result).to.equal(null);
  });

  it('should handle DB error when querying movie', async () => {
    movieDbStub.yields(new Error('DB error'), null);

    try {
      await movieService.getMovieDetailsByImdbId('tt1234567');
      expect.fail('Expected function to throw');
    } catch (err: any) {
      expect(err.message).to.equal('DB error');
    }
  });

  it('should handle DB error when querying ratings', async () => {
    const fakeMovieRow = {
      movieId: 1,
      imdbId: 'tt1234567',
      title: 'Test Movie',
      overview: 'A test movie.',
      releaseDate: '2024-01-01',
      budget: 1000000,
      runtime: 120,
      language: 'en',
      genres: JSON.stringify([{ id: 1, name: 'Drama' }]),
      productionCompanies: JSON.stringify([{ id: 10, name: 'Test Studio' }])
    };

    movieDbStub.yields(null, fakeMovieRow);
    ratingDbStub.yields(new Error('Rating DB error'), null);

    try {
      await movieService.getMovieDetailsByImdbId('tt1234567');
      expect.fail('Expected function to throw');
    } catch (err: any) {
      expect(err.message).to.equal('Rating DB error');
    }
  });
});

/**
 * Unit tests for the getMoviesByYear service function.
 * Verifies that movies are correctly fetched by year with optional sorting,
 * handles empty results, and properly rejects on database errors.
 */
describe('getMoviesByYear', () => {
  let dbStub: sinon.SinonStub;

  beforeEach(() => {
    dbStub = sinon.stub(dbModule.moviesDb, 'all');
  });

  afterEach(() => {
    dbStub.restore();
  });

  it('should return movies from the given year sorted in ascending order', async () => {
    const mockMovies = [
      {
        imdbId: 'tt001',
        title: 'Test Movie 1',
        genres: '["Drama"]',
        releaseDate: '2020-01-01',
        budget: 100000,
      },
      {
        imdbId: 'tt002',
        title: 'Test Movie 2',
        genres: '["Action"]',
        releaseDate: '2020-05-01',
        budget: 200000,
      },
    ];

    dbStub.yields(null, mockMovies);

    const result = await movieService.getMoviesByYear('2020', 1, 'asc');

    expect(result).to.be.an('array').with.lengthOf(2);
    expect(result[0].imdbId).to.equal('tt001');
    expect(result[0].genres).to.deep.equal(['Drama']);
    expect(result[1].genres).to.deep.equal(['Action']);
  });

  it('should return empty array if no movies are found for the year', async () => {
    dbStub.yields(null, []);
    const result = await movieService.getMoviesByYear('1999', 1, 'asc');
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should reject on database error', async () => {
    dbStub.yields(new Error('DB error'), null);
    try {
      await movieService.getMoviesByYear('2020', 1, 'asc');
      throw new Error('Expected method to reject.');
    } catch (err: any) {
      expect(err.message).to.equal('DB error');
    }
  });
});

/**
 * Unit tests for the getMoviesByGenre service function.
 * Validates that movies are correctly fetched and parsed based on genre,
 * and ensures proper error handling on database failure.
 */
describe('getMoviesByGenre', () => {
  let dbStub: sinon.SinonStub;

  beforeEach(() => {
    dbStub = sinon.stub(dbModule.moviesDb, 'all');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return parsed movies matching the genre', async () => {
    const mockRows = [
      {
        imdbId: 'tt1234567',
        title: 'Genre Movie 1',
        genres: JSON.stringify(['Action', 'Adventure']),
        releaseDate: '2020-01-01',
        budget: 1000000
      },
      {
        imdbId: 'tt2345678',
        title: 'Genre Movie 2',
        genres: JSON.stringify(['Action', 'Thriller']),
        releaseDate: '2020-06-15',
        budget: 2000000
      }
    ];

    dbStub.yields(null, mockRows);

    const result = await movieService.getMoviesByGenre('Action', 1);

    expect(result).to.be.an('array').with.lengthOf(2);
    expect(result[0].genres).to.deep.equal(['Action', 'Adventure']);
    expect(result[1].title).to.equal('Genre Movie 2');
  });

  it('should reject if there is a DB error', async () => {
    const mockError = new Error('DB failure');
    dbStub.yields(mockError, null);

    try {
      await movieService.getMoviesByGenre('Comedy', 1);
      throw new Error('Expected to throw');
    } catch (error) {
      expect(error).to.equal(mockError);
    }
  });
});
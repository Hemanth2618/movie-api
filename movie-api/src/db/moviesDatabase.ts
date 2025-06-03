import * as sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../../db/movies.db');

/**
 * Initializes and exports the SQLite connection for the movies database.
 *
 * On successful connection, logs a success message.
 * On failure, logs an error message.
 *
 * The database file path is resolved from the environment configuration or default.
 */
export const moviesDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to movies DB', err.message);
  } else {
    console.log('Connected to movies DB');
  }
});

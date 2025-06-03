import * as sqlite3 from 'sqlite3';
import path from 'path';

const ratingsPath: string = path.resolve(__dirname, '../../../db/ratings.db');

/**
 * Initializes and exports the SQLite connection for the ratings database.
 *
 * On successful connection, logs a success message.
 * On failure, logs an error message.
 *
 * The database file path is resolved from the environment configuration or default.
 */
export const ratingsDb: sqlite3.Database = new sqlite3.Database(ratingsPath, (err) => {
  if (err) {
    console.error('Failed to connect to ratings DB: ', err.message);
  } else {
    console.log('Connected to ratings DB');
  }
});

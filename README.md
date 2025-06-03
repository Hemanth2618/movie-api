# **Overview**

This is a RESTful Movie API built in Node.js + TypeScript on top of two SQLite databases. It implements endpoints as described in the provided user stories, including pagination, filtering by year or genre, and retrieval of detailed movie information with ratings.

# **How to Run**

cd movie-api/

npm install

# **Start the server**

cd movie-api/

npm run dev

# **Run Unit Tests**

cd movie-api/

npm run test

## **API Endpoints**

### GET `/`
**Description:** Get a paginated list of all movies.  
**Query Parameters:**
- `page` (optional, default = 1)

**Example Request:**

http://localhost:3000/api/movies?page=2

---

### GET `/:imdbId`
**Description:** Fetch detailed movie info by IMDb ID.

**Example Request:**

http://localhost:3000/api/movies/tt0087469

---

### GET `/year/:year`
**Description:** Fetch movies released in a given year.  
**Query Parameters:**
- `page` (optional, default = 1)
- `sort` (optional, `asc` or `desc`, default = `asc`)

**Example Request:**
http://localhost:3000/api/movies/year/2005?page=4

http://localhost:3000/api/movies/year/2005?page=2&sort=desc

---

### GET `/genre/:genre`
**Description:** Get movies filtered by genre.  
**Query Parameters:**
- `page` (optional, default = 1)

**Example Request:**

http://localhost:3000/api/movies/genre/Action?page=1

# Acceptance Criteria Coverage

## User Story 1 – List All Movies

- Returns a paginated list of movies.
- Pagination size: 50 movies per page using the page query parameter (default = 1).
- Output includes fields:
imdbId, title, genres, releaseDate, budget
- budget is formatted as USD (e.g., $1000000)
- genres field is parsed from a JSON string into an array of { id, name } objects

## User Story 2 – Movie Details

- Accepts IMDb ID via /:imdbId route param and returns:
    - imdbId, title, description, releaseDate, budget, runtime,
averageRating, genres, originalLanguage, productionCompanies
- Budget is returned as a $ prefixed string (e.g., $5000000)
- Rating is averaged from ratings database
- genres and productionCompanies are parsed into arrays of objects

## User Story 3 - Movies By Year

- Accepts year as route param via /year/:year
- Supports optional query parameters:
    - page (default = 1)
    - sort for sort order (asc or desc, default = asc)
- Results are paginated (50 movies per page)
- Budget formatted with $ prefix for consistency
- Genres parsed from JSON into proper array structure

## User Story 4 – Movies By Genre

- Accepts genre as route param via /genre/:genre
- Supports optional page query param (default = 1)
- Returns movies that match the genre in a paginated format (50 per page)
- budget shown as USD (e.g., $4000000) for consistency.
- genres field parsed as an array from JSON


# Important Considerations

### Budget Display:

Even though formatting to $ is not explicitly mentioned in User Stories 3 & 4, budget values are consistently formatted across all endpoints for clarity and uniformity.

### Test Data Update:

One row in the movies.db was manually updated (e.g., language) to verify correct field mapping in API response.

### Missing Budget Handling:

If the database has a budget value 0, the API outputs it as $0.
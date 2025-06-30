const express = require('express');
const jwt = require('jsonwebtoken'); // Added as requested, though not directly used in public routes
let books = require("./booksdb.js"); // Import the books database
let { isValid, users } = require("./auth_users.js"); // Import isValid and users array

const public_users = express.Router();

// Helper function to simulate asynchronous data fetching for all books
// This function returns a Promise, which can then be awaited
const getBooksData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject({ status: 500, message: "Error retrieving book list." });
            }
        }, 500); // Simulate network delay
    });
};

// Helper function to simulate asynchronous data fetching for a book by ISBN
const getBookByISBNData = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject({ status: 404, message: "Book not found for the given ISBN." });
            }
        }, 500); // Simulate network delay
    });
};

// Helper function to simulate asynchronous data fetching for books by author
const getBooksByAuthorData = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];
            const bookIsbns = Object.keys(books);

            for (const isbn of bookIsbns) {
                if (books[isbn].author && books[isbn].author.toLowerCase() === author.toLowerCase()) {
                    matchingBooks.push({ isbn: isbn, ...books[isbn] });
                }
            }

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject({ status: 404, message: "No books found for the given author." });
            }
        }, 500); // Simulate network delay
    });
};

// Helper function to simulate asynchronous data fetching for books by title
const getBooksByTitleData = (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];
            const bookIsbns = Object.keys(books);

            for (const isbn of bookIsbns) {
                if (books[isbn].title && books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
                    matchingBooks.push({ isbn: isbn, ...books[isbn] });
                }
            }

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject({ status: 404, message: "No books found with the given title." });
            }
        }, 500); // Simulate network delay
    });
};

// Helper function to simulate asynchronous data fetching for book reviews by ISBN
const getBookReviewsByISBNData = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                const reviews = book.reviews;
                if (Object.keys(reviews).length > 0) {
                    resolve(reviews);
                } else {
                    reject({ status: 404, message: "No reviews found for this book." });
                }
            } else {
                reject({ status: 404, message: "Book not found for the given ISBN." });
            }
        }, 500); // Simulate network delay
    });
};


// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists or is invalid." });
    }

    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Task 1: Get the book list available in the shop (using Async/Await)
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBooksData(); // Await the Promise resolution
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(error.status).json({ message: error.message });
    }
});

// Task 2: Get book details based on ISBN (using Async/Await)
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBNData(isbn); // Await the Promise resolution
        return res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        return res.status(error.status).json({ message: error.message });
    }
});

// Task 3: Get book details based on author (using Async/Await)
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getBooksByAuthorData(author); // Await the Promise resolution
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } catch (error) {
        return res.status(error.status).json({ message: error.message });
    }
});

// Task 4: Get all books based on title (using Async/Await)
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await getBooksByTitleData(title); // Await the Promise resolution
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } catch (error) {
        return res.status(error.status).json({ message: error.message });
    }
});

// Task 5: Get book review (using Async/Await)
public_users.get('/review/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const reviews = await getBookReviewsByISBNData(isbn); // Await the Promise resolution
        return res.status(200).send(JSON.stringify(reviews, null, 4));
    } catch (error) {
        return res.status(error.status).json({ message: error.message });
    }
});

// Export the public_users router
module.exports.general = public_users;

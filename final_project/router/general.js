const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the username is valid (i.e., not already taken and not empty)
    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists or is invalid." });
    }

    // Add the new user to the users array
    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Simulate asynchronous operation using a Promise
    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(JSON.stringify(books, null, 4)); // Use JSON.stringify for neat output
            } else {
                reject({ status: 500, message: "Error retrieving book list." });
            }
        }, 500); // Simulate network delay
    })
    .then(data => {
        return res.status(200).send(data);
    })
    .catch(error => {
        return res.status(error.status).json({ message: error.message });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Retrieve ISBN from request parameters

    // Simulate asynchronous operation using a Promise
    new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(JSON.stringify(book, null, 4)); // Use JSON.stringify for neat output
            } else {
                reject({ status: 404, message: "Book not found for the given ISBN." });
            }
        }, 500); // Simulate network delay
    })
    .then(data => {
        return res.status(200).send(data);
    })
    .catch(error => {
        return res.status(error.status).json({ message: error.message });
    });
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author; // Retrieve author from request parameters
    const matchingBooks = [];

    // Simulate asynchronous operation using a Promise
    new Promise((resolve, reject) => {
        setTimeout(() => {
            // Obtain all the keys for the 'books' object
            const bookIsbns = Object.keys(books);

            // Iterate through the books and check if the author matches
            for (const isbn of bookIsbns) {
                if (books[isbn].author && books[isbn].author.toLowerCase() === author.toLowerCase()) {
                    matchingBooks.push({ isbn: isbn, ...books[isbn] });
                }
            }

            if (matchingBooks.length > 0) {
                resolve(JSON.stringify(matchingBooks, null, 4)); // Use JSON.stringify for neat output
            } else {
                reject({ status: 404, message: "No books found for the given author." });
            }
        }, 500); // Simulate network delay
    })
    .then(data => {
        return res.status(200).send(data);
    })
    .catch(error => {
        return res.status(error.status).json({ message: error.message });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title; // Retrieve title from request parameters
    const matchingBooks = [];

    // Simulate asynchronous operation using a Promise
    new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookIsbns = Object.keys(books);

            for (const isbn of bookIsbns) {
                if (books[isbn].title && books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
                    matchingBooks.push({ isbn: isbn, ...books[isbn] });
                }
            }

            if (matchingBooks.length > 0) {
                resolve(JSON.stringify(matchingBooks, null, 4)); // Use JSON.stringify for neat output
            } else {
                reject({ status: 404, message: "No books found with the given title." });
            }
        }, 500); // Simulate network delay
    })
    .then(data => {
        return res.status(200).send(data);
    })
    .catch(error => {
        return res.status(error.status).json({ message: error.message });
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Retrieve ISBN from request parameters

    // Simulate asynchronous operation using a Promise
    new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                const reviews = book.reviews;
                if (Object.keys(reviews).length > 0) {
                    resolve(JSON.stringify(reviews, null, 4)); // Use JSON.stringify for neat output
                } else {
                    reject({ status: 404, message: "No reviews found for this book." });
                }
            } else {
                reject({ status: 404, message: "Book not found for the given ISBN." });
            }
        }, 500); // Simulate network delay
    })
    .then(data => {
        return res.status(200).send(data);
    })
    .catch(error => {
        return res.status(error.status).json({ message: error.message });
    });
});

module.exports.general = public_users;

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    if (!username || username.trim() === "") {
        return false; // Username cannot be empty
    }
    // Check if the username already exists in the 'users' array
    const userExists = users.some(user => user.username === username);
    return !userExists; // Returns true if username is valid (doesn't exist yet), false otherwise
}

const authenticatedUser = (username, password) => {
    // Find a user with the matching username and password
    const matchingUser = users.find(user => user.username === username && user.password === password);
    return !!matchingUser; // Returns true if a matching user is found, false otherwise
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Authenticate the user
    if (authenticatedUser(username, password)) {
        // If authentication is successful, generate a JWT
        let accessToken = jwt.sign({
            data: username // You can include any data here, e.g., user ID, roles
        }, 'access', { expiresIn: 60 * 60 }); // Token expires in 1 hour

        // Store the JWT in the session
        req.session.authorization = {
            accessToken: accessToken,
            username: username
        };

        return res.status(200).json({ message: "User successfully logged in", accessToken: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Review content from query parameter
    const username = req.session.authorization.username; // Username from authenticated session

    // Check if review content is provided
    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Get the reviews for the specific book
    let bookReviews = books[isbn].reviews;

    // Check if the user already has a review for this ISBN
    if (bookReviews[username]) {
        // If user already reviewed, modify the existing review
        bookReviews[username] = review;
        return res.status(200).json({ message: `Review for ISBN ${isbn} by ${username} modified successfully.` });
    } else {
        // If user has not reviewed, add a new review
        bookReviews[username] = review;
        return res.status(201).json({ message: `Review for ISBN ${isbn} by ${username} added successfully.` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Username from authenticated session

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    let bookReviews = books[isbn].reviews;

    // Check if the user has a review to delete for this ISBN
    if (bookReviews[username]) {
        delete bookReviews[username]; // Delete the review
        return res.status(200).json({ message: `Review for ISBN ${isbn} by ${username} deleted successfully.` });
    } else {
        return res.status(404).json({ message: `No review found for ISBN ${isbn} by ${username}.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

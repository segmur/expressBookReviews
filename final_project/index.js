const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer", // Secret key for signing the session ID cookie
    resave: true, // Forces the session to be saved back to the session store, even if the session was never modified
    saveUninitialized: true // Forces a session that is "uninitialized" to be saved to the store
}));

// This middleware will protect all routes under /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session authorization exists
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken']; // Get the access token from the session

        // Verify the JWT
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // If token is valid, attach user info to the request and proceed
                req.user = user;
                next(); // Pass control to the next middleware/route handler
            } else {
                // If token is invalid or expired
                return res.status(403).json({ message: "User not authenticated or token invalid." });
            }
        });
    } else {
        // If no session authorization exists
        return res.status(403).json({ message: "User not logged in." });
    }
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid // This subtitutes the 'doesExist' in Parctice Project

let userswithsamename = users.filter((user) => {
    return user.username === username;});

    // Return true if any user with the same username is found, otherwise false
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {accessToken, username}
        return res.status(200).send("User successfully logged in");

    }else{
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract ISBN and review details
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Ensure review is provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    // Find the book directly using the key
    const book = books[isbn];

    if (!book) {
        // If the book is not found
        return res.status(404).json({ message: "Book not found" });
    }

    // Get the username of the logged-in user
    const username = req.session.authorization.username;

    // Add or update the review for this user
    book.reviews[username] = review;

    // Respond with a plain-text message
    return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
});

// Delete a book review
/*Filter & delete the reviews based on the session username, 
so that a user can delete only his/her reviews and not other users’*/
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Extract the ISBN from the request
  const sessionUsername = req.session.authorization.username; // Extract the session username

  // Find the book that matches the ISBN
  const book = Object.values(books).find((book) => book.ISBN === isbn);

  // If the book is not found
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Check if the user's review exists in the reviews object
  if (book.reviews && book.reviews[sessionUsername]) {
    // Delete the user's review
    delete book.reviews[sessionUsername];
    return res.status(200).json({ message: "Your review has been deleted successfully." });
  } else {
    return res.status(404).json({ message: "You have not posted a review for this book." });
  }
});





module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

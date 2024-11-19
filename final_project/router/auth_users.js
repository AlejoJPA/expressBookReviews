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

  // Find the book with the matching ISBN
  const book = Object.values(books).find(book => book.ISBN && book.ISBN.toLowerCase() === isbn.toLowerCase());

  if (!book) {
    // If the book is not found
    return res.status(404).json({ message: "Book not found" });
  }

  // Get the username of the logged-in user
  const username = req.session.authorization.username;

  // Add or update the review for this user
  book.reviews[username] = review;

  // Respond with a success message
  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

// Delete a book review
/*Filter & delete the reviews based on the session username, 
so that a user can delete only his/her reviews and not other users’*/
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  // Check if user is logged in
  if (!username) {
    return res.status(403).json({ message: "User not logged in." });
  }

  // Find the book with the given ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the user has a review for this book
  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username]; // Delete the user's review
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "Review not found for the user." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

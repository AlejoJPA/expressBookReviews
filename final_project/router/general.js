const express = require('express');
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = process.env.BASE_URL || "http://localhost:5000/";


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
    if (username && password) {
        // Check if the user is not a Valid user (does not already exist)
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "Customer successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
  // Send the books object directly as part of the response
    res.status(200).json({
        books
    });

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const { isbn } = req.params;
    // Attempt to find the book by ISBN
    const bookByISBN = Object.values(books).find(book => book.ISBN && book.ISBN.toLowerCase() === isbn.toLowerCase());
    if (bookByISBN) {
        res.status(200).json(bookByISBN); // Return the book details found by ISBN
    } else {
        // Fallback: Try to fetch the book by key
        const bookByKey = books[isbn]; // ISBN is treated as the key in this case

        if (bookByKey) {
            res.status(200).json(bookByKey); // Return the book found by key
        } else {
            res.status(404).json({ message: "Book not found by ISBN or key" });
        }
    }
 });
  

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();

    // Filter books by author and restructure the output
    const booksByAuthor = Object.entries(books)
        .filter(([isbn, book]) => book.author.toLowerCase() === author)
        .map(([isbn, book]) => ({
            isbn, // Use the key as the ISBN
            title: book.title,
            reviews: book.reviews || {}, // Include reviews or empty object if not present
        }));

    if (booksByAuthor.length > 0) {
        // Return all books matching the given author with the new format
        res.status(200).json({booksByAuthor});
    } else {
        // If no books by the author are found
        res.status(404).json({ message: "Author not found" });
    }
});


public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    // Filter books by author and restructure the output
    const booksByATitle = Object.entries(books)
        .filter(([isbn, book]) => book.title.toLowerCase() === title)
        .map(([isbn, book]) => ({
            isbn, // Use the key as the ISBN
            author: book.author,
            reviews: book.reviews || {}, // Include reviews or empty object if not present
        }));

    if (booksByATitle.length > 0) {
        // Return all books matching the given author with the new format
        res.status(200).json({booksByATitle});
    } else {
        // If no books by the author are found
        res.status(404).json({ message: "Title not found" });
    }
});



//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Extract ISBN from request parameters
  const isbn = req.params.isbn;

  // Find the book directly using the key
  const book = books[isbn];

  if (book) {
    // Return the reviews for the book
    res.status(200).json(book.reviews || {});
  } else {
    // If no book is found, return a 404 error
    res.status(404).json({ message: "Book not found" });
  }

});

// Get the book list available in the shop using async-await (task10)
public_users.get('/async', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}`);
        res.status(200).json({
            success: true,
            message: "Books fetched successfully using async-await",
            books: response.data,
        });
    } catch (error) {
        console.error("Error fetching books:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching books",
            error: error.message || "Unknown error",
        });
    }
});

// Get book details based on ISBN using async-await (task11)
public_users.get('/async/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
        // Make an HTTP GET request to fetch book details
        const response = await axios.get(`${BASE_URL}isbn/${isbn}`);
        
        // If the response is successful, send the book details
        res.status(200).json({
            success: true,
            message: "Book details fetched successfully using async-await",
            book: response.data,
        });
    } catch (error) {
        // Handle errors gracefully
        console.error("Error fetching book details:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching book details",
            error: error.message || "Unknown error",
        });
    }
});


// Get book details based on 'author' using async-await (task12)
public_users.get('/async/author/:author', async (req, res) => {
    const { author } = req.params;

    try {
        // Make an HTTP GET request to fetch book details
        const response = await axios.get(`${BASE_URL}author/${author}`);
        
        // If the response is successful, send the book details
        res.status(200).json({
            success: true,
            message: "Book details fetched successfully using async-await",
            book: response.data,
        });
    } catch (error) {
        // Handle errors gracefully
        console.error("Error fetching book details:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching book details",
            error: error.message || "Unknown error",
        });
    }
});

// Get book details based on 'title' using async-await (task13)
public_users.get('/async/title/:title', async (req, res) => {
    const { title } = req.params;

    try {
        // Make an HTTP GET request to fetch book details
        const response = await axios.get(`${BASE_URL}title/${title}`);
        
        // If the response is successful, send the book details
        res.status(200).json({
            success: true,
            message: "Book details fetched successfully using async-await",
            book: response.data,
        });
    } catch (error) {
        // Handle errors gracefully
        console.error("Error fetching book details:", error.message);
        res.status(500).json({
            success: false,
            message: "Error fetching book details",
            error: error.message || "Unknown error",
        });
    }
});


module.exports.general = public_users;

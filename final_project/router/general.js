const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented_3"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented_4"});

  // Send JSON response with formatted books data from booksdb.js
  res.send(JSON.stringify(books,null,4));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // Extract the ISBN from request parameters
    const isbn = req.params.isbn;
    // Find the book with the matching ISBN
    const book = Object.values(books).find(book => book.ISBN && book.ISBN.toLowerCase() === isbn.toLowerCase());

    if (book) {
        // Return the book details as the response
        res.status(200).json(book);
    } else {
        // If no book is found, send a 404 response
        res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  
    // Extract the author from request parameters
    const author = req.params.author;

    // Filter books by author
    const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

    if (booksByAuthor.length > 0) {
        // Return all books written by the given author
        res.status(200).json(booksByAuthor);
    } else {
        // If no books by the author are found
        res.status(404).json({ message: "Author not found" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  // Find a book with the matching title
  const book = Object.values(books).find(book => book.title && book.title.toLowerCase() === title.toLowerCase());

  if (book) {
    // Return the single book object
    res.status(200).json(book);
  } else {
    // If no book is found, return a 404 error
    res.status(404).json({ message: "Title not found" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Extract ISBN from request parameters
  const isbn = req.params.isbn;

  // Find the book with the matching ISBN
  const book = Object.values(books).find(book => book.ISBN && book.ISBN.toLowerCase() === isbn.toLowerCase());

  if (book) {
    // Return the reviews for the book
    res.status(200).json(book.reviews || {});
  } else {
    // If no book is found, return a 404 error
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username=req.body.username;
  const password=req.body.password;

  if (!username || !password){
    return res.status(400).json({message : "Both username and password are required"})
  }
  let userExists=isValid(username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists.Choose another one"}) 
  }
  users.push({ username: username, password: password });
  return res.status(201).json({ message: `Username ${username} successfully registered.` });

});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Supposons que la liste des livres est disponible sur la route locale '/books'
    const response = await axios.get('http://localhost:5000/books'); // adapte le port/URL selon ton serveur
    books=response.data
    res.send(books);
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la récupération des livres", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;

    if (books[isbn]) {
      res.status(200).json({ book: books[isbn] });
    } else {
      res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des livres", error: error.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const authorQuery = req.params.author.toLowerCase();

  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;

    const booksByAuthor = [];

    for (let key in books) {
      const book = books[key];
      if (book.author.toLowerCase() === authorQuery) {
        booksByAuthor.push({ isbn: key, ...book });
      }
    }

    if (booksByAuthor.length > 0) {
      res.status(200).json({ booksByAuthor });
    } else {
      res.status(404).json({ message: `No books found for author '${authorQuery}'.` });
    }

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des livres", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const titleQuery = req.params.title.toLowerCase();

  try {
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;

    const booksByTitle = [];

    for (let key in books) {
      const book = books[key];
      if (book.title.toLowerCase() === titleQuery) {
        booksByTitle.push({ isbn: key, ...book });
      }
    }

    if (booksByTitle.length > 0) {
      res.status(200).json({ booksByTitle });
    } else {
      res.status(404).json({ message: `No books found with the title '${titleQuery}'.` });
    }

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des livres", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn=req.params.isbn;
  const book=books[isbn]
  if (book){
    res.send(JSON.stringify(book.reviews,null,4));
  } else {
    res.status(404).send(`Book with ISBN ${isbn} not found`)
  }
});

module.exports.general = public_users;

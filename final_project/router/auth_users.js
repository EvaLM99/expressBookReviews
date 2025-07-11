const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
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
  //Write your code here
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
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username; // sécurise l'accès à la session
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }
  // Si l'objet 'reviews' n'existe pas, on le crée
  if (!book.reviews) {
    book.reviews = {};
  }
  // Ajout ou modification de la critique
  book.reviews[username] = review;
  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: `No review by user '${username}' found for book with ISBN ${isbn}` });
  }
  // Supprimer la critique de l'utilisateur
  delete book.reviews[username];
  return res.status(200).json({
    message: `Review by user '${username}' successfully deleted`,
    reviews: book.reviews
  });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

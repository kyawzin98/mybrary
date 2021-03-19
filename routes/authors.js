const express = require("express");
const router = express.Router();

const Author = require("../models/AuthorModel");
const Book = require("../models/BookModel");

router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors,
      searchOptions: req.query
    })
  } catch (e) {
    res.redirect("/")
  }
})

router.get("/create", (req, res) => {
  res.render("authors/new", {author: new Author()})
})

router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`/authors/${author._id}`);
  } catch {
    res.render("authors/new", {
      author,
      errorMessage: "Error Creating Author"
    })
  }
})

router.get("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    const books = await Book.find({author: author._id}).limit(6).exec();
    res.render('authors/show',{
      author,
      books
    })
  } catch (e) {
    // console.log(e)
    if (author == null) {
      res.redirect("/");
    }
  }
})

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", {author})
  } catch {
    res.redirect("/authors")
  }
})

router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author._id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    }
    res.render("authors/new", {
      author,
      errorMessage: "Error Updating Author"
    })
  }
})

router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect(`/authors`);
  } catch {
    if (author == null) {
      res.redirect("/");
    }
    res.redirect(`/authors/${author._id}`);
  }
})
module.exports = router;

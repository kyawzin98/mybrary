const express = require("express");
const router = express.Router();

const Author = require("../models/AuthorModel");

router.get("/",async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== ""){
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index",{
      authors,
      searchOptions: req.query
    })
  }catch (e) {
    res.redirect("/")
  }
})

router.get("/create",(req,res) => {
  res.render("authors/new",{author: new Author()})
})

router.post("/",async (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save();
    // res.redirect(`authors/${newAuthor._id}`);
    res.redirect(`authors`);
  }catch (exc){
    res.render("authors/new",{
      author,
      errorMessage: "Error Creating Author"
    })
  }
})

module.exports = router;

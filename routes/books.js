const express = require("express");
const router = express.Router();

const Book = require("../models/BookModel");
const Author = require("../models/AuthorModel");
const allowedImageTypes = ["image/jpeg","image/jpg","image/png","image/gif"]

router.get("/",async (req, res) => {
  let query = Book.find();
  let searchOptions = req.query;
  if (searchOptions.title != null && searchOptions.title !== ""){
    query = query.regex('title',new RegExp(searchOptions.title, "i"));
  }
  if (searchOptions.publishedBefore != null && searchOptions.publishedBefore !== ""){
    query = query.lte('publishedDate',searchOptions.publishedBefore)
  }
  if (searchOptions.publishedAfter != null && searchOptions.publishedAfter !== ""){
    query = query.gte('publishedDate',searchOptions.publishedAfter)
  }
  try {
    const books = await query.populate({path: "author",model: "Author", select:"name"}).exec();
    res.render("books/index",{
      books,
      searchOptions
    })
  }catch (e) {
    res.redirect("/")
  }
})

router.get("/create", async (req,res) => {
  await renderNewPage(res, new Book())
})

router.post("/",async (req, res) => {
  const {title, author, publishedDate, pageCount, description, cover} = req.body;
  const book = new Book({
    title,
    author,
    publishedDate: new Date(publishedDate),
    pageCount,
    description,
    // coverImage
  });
  saveCover(book, cover)
  console.log(book)
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook._id}`);
    res.redirect(`books`);
  }catch{
    await renderNewPage(res, book, true)
  }
})


async function renderNewPage(res, book, hasErrors = false){
  try{
    const authors = await Author.find();
    const params = {
      book,
      authors
    }
    if (hasErrors) params.errorMessage = 'Error Creating Book'
    res.render("books/new", params)
  }catch {
    res.redirect("/books")
  }
}

function saveCover(book, encodedCover){
  if (encodedCover == null) return
  const cover = JSON.parse(encodedCover);
  if (cover !== null && allowedImageTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data, 'base64');
    book.coverImageType = cover.type;
  }
}

module.exports = router;

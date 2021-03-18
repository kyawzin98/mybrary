const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer")

const Book = require("../models/BookModel");
const Author = require("../models/AuthorModel");
const uploadPath = path.join("public", Book.coverImageBasePath);
const allowedImageTypes = ["image/jpeg","image/jpg","image/png","image/gif"]
const upload = multer({
  dest: uploadPath,
  fileFilter:(req,file,callback) => {
    callback(null, allowedImageTypes.includes(file.mimetype) )
  }
})

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
    const books = await query.exec();
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

router.post("/",upload.single('cover'),async (req, res) => {
  console.log(req)
  const coverImage = req.file != null ? req.file.filename : null;
  const {title, author, publishedDate, pageCount, description} = req.body;
  const book = new Book({
    title,
    author,
    publishedDate: new Date(publishedDate),
    pageCount,
    description,
    coverImage
  });
  console.log(book)
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook._id}`);
    res.redirect(`books`);
  }catch{
    if (book.coverImage  != null ) removeBookCover(book.coverImage)
    await renderNewPage(res, book, true)
  }
})

function removeBookCover(filename){
  fs.unlink(path.join(uploadPath, filename), err => {
    if (err) console.log(err)
  })
}

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

module.exports = router;

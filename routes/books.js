const express = require("express");
const router = express.Router();

const Book = require("../models/BookModel");
const Author = require("../models/AuthorModel");
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

router.get("/", async (req, res) => {
  let query = Book.find();
  let searchOptions = req.query;
  if (searchOptions.title != null && searchOptions.title !== "") {
    query = query.regex('title', new RegExp(searchOptions.title, "i"));
  }
  if (searchOptions.publishedBefore != null && searchOptions.publishedBefore !== "") {
    query = query.lte('publishedDate', searchOptions.publishedBefore)
  }
  if (searchOptions.publishedAfter != null && searchOptions.publishedAfter !== "") {
    query = query.gte('publishedDate', searchOptions.publishedAfter)
  }
  try {
    const books = await query.populate({path: "author", model: "Author", select: "name"}).exec();
    res.render("books/index", {
      books,
      searchOptions
    })
  } catch (e) {
    res.redirect("/")
  }
})

router.get("/create", async (req, res) => {
  await renderNewPage(res, new Book())
})

router.post("/", async (req, res) => {
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
    res.redirect(`books/${newBook._id}`);
    // res.redirect(`books`);
  } catch {
    await renderNewPage(res, book, true)
  }
})


router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate({path: "author", model: "Author"})
    res.render('books/show', {
      book
    })
  } catch {
    res.redirect('/');
  }
})

router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    await renderEditPage(res, book)
  } catch {
    res.redirect("/")
  }
})

router.put("/:id", async (req, res) => {
  const {title, author, publishedDate, pageCount, description, cover} = req.body;
  let book = {};
  try {
    let book = await Book.findById(req.params.id);
    book.title = title;
    book.author = author;
    book.publishedDate = new Date(publishedDate);
    book.pageCount = pageCount;
    book.description = description;
    // coverImage
    if (cover != null && cover !== "") {
      saveCover(book, cover)
    }
    await book.save();
    res.redirect(`/books/${book._id}`);
    // res.redirect(`books`);
  } catch {
    if (book != null) {
      await renderEditPage(res, book, true)
    } else {
      res.redirect("/")
    }
  }
})

router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect(`/books`);
  } catch {
    if (book != null) {
      res.render(`books/show`,{
        book,
        errorMessage: "Could not remove book"
      });
    } else res.redirect("/")
  }
})


async function renderNewPage(res, book, hasErrors = false) {
  await renderFormPage(res, book, 'new', hasErrors)
}

async function renderEditPage(res, book, hasErrors = false) {
  await renderFormPage(res, book, 'edit', hasErrors)
}

async function renderFormPage(res, book, form, hasErrors = false) {
  try {
    const authors = await Author.find();
    const params = {
      book,
      authors
    }
    if (hasErrors) {
      if (form == "new") {
        params.errorMessage = 'Error Creating Book'
      } else {
        params.errorMessage = 'Error Updating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect("/books")
  }
}

function saveCover(book, encodedCover) {
  if (encodedCover == null) return
  const cover = JSON.parse(encodedCover);
  if (cover !== null && allowedImageTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64');
    book.coverImageType = cover.type;
  }
}

module.exports = router;

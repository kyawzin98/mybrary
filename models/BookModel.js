const mongoose = require("mongoose")
const path = require("path");
const coverImageBasePath = "uploads/bookCovers"
const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Book name is required"]
  },
  description: {
    type: String,
  },
  publishedDate: {
    type: Date,
    required: [true,"publishedDate is required"]
  },
  pageCount: {
    type: Number,
    required: [true, "page count is required"]
  },
  coverImage: {
    type: String,
    required: [true, "Cover image is required"]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

BookSchema.virtual('coverImagePath').get(function (){
  if (this.coverImage !== null) return path.join('/',coverImageBasePath, this.coverImage);
})

module.exports = mongoose.model("Book", BookSchema)
module.exports.coverImageBasePath = coverImageBasePath;

const mongoose = require("mongoose")
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
    type: Buffer,
    required: [true, "Cover image is required"]
  },
  coverImageType: {
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
  if (this.coverImage !== null && this.coverImageType != null) {
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})

module.exports = mongoose.model("Book", BookSchema)

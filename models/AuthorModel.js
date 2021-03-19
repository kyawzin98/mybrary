const mongoose = require("mongoose")
const BookModel = require("./BookModel");
const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "author name is required"]
  }
})

AuthorSchema.pre('remove',function (next){
  BookModel.find({author: this._id}, (err, books) => {
    if (err){
      next(err);
    } else if (books.length > 0){
      next(new Error('This author has books'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model("Author", AuthorSchema)

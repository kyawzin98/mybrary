const mongoose = require("mongoose")

const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "author name is required"]
  }
})

module.exports = mongoose.model("Author", AuthorSchema)

const express = require("express");

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const methodOverride = require("method-override")

//Routes
const indexRoutes = require("./routes/index")
const authorsRoutes = require("./routes/authors")
const booksRoutes = require("./routes/books")

// if (process.env.NODE_ENV !== "production"){
//   require("dotenv").load();
// }

//Init express app
const app = express();

app.set("view engine","ejs")
app.set("views", __dirname + "/views")
app.set("layout","layouts/layout")
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static("public"))
app.use(bodyParser.urlencoded({limit: "10mb",extended: false}))
dotenv.config({path:"./.env"})

//Connect to DB
mongoose.connect(process.env.DATABASE_URL,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open', () => console.log("Connected to MongoDB"))

app.use("/",indexRoutes)
app.use("/authors",authorsRoutes)
app.use("/books",booksRoutes)

const PORT = process.env.PORT || 3200;
app.listen(PORT, ()=>{
  console.log(`Server is running on Port- ${PORT}`)
})

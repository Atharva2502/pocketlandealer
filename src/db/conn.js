const mongoose = require("mongoose");

// `${process.env.DB_URL}Database` || "mongodb://localhost:27017/Database";

const URL = "mongodb://localhost:27017/Database"

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("Database Connected")
})

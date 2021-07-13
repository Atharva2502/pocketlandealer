const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Abhishek:abhi23@pld.08fbq.mongodb.net/Database", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("Database Connected")
})

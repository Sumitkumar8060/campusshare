
const cors = require("cors");
const express=require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");



dotenv.config();
connectDB();

const app=express();
app.use(cors());
app.use(express.json());

// const PORT = process.env.PORT ||5000;



app.get("/",(req,res)=>{
    res.send("CampusShare backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);


// app.listen(PORT,()=>{
//     console.log('server is running on http://localhost:${PORT}');
// });

module.exports = app;
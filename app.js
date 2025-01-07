require("dotenv").config();
const mongoose = require("mongoose");
const connection = require("./config/dpConnect");
console.log(process.env.NODE_ENV);
const express = require("express");
const app = express();
const PORT= process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOption = require("./config/corsOption");
const path = require("path");
// const router = require("./routes/root")
app.use(express.json());
app.use(cookieParser());
app.use("/",require("./routes/root"));
app.use("/auth",require("./routes/authRoutes"));
app.use("/users",require("./routes/userRoute"));


app.use(
  cors({
    origin: "http://frontend-domain.com", // Replace with your frontend domain
    credentials: true,                   // Allow cookies
  })
);

app.use(express.static(path.join(__dirname,"public")))


mongoose.connection.once("open",()=>{
  console.log("dp connected (:");
  app.listen(PORT,()=>{
    console.log(`server running on port number ${PORT}`);
  });
});

 mongoose.connection.on("error",(err)=>{
  console.log(err);
});

app.all("*",(req,res)=>{
  if(req.accepts("html")){
    res.sendFile(path.join(__dirname,"views","404.html"));
  }else if(req.accepts("json")){
    res.json("this page isn't exist");
  }else{
    res.send("this page isn't exist")
  };
});

connection()
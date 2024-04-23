const express=require("express")

const app=express()
const cors = require("cors");
const { mongoconnection } = require("./Databaseconnection/connection");
const { router } = require("./Databaseconnection/router");

app.use(cors());
app.use(express.urlencoded({extended:false}))
app.use(express.json({}))

mongoconnection().then(()=>console.log("connection sucesfull")).catch((err)=>console.log(err));
app.use(router)
app.listen("9000",()=>{
    console.log("server started succesfully")
})

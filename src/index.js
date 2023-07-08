const express = require('express')
const mongoose = require('mongoose')
const router = require('./routes/route')
const multer = require('multer')

const app = express()

app.use(express.json())
app.use(multer().any())
mongoose.connect('mongodb+srv://tshivendra07:6sWDbb2xoYJ5IZ0N@cluster0.3dhywqg.mongodb.net/E-com?retryWrites=true&w=majority', {
    useNewUrlParser : true
}).then(() =>{
    console.log('Database Connected')
}).catch((error) =>{
    console.log(error.message)
})


app.use('/', router)

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>{
    console.log(`app is running at http://localhost:${PORT}`)
})
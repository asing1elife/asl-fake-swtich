const express = require('express')
const path = require('path')
const app = express()

app.use(express.static("./"))

app.listen(8080, () => {
  console.log(`App listening at port 8080`)
})
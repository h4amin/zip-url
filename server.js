const express = require('express')
const mongoose = require('mongoose')
const ZipUrl = require('./models/zipurl')

require('dotenv').config();
const uri = process.env.MONGODB_URI;

const app = express()

mongoose.connect(uri, {
  useNewUrlParser: true, useUnifiedTopology: true
})
const db = mongoose.connection;

// Handle successful connection
db.on('connected', () => {
  console.log('Connected to MongoDB successfully');
});

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
  const zipurls = await ZipUrl.find()
  res.render('index', { zipurls: zipurls })
})



app.get('/:zipurl', async (req, res) => {
  const zip = await ZipUrl.findOne({ short: req.params.zipurl })
  if (zip == null) return res.sendStatus(404)

  zip.clicks++
  zip.save()

  res.redirect(zip.full)
})

app.post('/zipurl', async (req, res) => {
    await ZipUrl.create({ full: req.body.fullUrl })
  
    res.redirect('/')
  })

app.listen(process.env.PORT || 5000);
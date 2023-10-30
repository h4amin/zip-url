// const express = require('express')
// const mongoose = require('mongoose')
// const ZipUrl = require('./models/zipurl')

// require('dotenv').config();
// const uri = process.env.MONGODB_URI;

// const app = express()

// mongoose.connect(uri, {
//   useNewUrlParser: true, useUnifiedTopology: true
// })
// const db = mongoose.connection;

// // Handle successful connection
// db.on('connected', () => {
//   console.log('Connected to MongoDB successfully');
// });

// app.set('view engine', 'ejs')
// app.use(express.urlencoded({ extended: false }))

// app.get('/', async (req, res) => {
//   const zipurls = await ZipUrl.find()
//   res.render('index', { zipurls: zipurls })
// })



// app.get('/:zipurl', async (req, res) => {
//   const zip = await ZipUrl.findOne({ short: req.params.zipurl })
//   if (zip == null) return res.sendStatus(404)

//   zip.clicks++
//   zip.save()

//   res.redirect(zip.full)
// })

// app.post('/zipurl', async (req, res) => {
//     await ZipUrl.create({ full: req.body.fullUrl })
  
//     res.redirect('/')
//   })

// app.listen(process.env.PORT || 5000);

const express = require('express');
const mongoose = require('mongoose');
const ZipUrl = require('./models/zipurl');
const cookieParser = require('cookie-parser'); // Require cookie-parser

require('dotenv').config();
const uri = process.env.MONGODB_URI;

const app = express();

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

// Handle successful connection
db.on('connected', () => {
  console.log('Connected to MongoDB successfully');
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Use the cookie-parser middleware
app.use(cookieParser());

// Middleware to identify users using cookies
app.use((req, res, next) => {
  // Check if the user has a unique identifier cookie, if not, create one
  if (!req.cookies.userIdentifier) {
    const userIdentifier = 'user_' + Date.now(); // Generate a unique user identifier
    res.cookie('userIdentifier', userIdentifier, { maxAge: 900000 }); // Set a cookie with a 15-minute expiration
    req.userIdentifier = userIdentifier;
  } else {
    req.userIdentifier = req.cookies.userIdentifier;
  }

  next();
});

app.get('/', async (req, res) => {
  // Retrieve data specific to the user
  const zipurls = await ZipUrl.find({ userIdentifier: req.userIdentifier });
  res.render('index', { zipurls: zipurls });
});

app.get('/:zipurl', async (req, res) => {
  const zip = await ZipUrl.findOne({ short: req.params.zipurl });

  if (zip == null) {
    return res.sendStatus(404);
  }

  if (zip.public || zip.userIdentifier === req.userIdentifier) {
    zip.clicks++;
    zip.save();
    return res.redirect(zip.full);
  } else {
    return res.sendStatus(403); // Forbidden to access private links of other users
  }
});


app.post('/zipurl', async (req, res) => {
  // Get the user identifier from the cookie
  const userIdentifier = req.userIdentifier;

  // Create data associated with the user
  await ZipUrl.create({ full: req.body.fullUrl, userIdentifier: userIdentifier, public: true });

  res.redirect('/');
});

app.listen(process.env.PORT || 5000);

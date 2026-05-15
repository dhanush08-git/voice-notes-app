const express = require('express');
const cors = require('cors');
const mongoose =require('mongoose');
require('dotenv').config();
const notesRouter = require('./routes/notes');
const passport = require('passport');
require('./config/passport');

const app = express();
app.use(cors());
app.use(express.json());
app.use(require('express-session')({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('mongodb connected'))
    .catch((err) => console.log(err, 'error connecting to mongodb'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', notesRouter);


app.get("/",(req,res) => res.send("server is running"));

app.listen(5000, () => {
    console.log('Server on http://localhost:5000');
});





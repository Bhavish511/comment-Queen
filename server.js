const express = require("express");
const fs = require("fs");
const https = require("https");
require('dotenv').config();

const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

const authRoutes = require('./routes/authRoutes');
const facebookRoutes = require('./routes/facebookRoutes');
const instagramRoutes = require('./routes/instagramRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.set("trust proxy", 1);

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/facebook', facebookRoutes);
app.use('/instagram', instagramRoutes);

const sslOptions = {
  key: fs.readFileSync("./ssl/localhost-key.pem"),
  cert: fs.readFileSync("./ssl/localhost.pem"),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});

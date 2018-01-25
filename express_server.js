//Required frameworks and packages

var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

app.use(express.static('public'));

//Setting port to default

var PORT = process.env.PORT || 8080;

//Object containing all short and long versions of URLs

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "LiamTheChampion",
    email: "liam@example.com",
    password: "baseball-123"
  },
  "user2RandomID": {
    id: "rachie.dxo",
    email: "rachie@example.com",
    password: "chococoffee-23"
  },
};

//Function to generate 6 digit alphanumeric string, used to generate short URLs

function generateRandomString() {

  var random = "";
  var poss = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    random += poss.charAt(Math.floor(Math.random() * poss.length));
  }
return random;
}

//GET methods

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["username"];
  let templateVars = { urls: urlDatabase, user: user_id };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["username"];
  let templateVars = { user: user_id }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["username"];
  let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id], user: user_id };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let longURL = urlDatabase[short];
  let user_id = req.cookies["username"];
  let templateVars = { user: user_id }

  res.render(templateVars);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

//POST methods

app.post("/urls", (req, res) => {
urlDatabase[generateRandomString()] = req.body.longURL;
res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let user = req.body.username;

    res.cookie('username', user);
    res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  let user = req.body.username;

    res.clearCookie('username', user);
    res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let userid = generateRandomString();
  let emaily = req.body.email;
  let passwordy = req.body.password;

if(emaily === '' || passwordy === '') {
  res.status(400).send('Please enter a valid email/password');
  }
for(let userid in users) {
  if(users[userid].email === emaily) {
    res.status(400).send('There is already an account associated with this email address.');
  }
}

  users[userid] = {
    id: userid,
    email: emaily,
    password: passwordy
  };

    res.cookie('user_id', userid);
    res.redirect('/urls');
});

//Console output for user

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
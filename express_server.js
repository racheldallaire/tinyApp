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

//Object containing all URL info
var urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "LiamTheChampion"
    // views: 0
    // uniqueVisits: 0
    // createdAt: new Date();
  },

  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "rachie.dxo"
    // views: 0
    // uniqueVisits: 0
    // createdAt: newDate(),
  }
};

//Object containing all user information
const users = {
  "LiamTheChampion": {
    id: "LiamTheChampion",
    email: "liam@example.com",
    password: "baseball-123"
  },
  "rachie.dxo": {
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
//Homepage (unused)
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Main URLs page
app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = { urls: urlDatabase, user: users[user_id]};
  res.render("urls_index", templateVars);
});

//Converts into json object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Create new URL page (with function only allowing access to logged in users)
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  function validateUser () {
    let validate = true;
    if (!user_id) {
      validate = false;
    }
    return validate;
  }
  if (validateUser() === false) {
    res.redirect('/login');
    return null;
  }
  let templateVars = { user: users[user_id] };
  res.render("urls_new", templateVars);
});

//Edit short URL page
app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id].longURL, user: users[user_id] };
  if(urlDatabase[req.params.id].userID !== user_id) {
    res.status(400).send('You cannot edit a URL you did not create.');
    return null;
  }
  res.render("urls_show", templateVars);
});

//Redirecting users from short URL to original link
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let longURL = urlDatabase[short].longURL;
  let user_id = req.cookies["user_id"];
  let templateVars = { user: users[user_id] };
  res.render(templateVars);
  res.redirect(longURL);
});

//Registration page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//Login page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//POST methods for each page

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL : shortURL,
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  } ;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  let user_id = req.cookies["user_id"];
  if(urlDatabase[shortURL].userID !== user_id) {
    res.status(400).send('You cannot delete a URL you did not create.');
    return null;
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let emaily = req.body.email;
  let passwordy = req.body.password;
  let flag = true;
for(let userid in users) {
  if(users[userid].email === emaily && users[userid].password === passwordy) {
    res.cookie('user_id', users[userid].id);
    res.redirect('/urls');
    flag = false;
  }
}
  if (flag) {
    res.status(403).send("Incorrect login details.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let newid = generateRandomString();
  let emaily = req.body.email;
  let passwordy = req.body.password;
  let errorMessage = '';
  if(emaily === '' || passwordy === '') {
    errorMessage = 'Please enter a valid email/password.';
  }
  for(let userid in users) {
    if(users[userid].email === emaily) {
      errorMessage = 'There is already an account associated with this email address.';
    }
  }
  if (!errorMessage) {
    users[newid] = {
    id: newid,
    email: emaily,
    password: passwordy
  };
  res.cookie('user_id', newid);
  res.redirect('/urls');
  } else {
    res.status(400).send(errorMessage);
  }
});

//Console output for user
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
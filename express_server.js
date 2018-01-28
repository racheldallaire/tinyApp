//Required frameworks and packages
const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const app = express();
app.set("view engine", "ejs");

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['Go buy a chopper and have a doctor on speed dial I guess - M.A.A.d city'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//Setting port to default
const PORT = process.env.PORT || 8080;

//Objects containing all URL info & user information
const urlDatabase = {};
const users = {};

//Function to generate 6 digit alphanumeric string, used to generate short URLs
function generateRandomString() {
  var random = "";
  var poss = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    random += poss.charAt(Math.floor(Math.random() * poss.length));
  }
return random;
}

//Function to display user-specific URLS
function urlsForUser(id) {
  let userURLs = {};
  for(let shortURL in urlDatabase) {
    if( urlDatabase[shortURL].userID === id){
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLs;
}


//GET methods
//Homepage (unused)
app.get("/", (req, res) => {
  res.end('hello');
  // res.redirect("/urls");
});

//Main URLs page
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let display = urlsForUser(user_id);
  if (!user_id) {
    res.redirect('/login');
    return null;
  }
  let templateVars = { urls: display, user: users[user_id]};
  res.render("urls_index", templateVars);
});

//Converts into json object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Create new URL page (with function only allowing access to logged in users)
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
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
  let user_id = req.session.user_id;
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
  if (req.params.shortURL in urlDatabase) {
    let longURL = urlDatabase[short].longURL;
    res.redirect(longURL);
    return null;
  } else {
    res.status(401).send('Please enter a valid URL.');
    return null;
  }
  let user_id = req.session.user_id;
  let templateVars = { user: users[user_id] };
  res.render(templateVars);
});

//Registration page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//Login page
app.get("/login", (req, res) => {
  let user_id = req.session.user_id;
  let display = urlsForUser(user_id);
  if (user_id) {
    res.redirect('/urls');
    return null;
  }
  res.render("urls_login");
});

//POST methods for each page

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL : shortURL,
    longURL: req.body.longURL,
    userID: req.session.user_id
  } ;
  res.redirect("/urls/"/* + shortURL */);
  //N.B. I was asked to redirect to the edit page after creating a new URL, but this did not seem logical to me so I am redirecting back to the main urls page instead. I left the code that I was asked to produce in comments to show that I know how to do it, but would rather not for the sake of a better user experience.
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  let user_id = req.session.user_id;
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
    if(users[userid].email === emaily && bcrypt.compareSync(passwordy, users[userid].password)) {
      req.session.user_id = users[userid].id;
      res.redirect('/urls');
      flag = false;
    }
  }
  if (flag) {
    res.status(403).send("Incorrect login details.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let newid = generateRandomString();
  let emaily = req.body.email;
  let passwordy = req.body.password;
  let hashedPassword  = bcrypt.hashSync(passwordy, 10);
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
    password: hashedPassword
  };
  req.session.user_id = newid;
  res.redirect('/urls');
  } else {
    res.status(400).send(errorMessage);
  }
});

//Console output for user
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
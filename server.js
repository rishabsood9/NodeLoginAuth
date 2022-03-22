require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const users = [];

app.set("view-engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  try {
    res.render("welcome.ejs");
  } catch (e) {
    throw e;
  }
});

app.get("/login", clearCookie, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", clearCookie, (req, res) => {
  res.render("register.ejs");
});

app.get("/welcome", authenticateToken, (req, res) => {
  const data = users.find(
    (user) => user.email == req.user.email && user.password == req.user.password
  );
  if (data) {
    res.render("index.ejs", { name: data.name });
  } else {
    return res.sendStatus(401);
  }
});

app.post("/register", (req, res) => {
  try {
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.redirect("/login");
  } catch (e) {
    res.redirect("/register");
    throw e;
  }
});

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.cookie("authorization", accessToken);
  res.redirect("/welcome");
});

app.post("/logout", clearCookie, (req, res) => {
  res.redirect("/");
});

function authenticateToken(req, res, next) {
  const cookie = req.headers.cookie;
  const token = cookie && cookie.split("=")[1];
  if (token == null) return res.sendStatus(401);
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        req.user = user;
        next();
      }
    });
  } catch (e) {
    throw e;
  }
}

function clearCookie(req, res, next) {
  if (req.headers.cookie) {
    res.clearCookie("authorization");
  }
  next();
}

app.listen(4000);

const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const Strategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

const app = express();
const port = 3040;

app.use(bodyParser.json());

// Set up the JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "your-secret-key",
};

passport.use(
  new Strategy(jwtOptions, (payload, done) => {
    if (payload.sub === "user") {
      done(null, true);
    } else {
      done(null, false);
    }
  })
);

// Authentication and authorisation middleware
const requireAuth = passport.authenticate("jwt", { session: false });

// Define functions for calclator

function multiply(n1, n2) {
    return n1 * n2;
  }

  function add(n1, n2) {
    return n1 + n2;
  }
  
  function subtract(n1, n2) {
    return n1 - n2;
  }
  
  function divide(n1, n2) {
    if (n2 === 0) {
      throw new Error("Cannot divide by zero");
    }
    return n1 / n2;
  }

// Calculator endpoints
app.get("/calculate", passport.authenticate("jwt", { session: false }), (req, res) => {
    try {
      const n1 = parseFloat(req.query.n1);
      const n2 = parseFloat(req.query.n2);
      const operation = req.query.operation;
      if (isNaN(n1)) {
        throw new Error("Invalid value for n1");
      }
      if (isNaN(n2)) {
        throw new Error("Invalid value for n2");
      }
      let result;
      switch (operation) {
        case "add":
          result = add(n1, n2);
          break;
        case "subtract":
          result = subtract(n1, n2);
          break;
        case "multiply":
          result = multiply(n1, n2);
          break;
        case "divide":
          result = divide(n1, n2);
          break;
        default:
          throw new Error("Invalid operation");
      }
      res.status(200).json({ Status: "Success", Statuscode: 200, Answer: result });
    } catch (error) {
      console.error(error);
      res.status(400).json({ Status: "Error", Statuscode: 400, Msg: error.message });
    }
  });

// Generate a JWT token when the users does a GET request to login endpoint
app.get("/login", (req, res) => {
  const token = jwt.sign({ sub: "user123" }, "your-secret-key");
  res.json({ token });
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});

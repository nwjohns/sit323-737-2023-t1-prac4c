const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

const app = express();
const port = 3040;

app.use(bodyParser.json());

// Set up the JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: "your-secret-key",
};

passport.use(
  new JWTStrategy(jwtOptions, (jwt_payload, done) => {
    try {
      if (jwt_payload.sub === "user123") {
        done(null, true);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error, false);
    }
  })
);

// Authentication and authorisation middleware
const requireAuth = passport.authenticate("jwt", { session: false });

// Define functions for the calculator
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
app.get("/calculate", requireAuth, (req, res) => {
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

// Generate a JWT token when the user does a POST request to the login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Verify username and password
  if (username === "user123" && password === "password123") {
    const token = jwt.sign({ sub: "user123" }, "your-secret-key");
    res.json({ token });
  } else {
    res.status(401).json({ Status: "Error", Statuscode: 401, Msg: "Invalid credentials" });
  }
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});

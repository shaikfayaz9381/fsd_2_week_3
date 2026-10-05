const express = require("express");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Configure session
app.use(
    session({
        secret: "mySecretKey123",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 60000,       // 1 minute
            httpOnly: true
        }
    })
);

// -------------------------------
// HOME PAGE
// -------------------------------
app.get("/", (req, res) => {
    res.send(`
        <h1>Session Management and Authentication</h1>

        <h2>Part A - Session Management</h2>
        <a href="/set-session">Set Session</a><br>
        <a href="/dashboard">View Session / Dashboard</a><br>
        <a href="/destroy-session">Destroy Session</a><br>

        <h2>Part B - User Authentication</h2>
        <a href="/login">Login</a><br>
        <a href="/logout">Logout</a>
    `);
});

// -------------------------------
// SET SESSION
// -------------------------------
app.get("/set-session", (req, res) => {

    req.session.username = "admin";

    // Initialize visitCount if it doesn't exist
    if (!req.session.visitCount) {
        req.session.visitCount = 0;
    }

    req.session.visitCount++;

    res.send(`
        <h2>Session Created</h2>
        <p>Username: ${req.session.username}</p>
        <p>Visit Count: ${req.session.visitCount}</p>

        <a href="/dashboard">View Dashboard</a>
    `);
});

// -------------------------------
// AUTHENTICATION MIDDLEWARE
// -------------------------------
function isAuthenticated(req, res, next) {

    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}

// -------------------------------
// LOGIN PAGE
// -------------------------------
app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// -------------------------------
// LOGIN PROCESS
// -------------------------------
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    // Hardcoded credentials
    const validUsername = "admin";
    const validPassword = "12345";

    if (username === validUsername && password === validPassword) {

        // Store user information in session
        req.session.user = username;

        // Initialize visit count
        req.session.visitCount = 0;

        res.redirect("/dashboard");

    } else {

        res.render("login", {
            error: "Invalid username or password!"
        });
    }
});

// -------------------------------
// PROTECTED DASHBOARD
// -------------------------------
app.get("/dashboard", isAuthenticated, (req, res) => {

    // Increase visit count
    req.session.visitCount++;

    res.render("dashboard", {
        username: req.session.user,
        visitCount: req.session.visitCount,
        sessionId: req.sessionID
    });
});

// -------------------------------
// DESTROY SESSION - PART A
// -------------------------------
app.get("/destroy-session", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Error destroying session");
        }

        res.send(`
            <h2>Session Destroyed Successfully</h2>
            <a href="/">Return to Home</a>
        `);
    });
});

// -------------------------------
// LOGOUT - PART B
// -------------------------------
app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Error logging out");
        }

        res.redirect("/login");
    });
});

// -------------------------------
// START SERVER
// -------------------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
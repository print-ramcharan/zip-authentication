const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const { generateProof, verifyProof, createCommitment, hashPassword } = require("./zkpUtils");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234567890",
    database: "zkp_auth",
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

// ✅ Register User (Store ZKP Commitment)
app.post("/register", async (req, res) => {
    try {

    console.log("Received request:", req.body);
        const { email, commitment, salt } = req.body;
        if (!email || !commitment || !salt) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 🔹 Check if user already exists
        const checkQuery = "SELECT email FROM users WHERE email = ?";
        db.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }

            if (results.length > 0) {
                // 🔹 If user exists, update commitment & salt
                const updateQuery = "UPDATE users SET commitment = ?, salt = ? WHERE email = ?";
                db.query(updateQuery, [commitment, salt, email], (updateErr) => {
                    if (updateErr) {
                        console.error("Database error:", updateErr);
                        return res.status(500).json({ success: false, error: "Failed to update user" });
                    }
                    return res.json({ success: true, message: "✅ User updated successfully!" });
                });
            } else {
                // 🔹 Insert new user
                const insertQuery = "INSERT INTO users (email, commitment, salt) VALUES (?, ?, ?)";
                db.query(insertQuery, [email, commitment, salt], (insertErr) => {
                    if (insertErr) {
                        console.error("Database error:", insertErr);
                        return res.status(500).json({ success: false, error: "Registration failed" });
                    }
                    return res.json({ success: true, message: "✅ Registration successful!" });
                });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ✅ Generate Proof for Login
// app.post("/generate-proof", async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

//         // 🔹 Fetch stored commitment
//         const query = "SELECT commitment FROM users WHERE email = ?";
//         db.query(query, [email], async (err, results) => {
//             if (err || results.length === 0) return res.status(404).json({ error: "User not found" });

//             const storedCommitment = results[0].commitment;

//             // 🔹 Hash Password and Generate Proof
//             const passwordHash = hashPassword(password);
//             const proofData = await generateProof(passwordHash, storedCommitment);
            
//             res.json(proofData);
//         });
//     } catch (error) {
//         console.error("Error generating proof:", error);
//         res.status(500).json({ error: "Proof generation failed" });
//     }
// });
app.get("/getSalt", async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email required" });
    }

    try {
        const [rows] = await db.promise().query("SELECT salt FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, salt: rows[0].salt });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post("/verify", async (req, res) => {
    const { email, proof } = req.body;
    if (!email || !proof) {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }

    try {
        const [rows] = await db.promise().query("SELECT commitment FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare proof with stored commitment
        if (proof === rows[0].commitment) {
            res.json({ success: true, message: "Authentication successful" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// ✅ Start Server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

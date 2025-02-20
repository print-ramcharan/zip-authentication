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
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

        // 🔹 Hash Password and Generate Commitment
        const passwordHash = hashPassword(password);
        const commitment = createCommitment(passwordHash);

        // 🔹 Store in MySQL (Prevent Duplicates)
        const query = "INSERT INTO users (email, commitment) VALUES (?, ?) ON DUPLICATE KEY UPDATE commitment = ?";
        db.query(query, [email, commitment, commitment], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, error: "Registration failed" });
            }
            res.json({ success: true, message: "User registered successfully" });
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ✅ Generate Proof for Login
app.post("/generate-proof", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

        // 🔹 Fetch stored commitment
        const query = "SELECT commitment FROM users WHERE email = ?";
        db.query(query, [email], async (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ error: "User not found" });

            const storedCommitment = results[0].commitment;

            // 🔹 Hash Password and Generate Proof
            const passwordHash = hashPassword(password);
            const proofData = await generateProof(passwordHash, storedCommitment);
            
            res.json(proofData);
        });
    } catch (error) {
        console.error("Error generating proof:", error);
        res.status(500).json({ error: "Proof generation failed" });
    }
});

// ✅ Verify Proof (Authentication)
app.post("/verify", async (req, res) => {
    try {
        const { proof, publicSignals } = req.body;

        // 🔹 Verify ZKP Proof
        const isValid = await verifyProof(proof, publicSignals);

        res.json({ success: isValid });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ success: false, error: "Verification failed" });
    }
});

// ✅ Start Server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

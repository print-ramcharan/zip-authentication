const crypto = require("crypto");
const bigInt = require("big-integer");

// 🔹 Secure Parameters (Choose Large Prime p and Generator g)
const p = bigInt("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1", 16); // Large prime
const g = bigInt(2); // Generator

// 🔹 Hash Password Securely using SHA-256
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// 🔹 Convert Hash to BigInt
function toBigInt(hash) {
    return bigInt(hash, 16).mod(p);
}

// 🔹 Create Commitment using g^x mod p
function createCommitment(secret) {
    const secretBigInt = toBigInt(hashPassword(secret));
    return g.modPow(secretBigInt, p).toString();
}

// 🔹 Generate Proof using g^x mod p (Simulating)
async function generateProof(secret, commitment) {
    const secretBigInt = toBigInt(hashPassword(secret));
    const proof = g.modPow(secretBigInt, p).toString(); // Simulated proof
    return { proof, publicSignals: commitment };
}

// 🔹 Verify Proof (Check if g^x mod p matches stored commitment)
async function verifyProof(proof, publicSignals) {
    return proof === publicSignals;
}

module.exports = { generateProof, verifyProof, createCommitment, hashPassword };

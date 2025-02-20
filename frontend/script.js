// async function register() {
//     const email = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value.trim();
//     const statusElement = document.getElementById("result");

//     if (!email || !password) {
//         statusElement.innerText = "Please enter both email and password.";
//         statusElement.classList.add("text-danger");
//         return;
//     }

//     try {
//         // Hash the password before sending
//         const passwordHash = await hashPassword(password);

//         // Send email & hashed password to the backend for registration
//         const response = await fetch("http://localhost:3000/register", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, passwordHash }),
//         });

//         const result = await response.json();
//         if (result.success) {
//             statusElement.innerText = "✅ Registration Successful! Please login.";
//             statusElement.classList.remove("text-danger");
//             statusElement.classList.add("text-success");
//         } else {
//             statusElement.innerText = "❌ Registration Failed! Email might already exist.";
//             statusElement.classList.remove("text-success");
//             statusElement.classList.add("text-danger");
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         statusElement.innerText = "Error during registration.";
//         statusElement.classList.add("text-danger");
//     }
// }

// async function login() {
//     const email = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value.trim();
//     const statusElement = document.getElementById("result");

//     if (!email || !password) {
//         statusElement.innerText = "Please enter both email and password.";
//         statusElement.classList.add("text-danger");
//         return;
//     }

//     try {
//         // Hash the password before sending
//         const passwordHash = await hashPassword(password);

//         // Send email & hashed password for proof generation
//         const response = await fetch("http://localhost:3000/generate-proof", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, passwordHash }),
//         });

//         const proofData = await response.json();

//         // Send proof to the verify endpoint
//         const verifyResponse = await fetch("http://localhost:3000/verify", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(proofData),
//         });

//         const result = await verifyResponse.json();
//         if (result.success) {
//             statusElement.innerText = "✅ Authentication Successful!";
//             statusElement.classList.remove("text-danger");
//             statusElement.classList.add("text-success");
//         } else {
//             statusElement.innerText = "❌ Authentication Failed!";
//             statusElement.classList.remove("text-success");
//             statusElement.classList.add("text-danger");
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         statusElement.innerText = "Error during authentication.";
//         statusElement.classList.add("text-danger");
//     }
// }

// // Function to generate SHA-256 hash
// async function hashPassword(password) {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(password);
//     const hashBuffer = await crypto.subtle.digest("SHA-256", data);
//     return Array.from(new Uint8Array(hashBuffer))
//         .map(byte => byte.toString(16).padStart(2, "0"))
//         .join("");
// }

// const { generateProof, verifyProof, createCommitment } = require("./zkpUtils");
// Function to hash a password (Commitment for ZKP)
async function generateCommitment(secret) {
    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}


async function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const statusElement = document.getElementById("result");

    if (!email || !password) {
        updateStatus(statusElement, "❌ Please enter both email and password.", "text-danger");
        return;
    }

    try {
        const commitment = await generateCommitment(password); // ZKP commitment

        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, commitment }),
        });

        const result = await response.json();
        if (result.success) {
            updateStatus(statusElement, "✅ Registration Successful! Please login.", "text-success");
        } else {
            updateStatus(statusElement, "❌ Registration Failed! Email might already exist.", "text-danger");
        }
    } catch (error) {
        console.error("Error:", error);
        updateStatus(statusElement, "❌ Error during registration.", "text-danger");
    }
}

// 🔹 Login Function (ZKP Proof Generation)
// Function to hash a password (Commitment for ZKP)
async function generateCommitment(secret) {
    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 🔹 Registration Function
async function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const statusElement = document.getElementById("result");

    if (!email || !password) {
        updateStatus(statusElement, "❌ Please enter both email and password.", "text-danger");
        return;
    }

    try {
        const commitment = await generateCommitment(password); // ZKP commitment

        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, commitment }),
        });

        const result = await response.json();
        if (result.success) {
            updateStatus(statusElement, "✅ Registration Successful! Please login.", "text-success");
        } else {
            updateStatus(statusElement, "❌ Registration Failed! Email might already exist.", "text-danger");
        }
    } catch (error) {
        console.error("Error:", error);
        updateStatus(statusElement, "❌ Error during registration.", "text-danger");
    }
}

// 🔹 Login Function (ZKP Proof Generation)
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const statusElement = document.getElementById("result");

    if (!email || !password) {
        updateStatus(statusElement, "❌ Please enter both email and password.", "text-danger");
        return;
    }

    try {
        // Generate proof (hashed password)
        const proof = await generateCommitment(password);

        // Send proof for verification
        const response = await fetch("http://localhost:3000/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, proof }),
        });

        const result = await response.json();
        if (result.success) {
            updateStatus(statusElement, "✅ Authentication Successful!", "text-success");
        } else {
            updateStatus(statusElement, "❌ Authentication Failed!", "text-danger");
        }
    } catch (error) {
        console.error("Error:", error);
        updateStatus(statusElement, "❌ Error during authentication.", "text-danger");
    }
}

// 🔹 Utility Function to Update Status Messages
function updateStatus(element, message, className) {
    element.innerText = message;
    element.className = className;
}

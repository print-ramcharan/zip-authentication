// const { wtns, groth16 } = require("snarkjs");
// const fs = require("fs");
// const path = require("path");

// const circomDir = path.resolve(__dirname, "../circom");
// const wasmPath = path.join(circomDir, "zkp-auth_js", "zkp-auth.wasm");
// const zkeyPath = path.join(circomDir, "zkp-auth.zkey");
// const verificationKeyPath = path.join(circomDir, "verification_key.json");
// const inputPath = path.join(circomDir, "input.json");
// const witnessPath = path.join(circomDir, "witness.wtns");

// async function generateProof(hashedPasswordHex) {
//     try {
//         console.log("🔍 Using Hashed Password (hex):", hashedPasswordHex);

//         const bigIntValue = BigInt("0x" + hashedPasswordHex);
//         const passwordHashDecimal = bigIntValue.toString(10);

//         const inputData = {
//             passwordHash: passwordHashDecimal,
//             userInput: passwordHashDecimal
//         };

//         fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));
//         console.log("📝 Input data written:", inputData);

//         // Corrected witness generation
//         await wtns.calculate(inputData, wasmPath, witnessPath);
//         console.log("✅ Witness generated successfully!");

//         const { proof, publicSignals } = await groth16.prove(zkeyPath, witnessPath);

//         console.log("✅ Proof generated successfully!");
//         return { proof, publicSignals };
//     } catch (error) {
//         console.error("❌ Error generating proof:", error);
//         throw error;
//     }
// }

// async function verifyProof(proof, publicSignals) {
//     try {
//         const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, "utf8"));
//         const isValid = await groth16.verify(verificationKey, publicSignals, proof);
//         console.log(isValid ? "✅ Proof verified successfully!" : "❌ Proof verification failed.");
//         return isValid;
//     } catch (error) {
//         console.error("❌ Verification error:", error);
//         throw error;
//     }
// }

// module.exports = { generateProof, verifyProof };



const { wtns, groth16 } = require("snarkjs");
const fs = require("fs");
const path = require("path");

const circomDir = path.resolve(__dirname, "../circom");
const wasmPath = path.join(circomDir, "zkp-auth_js", "zkp-auth.wasm");
const zkeyPath = path.join(circomDir, "zkp-auth.zkey");
const verificationKeyPath = path.join(circomDir, "verification_key.json");
const inputPath = path.join(circomDir, "input.json");
const witnessPath = path.join(circomDir, "witness.wtns");

async function generateProof(hashedPasswordHex) {
    try {
        console.log("🔍 Using Hashed Password (hex):", hashedPasswordHex);

        const bigIntValue = BigInt("0x" + hashedPasswordHex);
        const passwordHashDecimal = bigIntValue.toString(10);

        const inputData = {
            passwordHash: passwordHashDecimal,
            userInput: passwordHashDecimal
        };

        fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));
        console.log("📝 Input data written:", inputData);

        // ✅ Corrected witness generation
        const witnessCalculator = await wtns.wtnsCalculator(wasmPath);
        const witnessBuffer = await witnessCalculator.calculateWitness(inputData, true);
        fs.writeFileSync(witnessPath, witnessBuffer);
        console.log("✅ Witness generated successfully!");

        // ✅ Generate proof
        const { proof, publicSignals } = await groth16.prove(zkeyPath, witnessPath);
        console.log("✅ Proof generated successfully!");
        
        return { proof, publicSignals };
    } catch (error) {
        console.error("❌ Error generating proof:", error);
        throw error;
    }
}

async function verifyProof(proof, publicSignals) {
    try {
        const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, "utf8"));
        const isValid = await groth16.verify(verificationKey, publicSignals, proof);
        
        console.log(isValid ? "✅ Proof verified successfully!" : "❌ Proof verification failed.");
        return isValid;
    } catch (error) {
        console.error("❌ Verification error:", error);
        throw error;
    }
}

module.exports = { generateProof, verifyProof };

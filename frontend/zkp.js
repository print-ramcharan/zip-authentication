// async function generateProof(password) {
//     const crypto = await import("https://deno.land/std@0.123.0/hash/sha256.ts");

//     const passwordHash = new TextDecoder().decode(
//         new Uint8Array(await crypto.SHA256.hash(new TextEncoder().encode(password)))
//     );

//     const input = { passwordHash, userInput: passwordHash };

//     // Save input.json
//     await fetch("input.json", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(input),
//     });

//     // Run witness generation
//     await fetch("generate_witness.js");

//     // Run proof generation
//     await fetch("proof.json");

//     // Fetch proof.json and public.json
//     const proof = await (await fetch("proof.json")).json();
//     const publicSignals = await (await fetch("public.json")).json();

//     return { proof, publicSignals };
// }
async function generateProof(passwordHash) {
    const input = { userHash: passwordHash, storedHash: USER_HASH };

    // Save input.json
    await fetch("input.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    // Run witness generation
    await fetch("generate_witness.js");

    // Run proof generation
    await fetch("proof.json");

    // Fetch proof.json and public.json
    const proof = await (await fetch("proof.json")).json();
    const publicSignals = await (await fetch("public.json")).json();

    return { proof, publicSignals };
}

const fs = require("fs");

function solve() {
    const data = fs.readFileSync(0, "utf-8").trim().split(/\s+/);
    let idx = 0;
    const r = parseInt(data[idx++], 10);
    const c = parseInt(data[idx++], 10);
    const grid = data.slice(idx, idx + r); idx += r;
    const word = data[idx];

    // TODO: implement your solution using grid and word
    console.log("false");
}

solve();

const fs = require("fs");

function solve() {
    const arr = fs.readFileSync(0, "utf-8").trim().split(/\s+/).filter(Boolean).map(Number);
    // TODO: implement your solution using arr
    console.log("false");
}

solve();

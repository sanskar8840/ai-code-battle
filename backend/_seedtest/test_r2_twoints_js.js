const fs = require("fs");

function solve() {
    const lines = fs.readFileSync(0, "utf-8").split("\n");
    const arr = (lines[0] || "").trim().split(/\s+/).filter(Boolean).map(Number);
    const target = parseInt((lines[1] || "0").trim(), 10);

    // TODO: implement your solution using arr and target
    console.log('-1 -1');
}

solve();

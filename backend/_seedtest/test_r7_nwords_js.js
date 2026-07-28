const fs = require("fs");

function solve() {
    const lines = fs.readFileSync(0, "utf-8").split("\n");
    const n = parseInt(lines[0], 10);
    const words = lines.slice(1, 1 + n);

    // TODO: implement your solution using words
    console.log(0);
}

solve();

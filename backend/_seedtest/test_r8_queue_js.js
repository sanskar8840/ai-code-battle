const fs = require("fs");

function solve() {
    const lines = fs.readFileSync(0, "utf-8").split("\n");
    const q = parseInt(lines[0], 10);
    const ops = lines.slice(1, 1 + q);
    // TODO: maintain a queue; for each "pop"/"peek" op, print the result on its own line.
}

solve();

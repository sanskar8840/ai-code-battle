const fs = require("fs");

function solve() {
    const data = fs.readFileSync(0, "utf-8").trim().split(/\s+/).map(Number);
    let idx = 0;
    const n = data[idx++], m = data[idx++];
    const edges = [];
    for (let i = 0; i < m; i++) {
        edges.push([data[idx], data[idx + 1]]);
        idx += 2;
    }

    // TODO: implement your solution using n, m, and edges
    console.log("false");
}

solve();

const fs = require("fs");

function solve() {
    const data = fs.readFileSync(0, "utf-8").trim().split(/\s+/).map(Number);
    let idx = 0;
    const r = data[idx++], c = data[idx++];
    const grid = [];
    for (let i = 0; i < r; i++) {
        grid.push(data.slice(idx, idx + c));
        idx += c;
    }

    // TODO: implement your solution using grid
    console.log(0);
}

solve();

const fs = require("fs");

function solve() {
    const data = fs.readFileSync(0, "utf-8").trim().split(/\s+/).map(Number);
    let idx = 0;
    const k = data[idx++];
    const lists = [];
    for (let i = 0; i < k; i++) {
        const size = data[idx++];
        lists.push(data.slice(idx, idx + size));
        idx += size;
    }
    // TODO: merge lists, print merged values on one line.
    console.log("");
}

solve();

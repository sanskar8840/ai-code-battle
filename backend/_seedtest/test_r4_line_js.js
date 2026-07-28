const fs = require("fs");

function solve() {
    const line = fs.readFileSync(0, "utf-8").split("\n")[0] || "";
    // Tokens are level-order tree values separated by spaces; "null" = no node.
    // TODO: build the tree from these tokens and implement your solution.
    console.log(line);
}

solve();

delete require.cache[require.resolve("../seed/starterCodeTemplates")];
const t = require("../seed/starterCodeTemplates");
const fs = require("fs");
const { execSync } = require("child_process");

let failures = 0;
const run = (label, code, ext, input, isJava) => {
  const file = isJava ? `${label}_Main.java` : `test_${label}.${ext}`;
  fs.writeFileSync(file, code);
  try {
    let cmd;
    if (ext === "c") cmd = `gcc "${file}" -o "${file}.out" && "./${file}.out"`;
    else if (ext === "cpp") cmd = `g++ "${file}" -o "${file}.out" && "./${file}.out"`;
    else if (ext === "java") cmd = `java "${file}"`;
    else if (ext === "py") cmd = `python3 "${file}"`;
    else if (ext === "js") cmd = `node "${file}"`;
    const out = execSync(cmd, { input, timeout: 8000, stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
    console.log("PASS", label, "->", JSON.stringify(out.slice(0, 60)));
  } catch (e) {
    console.log("FAIL", label, (e.stderr?.toString() || e.message).slice(0, 400));
    failures++;
  }
};

const cases = [
  { name: "r4_line", fns: t.r4, args: ["line"], input: "5 3 8 null null 6 9\n" },
  { name: "r4_bool", fns: t.r4, args: ["bool"], input: "5 3 8 1 4 7 9\n" },
  { name: "r4_multi", fns: t.r4, args: ["multi"], input: "5 3 8 null null 6 9\n" },
  { name: "r5_grid", fns: t.r5, args: [], input: "4 3\n1 1 0\n1 1 0\n0 0 1\n0 0 0\n" },
  { name: "r6_words", fns: t.r6, args: [], input: "table\ntale\n" },
  { name: "r7_nwords", fns: t.r7, args: [], input: "3\nrat\ntar\nart\n" },
  { name: "r9_int", fns: t.r9, args: [], input: "6\n" },
  { name: "r10_graph", fns: t.r10, args: [], input: "4 4\n0 1\n0 2\n1 3\n2 3\n" },
];

cases.forEach(({ name, fns, args, input }) => {
  run(`${name}_c`, fns.c(...args), "c", input, false);
  run(`${name}_cpp`, fns.cpp(...args), "cpp", input, false);
  run(`${name}`, fns.java(...args), "java", input, true);
  run(`${name}_py`, fns.python(...args), "py", input, false);
  run(`${name}_js`, fns.javascript(...args), "js", input, false);
});

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);

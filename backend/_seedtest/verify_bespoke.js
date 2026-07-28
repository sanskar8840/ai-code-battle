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
  { name: "r8_queue", fns: t.r8, input: "3\npush 1\npeek\npop\n" },
  { name: "r11_merge", fns: t.r11, input: "3\n2 1 4\n2 1 3\n2 2 6\n" },
  { name: "r12_wordsearch", fns: t.r12, input: "3 3\nCAT\nDOG\nBIT\nCAT\n" },
];

cases.forEach(({ name, fns, input }) => {
  run(`${name}_c`, fns.c(), "c", input, false);
  run(`${name}_cpp`, fns.cpp(), "cpp", input, false);
  run(`${name}`, fns.java(), "java", input, true);
  run(`${name}_py`, fns.python(), "py", input, false);
  run(`${name}_js`, fns.javascript(), "js", input, false);
});

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);

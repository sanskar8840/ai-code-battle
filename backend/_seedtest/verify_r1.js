const { r1, r1Multi, r2, r3 } = require("../seed/starterCodeTemplates");
const fs = require("fs");
const { execSync } = require("child_process");

let failures = 0;
const test = (label, code, ext, input, runner) => {
  const file = `test_${label}.${ext}`;
  fs.writeFileSync(file, code);
  try {
    execSync(runner(file), { input, timeout: 8000, stdio: ["pipe", "pipe", "pipe"] });
    console.log("PASS", label);
  } catch (e) {
    console.log("FAIL", label, e.stderr?.toString().slice(0, 300) || e.message);
    failures++;
  }
};

const runners = {
  c: (f) => `gcc "${f}" -o "${f}.out" -lm && "./${f}.out"`,
  cpp: (f) => `g++ "${f}" -o "${f}.out" && "./${f}.out"`,
  java: (f) => `java "${f}"`,
  python: (f) => `python3 "${f}"`,
  javascript: (f) => `node "${f}"`,
};

// R1: array line, three output types
[["int", r1.c("int"), r1.cpp("int"), r1.java("int"), r1.python("int"), r1.javascript("int")],
 ["bool", r1.c("bool"), r1.cpp("bool"), r1.java("bool"), r1.python("bool"), r1.javascript("bool")],
 ["line", r1.c("line"), r1.cpp("line"), r1.java("line"), r1.python("line"), r1.javascript("line")]]
.forEach(([variant, c, cpp, java, python, js]) => {
  test(`r1_${variant}_c`, c, "c", "1 2 3 4\n", runners.c);
  test(`r1_${variant}_cpp`, cpp, "cpp", "1 2 3 4\n", runners.cpp);
  test(`r1_${variant}_Main.java`, java, "java", "1 2 3 4\n", (f) => `mv "${f}" "test_${variant}_Main.java" && java "test_${variant}_Main.java"`);
  test(`r1_${variant}_python`, python, "py", "1 2 3 4\n", runners.python);
  test(`r1_${variant}_js`, js, "js", "1 2 3 4\n", runners.javascript);
});

// R1Multi
test("r1multi_c", r1Multi.c(), "c", "1 2 3\n", runners.c);
test("r1multi_cpp", r1Multi.cpp(), "cpp", "1 2 3\n", runners.cpp);
test("r1multi_Main.java", r1Multi.java(), "java", "1 2 3\n", (f) => `mv "${f}" "test_multi_Main.java" && java "test_multi_Main.java"`);
test("r1multi_python", r1Multi.python(), "py", "1 2 3\n", runners.python);
test("r1multi_js", r1Multi.javascript(), "js", "1 2 3\n", runners.javascript);

// R2: array + target line, two output types
["int", "twoints"].forEach((variant) => {
  test(`r2_${variant}_c`, r2.c(variant), "c", "3 2 4\n6\n", runners.c);
  test(`r2_${variant}_cpp`, r2.cpp(variant), "cpp", "3 2 4\n6\n", runners.cpp);
  test(`r2_${variant}_Main.java`, r2.java(variant), "java", "3 2 4\n6\n", (f) => `mv "${f}" "test_r2_${variant}_Main.java" && java "test_r2_${variant}_Main.java"`);
  test(`r2_${variant}_python`, r2.python(variant), "py", "3 2 4\n6\n", runners.python);
  test(`r2_${variant}_js`, r2.javascript(variant), "js", "3 2 4\n6\n", runners.javascript);
});

// R3: string line, two output types
["int", "bool"].forEach((variant) => {
  test(`r3_${variant}_c`, r3.c(variant), "c", "hello world\n", runners.c);
  test(`r3_${variant}_cpp`, r3.cpp(variant), "cpp", "hello world\n", runners.cpp);
  test(`r3_${variant}_Main.java`, r3.java(variant), "java", "hello world\n", (f) => `mv "${f}" "test_r3_${variant}_Main.java" && java "test_r3_${variant}_Main.java"`);
  test(`r3_${variant}_python`, r3.python(variant), "py", "hello world\n", runners.python);
  test(`r3_${variant}_js`, r3.javascript(variant), "js", "hello world\n", runners.javascript);
});

console.log(failures === 0 ? "\nALL TEMPLATE TESTS PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);

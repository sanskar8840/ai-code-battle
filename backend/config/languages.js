/**
 * Single source of truth for every language the platform supports.
 * - `monacoLanguage` is what Monaco Editor's syntax highlighter expects.
 * - `judge0Id` is the language ID Judge0 CE expects (wired up in Phase 8).
 *   These match the standard Judge0 CE /languages list as of this writing —
 *   verify against your own Judge0 instance's GET /languages before Phase 8,
 *   since self-hosted instances can differ.
 * - `defaultTemplate` is the fallback starter code used when a problem hasn't
 *   set its own starterCode for that language.
 */
const LANGUAGES = [
  {
    id: "cpp",
    label: "C++",
    monacoLanguage: "cpp",
    extension: "cpp",
    judge0Id: 54, // C++ (GCC 9.2.0)
    defaultTemplate: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}
`,
  },
  {
    id: "java",
    label: "Java",
    monacoLanguage: "java",
    extension: "java",
    judge0Id: 62, // Java (OpenJDK 13.0.1)
    defaultTemplate: `public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}
`,
  },
  {
    id: "python",
    label: "Python",
    monacoLanguage: "python",
    extension: "py",
    judge0Id: 71, // Python (3.8.1)
    defaultTemplate: `# Write your solution here
def solve():
    pass

if __name__ == "__main__":
    solve()
`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    monacoLanguage: "javascript",
    extension: "js",
    judge0Id: 63, // JavaScript (Node.js 12.14.0)
    defaultTemplate: `// Write your solution here
function solve() {

}

solve();
`,
  },
  {
    id: "c",
    label: "C",
    monacoLanguage: "c",
    extension: "c",
    judge0Id: 50, // C (GCC 9.2.0)
    defaultTemplate: `#include <stdio.h>

int main() {
    // Write your solution here
    return 0;
}
`,
  },
];

const getLanguageById = (id) => LANGUAGES.find((l) => l.id === id);

module.exports = { LANGUAGES, getLanguageById };

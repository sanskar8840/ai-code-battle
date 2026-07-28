/**
 * Seed data for 30 original coding problems.
 *
 * Design notes (read before editing):
 *
 * 1. This platform grades by exact stdin -> stdout comparison via Judge0
 *    (see backend/services/judge0Service.js) — there is no per-language
 *    function-signature wrapper. So "matching the expected function
 *    signature" for this system means matching the stdin/stdout contract
 *    documented in each problem's `inputFormat`/`outputFormat`, not a
 *    method stub. Starter code is therefore a minimal, genuinely-compiling
 *    I/O harness with the contract in a comment — the same convention
 *    Codeforces uses, which fits this platform's "duel" format (Phase 9).
 *
 * 2. Every expected output below (examples + hiddenTestCases) was generated
 *    by running an actual reference solution against the chosen input, not
 *    hand-computed — see the verification note in the Phase-10 summary.
 *
 * 3. `createdBy` is intentionally NOT set here — seed.js injects the seed
 *    admin user's _id at insert time, since this file has no DB access.
 */

const LANGS = ["cpp", "java", "python", "javascript", "c"];

// ---------------------------------------------------------------------------
// Starter code templates — one minimal, verified-compiling harness per
// language, parameterized by each problem's own title/inputFormat/outputFormat.
// ---------------------------------------------------------------------------
const starterCode = (title, inputFormat, outputFormat) => {
  // JS only has `//` line comments — a naive template literal would let any
  // embedded newline in a multi-line inputFormat/outputFormat "escape" the
  // comment and become raw (invalid) code. Prefix every line explicitly.
  const commentBlock = (text) =>
    text
      .split("\n")
      .map((line) => `// ${line}`)
      .join("\n");

  return {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * ${title}
 *
 * Input format:
 * ${inputFormat}
 *
 * Output format:
 * ${outputFormat}
 */

int main() {
    // Write your solution here

    return 0;
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

/*
 * ${title}
 *
 * Input format:
 * ${inputFormat}
 *
 * Output format:
 * ${outputFormat}
 */

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution here

    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

/*
 * ${title}
 *
 * Input format:
 * ${inputFormat}
 *
 * Output format:
 * ${outputFormat}
 */
public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        // Write your solution here

    }
}
`,
  python: `import sys

"""
${title}

Input format:
${inputFormat}

Output format:
${outputFormat}
"""

def solve():
    data = sys.stdin.read().split("\\n")
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()
`,
  javascript: `// ${title}
//
// Input format:
${commentBlock(inputFormat)}
//
// Output format:
${commentBlock(outputFormat)}

process.stdin.resume();
process.stdin.setEncoding("utf8");

let inputData = "";
process.stdin.on("data", (d) => (inputData += d));
process.stdin.on("end", () => {
  const lines = inputData.split("\\n");
  // Write your solution here
});
`,
  };
};

const base = (overrides) => ({
  companies: ["Google", "Amazon", "Meta"],
  supportedLanguages: LANGS,
  timeLimitMs: 2000,
  memoryLimitKb: 262144,
  isPublished: true,
  ...overrides,
});

const PROBLEMS = [
  // =========================================================================
  // EASY (12)
  // =========================================================================
  base({
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["array", "hashmap"],
    companies: ["Google", "Amazon", "Adobe"],
    description:
      "You're given a list of integers and a target value. Find the two distinct positions in the list whose values add up exactly to the target, and print those two positions (0-indexed). You may assume exactly one valid pair exists in each test case.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Exactly one valid answer exists."],
    inputFormat: "Line 1: space-separated integers nums.\nLine 2: integer target.",
    outputFormat: "Two space-separated integers i j (0-indexed) such that nums[i] + nums[j] == target.",
    examples: [
      { input: "2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] == 9" },
      { input: "3 2 4\n6", output: "1 2", explanation: "nums[1] + nums[2] == 6" },
    ],
    hiddenTestCases: [
      { input: "3 3\n6", output: "0 1" },
      { input: "1 2 3 4 5\n9", output: "3 4" },
      { input: "-3 4 3 90\n0", output: "0 2" },
    ],
    starterCode: starterCode(
      "Two Sum",
      "Line 1: space-separated integers nums.\nLine 2: integer target.",
      "Two space-separated integers i j (0-indexed) such that nums[i] + nums[j] == target."
    ),
  }),

  base({
    title: "Balanced Brackets",
    difficulty: "Easy",
    tags: ["stack", "string"],
    companies: ["Microsoft", "Bloomberg"],
    description:
      "Given a string made only of the characters (){}[], determine whether every opening bracket is closed by the same type of bracket, in the correct order.",
    constraints: ["1 <= s.length <= 10^4", "s consists only of the characters ()[]{}."],
    inputFormat: "Line 1: the string s.",
    outputFormat: '"true" if the brackets are balanced, otherwise "false".',
    examples: [
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
    ],
    hiddenTestCases: [
      { input: "([{}])", output: "true" },
      { input: "(", output: "false" },
      { input: " ", output: "true" },,
    ],
    starterCode: starterCode(
      "Balanced Brackets",
      "Line 1: the string s.",
      '"true" if the brackets are balanced, otherwise "false".'
    ),
  }),

  base({
    title: "Best Day to Buy and Sell",
    difficulty: "Easy",
    tags: ["array", "greedy"],
    companies: ["Amazon", "Bloomberg"],
    description:
      "You're given a list of daily stock prices. You may buy on one day and sell on a later day, at most once. Print the maximum profit achievable, or 0 if no profit is possible.",
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    inputFormat: "Line 1: space-separated integers prices.",
    outputFormat: "A single integer: the maximum achievable profit.",
    examples: [
      { input: "7 1 5 3 6 4", output: "5", explanation: "Buy at 1, sell at 6." },
      { input: "7 6 4 3 1", output: "0", explanation: "Prices only fall, so no profit is possible." },
    ],
    hiddenTestCases: [
      { input: "2 4 1", output: "2" },
      { input: "1 2 3 4 5", output: "4" },
      { input: "3 3 3 3", output: "0" },
    ],
    starterCode: starterCode(
      "Best Day to Buy and Sell",
      "Line 1: space-separated integers prices.",
      "A single integer: the maximum achievable profit."
    ),
  }),

  base({
    title: "Contains a Duplicate",
    difficulty: "Easy",
    tags: ["array", "hashmap"],
    companies: ["Yahoo", "Apple"],
    description: "Given a list of integers, determine whether any value appears more than once.",
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    inputFormat: "Line 1: space-separated integers nums.",
    outputFormat: '"true" if any value repeats, otherwise "false".',
    examples: [
      { input: "1 2 3 1", output: "true" },
      { input: "1 2 3 4", output: "false" },
    ],
    hiddenTestCases: [
      { input: "1 1 1 3 3 4 3 2 4 2", output: "true" },
      { input: "7", output: "false" },
      { input: "5 6 7 8 9 10", output: "false" },
    ],
    starterCode: starterCode(
      "Contains a Duplicate",
      "Line 1: space-separated integers nums.",
      '"true" if any value repeats, otherwise "false".'
    ),
  }),

  base({
    title: "Anagram Check",
    difficulty: "Easy",
    tags: ["string", "hashmap"],
    companies: ["Uber", "Meta"],
    description:
      "Given two lowercase strings, determine whether the second is an anagram of the first (i.e., uses exactly the same letters, the same number of times, in any order).",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    inputFormat: "Line 1: string s.\nLine 2: string t.",
    outputFormat: '"true" if t is an anagram of s, otherwise "false".',
    examples: [
      { input: "anagram\nnagaram", output: "true" },
      { input: "rat\ncar", output: "false" },
    ],
    hiddenTestCases: [
      { input: "a\nab", output: "false" },
      { input: "listen\nsilent", output: "true" },
      { input: "\n", output: "true" },
    ],
    starterCode: starterCode(
      "Anagram Check",
      "Line 1: string s.\nLine 2: string t.",
      '"true" if t is an anagram of s, otherwise "false".'
    ),
  }),

  base({
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["binary-search", "array"],
    companies: ["Google", "Microsoft"],
    description:
      "Given a list of integers sorted in ascending order and a target value, find the index of the target using binary search. Print -1 if it isn't present.",
    constraints: ["1 <= nums.length <= 10^4", "nums is sorted in strictly ascending order.", "-10^4 <= target <= 10^4"],
    inputFormat: "Line 1: space-separated integers nums (ascending).\nLine 2: integer target.",
    outputFormat: "A single integer: the 0-indexed position of target, or -1 if not found.",
    examples: [
      { input: "-1 0 3 5 9 12\n9", output: "4" },
      { input: "-1 0 3 5 9 12\n2", output: "-1" },
    ],
    hiddenTestCases: [
      { input: "5\n5", output: "0" },
      { input: "1 2 3 4 5 6 7 8 9 10\n1", output: "0" },
      { input: "1 2 3 4 5 6 7 8 9 10\n10", output: "9" },
    ],
    starterCode: starterCode(
      "Binary Search",
      "Line 1: space-separated integers nums (ascending).\nLine 2: integer target.",
      "A single integer: the 0-indexed position of target, or -1 if not found."
    ),
  }),

  base({
    title: "Reverse a Linked List",
    difficulty: "Easy",
    tags: ["linked-list"],
    companies: ["Adobe", "Amazon"],
    description:
      "A singly linked list is given to you as a sequence of values. Print the values in reverse order, as they would appear if the list's links were reversed.",
    constraints: ["0 <= list.length <= 5000", "-5000 <= list[i] <= 5000"],
    inputFormat: "Line 1: space-separated integers representing the list's values in order (may be empty).",
    outputFormat: "The same values, space-separated, in reverse order.",
    examples: [
      { input: "1 2 3 4 5", output: "5 4 3 2 1" },
      { input: "1 2", output: "2 1" },
    ],
    hiddenTestCases: [
      { input: " ", output: " " },
      { input: "7", output: "7" },
      { input: "1 1 2 2 3", output: "3 2 2 1 1" },
    ],
    starterCode: starterCode(
      "Reverse a Linked List",
      "Line 1: space-separated integers representing the list's values in order (may be empty).",
      "The same values, space-separated, in reverse order."
    ),
  }),

  base({
    title: "Maximum Depth of a Binary Tree",
    difficulty: "Easy",
    tags: ["binary-tree", "dfs"],
    companies: ["Facebook", "Bloomberg"],
    description:
      "A binary tree is given in level-order, with the literal token \"null\" marking a missing child. Print the tree's maximum depth (the number of nodes on the longest path from the root down to a leaf).",
    constraints: ["0 <= number of nodes <= 10^4"],
    inputFormat: 'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
    outputFormat: "A single integer: the tree's maximum depth.",
    examples: [
      { input: "3 9 20 null null 15 7", output: "3" },
      { input: "1 null 2", output: "2" },
    ],
    hiddenTestCases: [
      { input: " ", output: "0" },
      { input: "1", output: "1" },
      { input: "1 2 3 4 null null null 5", output: "4" },
    ],
    starterCode: starterCode(
      "Maximum Depth of a Binary Tree",
      'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
      "A single integer: the tree's maximum depth."
    ),
  }),

  base({
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["linked-list", "two-pointers"],
    companies: ["Microsoft", "Apple"],
    description:
      "You're given two lists, each already sorted in ascending order. Merge them into a single sorted list and print it.",
    constraints: ["0 <= list.length <= 50", "-100 <= list[i] <= 100"],
    inputFormat: "Line 1: space-separated integers for list A (may be empty).\nLine 2: space-separated integers for list B (may be empty).",
    outputFormat: "The merged, sorted list as space-separated integers (empty line if both inputs are empty).",
    examples: [
      { input: "1 2 4\n1 3 4", output: "1 1 2 3 4 4" },
      { input: " ", output: " " },
    ],
    hiddenTestCases: [
      { input: "\n0", output: "0" },
      { input: "1 3 5 7\n2 4 6 8", output: "1 2 3 4 5 6 7 8" },
      { input: "5\n1 2 3", output: "1 2 3 5" },
    ],
    starterCode: starterCode(
      "Merge Two Sorted Lists",
      "Line 1: space-separated integers for list A (may be empty).\nLine 2: space-separated integers for list B (may be empty).",
      "The merged, sorted list as space-separated integers (empty line if both inputs are empty)."
    ),
  }),

  base({
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["dynamic-programming"],
    companies: ["Adobe", "Amazon"],
    description:
      "A staircase has n steps. From any step you may climb either 1 or 2 steps at a time. Print how many distinct ways there are to reach the top.",
    constraints: ["1 <= n <= 45"],
    inputFormat: "Line 1: integer n.",
    outputFormat: "A single integer: the number of distinct ways to climb n steps.",
    examples: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
    ],
    hiddenTestCases: [
      { input: "1", output: "1" },
      { input: "5", output: "8" },
      { input: "10", output: "89" },
    ],
    starterCode: starterCode(
      "Climbing Stairs",
      "Line 1: integer n.",
      "A single integer: the number of distinct ways to climb n steps."
    ),
  }),

  base({
    title: "Palindrome Check (Alphanumeric Only)",
    difficulty: "Easy",
    tags: ["two-pointers", "string"],
    companies: ["Facebook", "Zoho"],
    description:
      "Given a string that may contain letters, digits, spaces, and punctuation, determine whether it reads the same forwards and backwards once you ignore everything except letters and digits, and treat uppercase and lowercase as equal.",
    constraints: ["1 <= s.length <= 2 * 10^5"],
    inputFormat: "Line 1: the string s.",
    outputFormat: '"true" if it is a palindrome under the stated rules, otherwise "false".',
    examples: [
      { input: "A man, a plan, a canal: Panama", output: "true" },
      { input: "race a car", output: "false" },
    ],
    hiddenTestCases: [
      { input: " ", output: "true" },
      { input: "0P", output: "false" },
      { input: "Was it a car or a cat I saw?", output: "true" },
    ],
    starterCode: starterCode(
      "Palindrome Check (Alphanumeric Only)",
      "Line 1: the string s.",
      '"true" if it is a palindrome under the stated rules, otherwise "false".'
    ),
  }),

  base({
    title: "Symmetric Tree",
    difficulty: "Easy",
    tags: ["binary-tree", "dfs"],
    companies: ["Bloomberg", "Google"],
    description:
      'A binary tree is given in level-order, with "null" marking a missing child. Determine whether the tree is a mirror image of itself around its center.',
    constraints: ["0 <= number of nodes <= 1000"],
    inputFormat: 'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
    outputFormat: '"true" if the tree is symmetric, otherwise "false".',
    examples: [
      { input: "1 2 2 3 4 4 3", output: "true" },
      { input: "1 2 2 null 3 null 3", output: "false" },
    ],
   hiddenTestCases: [
  { input: " ", output: "true" },
  { input: "1", output: "true" },
  { input: "1 2 2", output: "true" },
],
    starterCode: starterCode(
      "Symmetric Tree",
      'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
      '"true" if the tree is symmetric, otherwise "false".'
    ),
  }),

  // =========================================================================
  // MEDIUM (12)
  // =========================================================================
  base({
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["sliding-window", "hashmap", "string"],
    companies: ["Amazon", "Bloomberg", "Adobe"],
    description:
      "Given a string, find the length of the longest contiguous substring that doesn't repeat any character.",
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols, and spaces."],
    inputFormat: "Line 1: the string s (may be empty).",
    outputFormat: "A single integer: the length of the longest substring with no repeated characters.",
    examples: [
      { input: "abcabcbb", output: "3", explanation: '"abc" is the longest substring without repeats.' },
      { input: "bbbbb", output: "1" },
    ],
    hiddenTestCases: [
      { input: "pwwkew", output: "3" },
      { input: " ", output: "0" },
      { input: "dvdf", output: "3" },
    ],
    starterCode: starterCode(
      "Longest Substring Without Repeating Characters",
      "Line 1: the string s (may be empty).",
      "A single integer: the length of the longest substring with no repeated characters."
    ),
  }),

  base({
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    tags: ["string", "dynamic-programming", "two-pointers"],
    companies: ["Microsoft", "Amazon"],
    description:
      "Given a string, print its longest palindromic (reads the same forwards and backwards) substring. If several substrings share the maximum length, print the one that starts earliest.",
    constraints: ["1 <= s.length <= 1000"],
    inputFormat: "Line 1: the string s.",
    outputFormat: "The longest palindromic substring (leftmost, if tied).",
    examples: [
      { input: "babad", output: "bab" },
      { input: "cbbd", output: "bb" },
    ],
    hiddenTestCases: [
      { input: "a", output: "a" },
      { input: "ac", output: "a" },
      { input: "racecarxyz", output: "racecar" },
    ],
    starterCode: starterCode(
      "Longest Palindromic Substring",
      "Line 1: the string s.",
      "The longest palindromic substring (leftmost, if tied)."
    ),
  }),

  base({
    title: "Container With Most Water",
    difficulty: "Medium",
    tags: ["array", "two-pointers", "greedy"],
    companies: ["Google", "Adobe"],
    description:
      "You're given the heights of a row of vertical lines. Choosing any two lines, together with the x-axis, forms a container. Print the maximum amount of water such a container can hold.",
    constraints: ["2 <= height.length <= 10^5", "0 <= height[i] <= 10^4"],
    inputFormat: "Line 1: space-separated integers height.",
    outputFormat: "A single integer: the maximum container area.",
    examples: [
      { input: "1 8 6 2 5 4 8 3 7", output: "49" },
      { input: "1 1", output: "1" },
    ],
    hiddenTestCases: [
      { input: "4 3 2 1 4", output: "16" },
      { input: "1 2 1", output: "2" },
      { input: "2 3 4 5 18 17 6", output: "17" },
    ],
    starterCode: starterCode(
      "Container With Most Water",
      "Line 1: space-separated integers height.",
      "A single integer: the maximum container area."
    ),
  }),

  base({
    title: "Product of Array Except Self",
    difficulty: "Medium",
    tags: ["array"],
    companies: ["Amazon", "Facebook", "Microsoft"],
    description:
      "Given a list of integers, print a new list where each position holds the product of every value in the original list except the one at that position. Do this without using division.",
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "The product of any prefix or suffix fits in a 32-bit integer."],
    inputFormat: "Line 1: space-separated integers nums.",
    outputFormat: "Space-separated integers: the products-except-self.",
    examples: [
      { input: "1 2 3 4", output: "24 12 8 6" },
      { input: "-1 1 0 -3 3", output: "0 0 9 0 0" },
    ],
    hiddenTestCases: [
      { input: "2 3", output: "3 2" },
      { input: "1 1 1 1", output: "1 1 1 1" },
      { input: "5 6 7 8 9", output: "3024 2520 2160 1890 1680" },
    ],
    starterCode: starterCode(
      "Product of Array Except Self",
      "Line 1: space-separated integers nums.",
      "Space-separated integers: the products-except-self."
    ),
  }),

  base({
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    tags: ["binary-tree", "bfs", "queue"],
    companies: ["Amazon", "LinkedIn"],
    description:
      "A binary tree is given in level-order with \"null\" marking missing children. Print its nodes visited breadth-first (level by level, left to right within each level), using a queue.",
    constraints: ["0 <= number of nodes <= 2000"],
    inputFormat: 'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
    outputFormat: "Space-separated integers: the node values in breadth-first order (empty line if the tree is empty).",
    examples: [
      { input: "3 9 20 null null 15 7", output: "3 9 20 15 7" },
      { input: "1", output: "1" },
    ],
    hiddenTestCases: [
      { input: " ", output: " " },
      { input: "1 2 3 4 5 6 7", output: "1 2 3 4 5 6 7" },
      { input: "5 3 8 1 4 7 9", output: "5 3 8 1 4 7 9" },
    ],
    starterCode: starterCode(
      "Binary Tree Level Order Traversal",
      'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
      "Space-separated integers: the node values in breadth-first order (empty line if the tree is empty)."
    ),
  }),

  base({
    title: "Validate a Binary Search Tree",
    difficulty: "Medium",
    tags: ["bst", "dfs", "binary-tree"],
    companies: ["Meta", "Microsoft"],
    description:
      'A binary tree is given in level-order with "null" marking missing children. Determine whether it satisfies the binary search tree property: every node\'s value is strictly greater than all values in its left subtree and strictly less than all values in its right subtree.',
    constraints: ["0 <= number of nodes <= 10^4", "-2^31 <= Node.val <= 2^31 - 1"],
    inputFormat: 'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
    outputFormat: '"true" if the tree is a valid BST, otherwise "false".',
    examples: [
      { input: "2 1 3", output: "true" },
      { input: "5 1 4 null null 3 6", output: "false" },
    ],
    hiddenTestCases: [
      { input: "5 3 8 1 4 7 9", output: "true" },
      { input: "1 1", output: "false" },
      { input: "10 5 15 null null 6 20", output: "false" },
    ],
    starterCode: starterCode(
      "Validate a Binary Search Tree",
      'Line 1: space-separated level-order tokens (integers or the literal "null"). An empty line means an empty tree.',
      '"true" if the tree is a valid BST, otherwise "false".'
    ),
  }),

  base({
    title: "Count the Islands",
    difficulty: "Medium",
    tags: ["graph", "bfs", "dfs"],
    companies: ["Amazon", "Google"],
    description:
      "You're given a grid of 0s (water) and 1s (land). An island is a group of 1s connected horizontally or vertically. Print how many separate islands the grid contains.",
    constraints: ["1 <= rows, cols <= 300", "grid[i][j] is 0 or 1."],
    inputFormat: "Line 1: two integers rows cols.\nNext rows lines: cols space-separated integers (0 or 1) each.",
    outputFormat: "A single integer: the number of islands.",
    examples: [
      { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", output: "3" },
      { input: "3 3\n1 1 1\n0 1 0\n1 1 1", output: "1" },
    ],
    hiddenTestCases: [
      { input: "2 2\n0 0\n0 0", output: "0" },
      { input: "1 1\n1", output: "1" },
      { input: "3 5\n1 0 1 0 1\n0 1 0 1 0\n1 0 1 0 1", output: "8" },
    ],
    starterCode: starterCode(
      "Count the Islands",
      "Line 1: two integers rows cols.\nNext rows lines: cols space-separated integers (0 or 1) each.",
      "A single integer: the number of islands."
    ),
  }),

  base({
    title: "Course Schedule Feasibility",
    difficulty: "Medium",
    tags: ["graph", "bfs", "dfs"],
    companies: ["Google", "Facebook"],
    description:
      "There are n courses labeled 0 to n-1. Some courses require another course to be completed first. Given the list of prerequisite pairs, determine whether it's possible to finish every course (i.e., the prerequisites contain no cycle).",
    constraints: ["1 <= n <= 2000", "0 <= number of prerequisite pairs <= 5000"],
    inputFormat: "Line 1: two integers n m (number of courses, number of prerequisite pairs).\nNext m lines: two integers a b, meaning course a requires course b first.",
    outputFormat: '"true" if all courses can be finished, otherwise "false".',
    examples: [
      { input: "2 1\n1 0", output: "true" },
      { input: "2 2\n1 0\n0 1", output: "false" },
    ],
    hiddenTestCases: [
      { input: "4 4\n1 0\n2 0\n3 1\n3 2", output: "true" },
      { input: "1 0", output: "true" },
      { input: "3 3\n0 1\n1 2\n2 0", output: "false" },
    ],
    starterCode: starterCode(
      "Course Schedule Feasibility",
      "Line 1: two integers n m (number of courses, number of prerequisite pairs).\nNext m lines: two integers a b, meaning course a requires course b first.",
      '"true" if all courses can be finished, otherwise "false".'
    ),
  }),

  base({
    title: "Kth Largest Element",
    difficulty: "Medium",
    tags: ["heap", "array"],
    companies: ["Facebook", "Amazon"],
    description:
      "Given a list of integers and an integer k, print the kth largest value in the list — that is, the value that would be at index k-1 if the list were sorted in descending order (duplicates count individually).",
    constraints: ["1 <= k <= nums.length <= 10^5"],
    inputFormat: "Line 1: space-separated integers nums.\nLine 2: integer k.",
    outputFormat: "A single integer: the kth largest value.",
    examples: [
      { input: "3 2 1 5 6 4\n2", output: "5" },
      { input: "3 2 3 1 2 4 5 5 6\n4", output: "4" },
    ],
    hiddenTestCases: [
      { input: "1\n1", output: "1" },
      { input: "7 6 5 4 3 2 1\n3", output: "5" },
      { input: "2 2 2 1 1\n2", output: "2" },
    ],
    starterCode: starterCode(
      "Kth Largest Element",
      "Line 1: space-separated integers nums.\nLine 2: integer k.",
      "A single integer: the kth largest value."
    ),
  }),

  base({
    title: "Minimum Coins to Make Change",
    difficulty: "Medium",
    tags: ["dynamic-programming", "array"],
    companies: ["Uber", "Adobe"],
    description:
      "Given a list of coin denominations (unlimited supply of each) and a target amount, print the fewest coins needed to make exactly that amount. Print -1 if it can't be made.",
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    inputFormat: "Line 1: space-separated integers coins.\nLine 2: integer amount.",
    outputFormat: "A single integer: the fewest coins needed, or -1 if impossible.",
    examples: [
      { input: "1 2 5\n11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "2\n3", output: "-1" },
    ],
    hiddenTestCases: [
      { input: "1\n0", output: "0" },
      { input: "1 3 4\n6", output: "2" },
      { input: "2 5 10 1\n27", output: "4" },
    ],
    starterCode: starterCode(
      "Minimum Coins to Make Change",
      "Line 1: space-separated integers coins.\nLine 2: integer amount.",
      "A single integer: the fewest coins needed, or -1 if impossible."
    ),
  }),

  base({
    title: "Search in a Rotated Sorted Array",
    difficulty: "Medium",
    tags: ["binary-search", "array"],
    companies: ["Microsoft", "Amazon"],
    description:
      "An ascending array with no duplicate values has been rotated at an unknown pivot. Given the rotated array and a target, find the target's index in O(log n) time, or print -1 if it isn't present.",
    constraints: ["1 <= nums.length <= 5000", "All values in nums are unique."],
    inputFormat: "Line 1: space-separated integers nums (rotated ascending order).\nLine 2: integer target.",
    outputFormat: "A single integer: the index of target, or -1 if not found.",
    examples: [
      { input: "4 5 6 7 0 1 2\n0", output: "4" },
      { input: "4 5 6 7 0 1 2\n3", output: "-1" },
    ],
    hiddenTestCases: [
      { input: "1\n0", output: "-1" },
      { input: "5 1 3\n5", output: "0" },
      { input: "4 5 6 7 8 1 2 3\n8", output: "4" },
    ],
    starterCode: starterCode(
      "Search in a Rotated Sorted Array",
      "Line 1: space-separated integers nums (rotated ascending order).\nLine 2: integer target.",
      "A single integer: the index of target, or -1 if not found."
    ),
  }),

  base({
    title: "Count N-Queens Placements",
    difficulty: "Medium",
    tags: ["backtracking"],
    companies: ["Google", "Zoho"],
    description:
      "On an n x n chessboard, print the number of distinct ways to place n queens so that no two queens attack each other (share a row, column, or diagonal).",
    constraints: ["1 <= n <= 9"],
    inputFormat: "Line 1: integer n.",
    outputFormat: "A single integer: the number of distinct valid placements.",
    examples: [
      { input: "4", output: "2" },
      { input: "1", output: "1" },
    ],
    hiddenTestCases: [
      { input: "2", output: "0" },
      { input: "6", output: "4" },
      { input: "8", output: "92" },
    ],
    starterCode: starterCode(
      "Count N-Queens Placements",
      "Line 1: integer n.",
      "A single integer: the number of distinct valid placements."
    ),
  }),

  // =========================================================================
  // HARD (6)
  // =========================================================================
  base({
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["binary-search", "array"],
    companies: ["Google", "Microsoft", "Apple"],
    timeLimitMs: 3000,
    description:
      "You're given two arrays, each already sorted in ascending order. Print the median of the combined set of all their values, formatted to exactly 5 decimal places.",
    constraints: ["0 <= a.length, b.length <= 1000", "1 <= a.length + b.length <= 2000"],
    inputFormat: "Line 1: space-separated integers for array a (may be empty).\nLine 2: space-separated integers for array b (may be empty).",
    outputFormat: "A single floating-point number, the median, formatted to exactly 5 decimal places.",
    examples: [
      { input: "1 3\n2", output: "2.00000" },
      { input: "1 2\n3 4", output: "2.50000" },
    ],
    hiddenTestCases: [
      { input: "0 0\n0 0", output: "0.00000" },
      { input: "\n1", output: "1.00000" },
      { input: "2\n", output: "2.00000" },
    ],
    starterCode: starterCode(
      "Median of Two Sorted Arrays",
      "Line 1: space-separated integers for array a (may be empty).\nLine 2: space-separated integers for array b (may be empty).",
      "A single floating-point number, the median, formatted to exactly 5 decimal places."
    ),
  }),

  base({
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    tags: ["linked-list", "heap"],
    companies: ["Amazon", "Google", "LinkedIn"],
    timeLimitMs: 3000,
    description:
      "You're given k linked lists, each already sorted in ascending order. Merge all of them into a single sorted list and print it.",
    constraints: ["0 <= k <= 10^4", "0 <= sum of all list lengths <= 5 * 10^4"],
    inputFormat: "Line 1: integer k (number of lists).\nNext k lines: an integer n (the list's length) followed by n space-separated integers (its values), or just 0 if the list is empty.",
    outputFormat: "The fully merged, sorted list as space-separated integers (empty line if every input list is empty).",
    examples: [
  { input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", output: "1 1 2 3 4 4 5 6" },
  { input: "0", output: " " },
],
   hiddenTestCases: [
  { input: "1\n0", output: " " },
  { input: "3\n1 5\n1 1\n1 3", output: "1 3 5" },
  { input: "3\n3 1 2 3\n3 4 5 6\n1 0", output: "0 1 2 3 4 5 6" },
],
    starterCode: starterCode(
      "Merge K Sorted Lists",
      "Line 1: integer k (number of lists).\nNext k lines: an integer n (the list's length) followed by n space-separated integers (its values), or just 0 if the list is empty.",
      "The fully merged, sorted list as space-separated integers (empty line if every input list is empty)."
    ),
  }),

  base({
    title: "Word Search in a Grid",
    difficulty: "Hard",
    tags: ["backtracking", "dfs"],
    companies: ["Facebook", "Amazon"],
    timeLimitMs: 3000,
    description:
      "Given a grid of single letters and a target word, determine whether the word can be traced out by moving between horizontally or vertically adjacent cells, without reusing any cell.",
    constraints: ["1 <= rows, cols <= 6", "1 <= word.length <= 15"],
    inputFormat: "Line 1: two integers rows cols.\nNext rows lines: cols space-separated single-character tokens.\nLast line: the target word.",
    outputFormat: '"true" if the word can be traced in the grid, otherwise "false".',
    examples: [
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCCED", output: "true" },
      { input: "3 4\nA B C E\nS F C S\nA D E E\nSEE", output: "true" },
    ],
    hiddenTestCases: [
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCB", output: "false" },
      { input: "1 2\nA A\nAAA", output: "false" },
      { input: "2 2\nA B\nC D\nABDC", output: "true" },
    ],
    starterCode: starterCode(
      "Word Search in a Grid",
      "Line 1: two integers rows cols.\nNext rows lines: cols space-separated single-character tokens.\nLast line: the target word.",
      '"true" if the word can be traced in the grid, otherwise "false".'
    ),
  }),

  base({
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["array", "two-pointers", "dynamic-programming"],
    companies: ["Google", "Amazon", "Goldman Sachs"],
    timeLimitMs: 3000,
    description:
      "Given the heights of a row of adjacent bars (each of width 1), print how much water would be trapped between them after rain, assuming water outside the bars drains away.",
    constraints: ["1 <= height.length <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    inputFormat: "Line 1: space-separated integers height.",
    outputFormat: "A single integer: the total units of trapped water.",
    examples: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
      { input: "4 2 0 3 2 5", output: "9" },
    ],
    hiddenTestCases: [
      { input: "1", output: "0" },
      { input: "1 1 1 1", output: "0" },
      { input: "5 4 1 2", output: "1" },
    ],
    starterCode: starterCode(
      "Trapping Rain Water",
      "Line 1: space-separated integers height.",
      "A single integer: the total units of trapped water."
    ),
  }),

  base({
    title: "Longest Increasing Subsequence",
    difficulty: "Hard",
    tags: ["dynamic-programming", "binary-search"],
    companies: ["Microsoft", "Bloomberg"],
    timeLimitMs: 3000,
    description:
      "Given a list of integers, print the length of the longest strictly increasing subsequence (values don't need to be contiguous, but must keep their original relative order).",
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    inputFormat: "Line 1: space-separated integers nums.",
    outputFormat: "A single integer: the length of the longest strictly increasing subsequence.",
    examples: [
      { input: "10 9 2 5 3 7 101 18", output: "4" },
      { input: "0 1 0 3 2 3", output: "4" },
    ],
    hiddenTestCases: [
      { input: "7 7 7 7 7 7 7", output: "1" },
      { input: "1 3 6 7 9 4 10 5 6", output: "6" },
      { input: "5 4 3 2 1", output: "1" },
    ],
    starterCode: starterCode(
      "Longest Increasing Subsequence",
      "Line 1: space-separated integers nums.",
      "A single integer: the length of the longest strictly increasing subsequence."
    ),
  }),

  base({
    title: "Network Delay Time",
    difficulty: "Hard",
    tags: ["graph", "heap", "bfs"],
    companies: ["Google", "Uber"],
    timeLimitMs: 3000,
    description:
      "A signal is sent from a source node through a directed, weighted network of n nodes (labeled 1 to n). Given the network's edges (each with a travel time) and the source node, print how long it takes for the signal to reach every node — or -1 if some node is unreachable.",
    constraints: ["1 <= n <= 100", "0 <= number of edges <= 6000", "1 <= edge weight <= 100"],
    inputFormat: "Line 1: three integers n m k (number of nodes, number of edges, source node).\nNext m lines: three integers u v w (a directed edge from u to v taking w time).",
    outputFormat: "A single integer: the time for the signal to reach every node, or -1 if that's impossible.",
    examples: [
      { input: "4 3 2\n2 1 1\n2 3 1\n3 4 1", output: "2" },
      { input: "2 1 1\n1 2 1", output: "1" },
    ],
    hiddenTestCases: [
      { input: "2 1 2\n1 2 1", output: "-1" },
      { input: "3 3 1\n1 2 1\n2 3 2\n1 3 4", output: "3" },
      { input: "3 3 1\n1 2 1\n2 3 1\n1 3 5", output: "2" },
    ],
    starterCode: starterCode(
      "Network Delay Time",
      "Line 1: three integers n m k (number of nodes, number of edges, source node).\nNext m lines: three integers u v w (a directed edge from u to v taking w time).",
      "A single integer: the time for the signal to reach every node, or -1 if that's impossible."
    ),
  }),
];

module.exports = PROBLEMS;
module.exports.PROBLEMS = PROBLEMS;
module.exports.starterCode = starterCode;
module.exports.base = base;

export interface DSAPriorQuestion {
  id: string;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
}

export interface AptitudeQuestion {
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export const DSA_QUESTIONS: DSAPriorQuestion[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    starterCode: "function twoSum(nums, target) {\n  // Write your code here\n  \n}"
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    topic: "Linked Lists",
    difficulty: "medium",
    description: "Given the head of a singly linked list, reverse the list, and return its reversed list.",
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }
    ],
    starterCode: "function reverseList(head) {\n  // Write your code here\n  \n}"
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    topic: "Stacks",
    difficulty: "easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'"
    ],
    examples: [
      { input: "s = \"()[]{}\"", output: "true" },
      { input: "s = \"(]\"", output: "false" }
    ],
    starterCode: "function isValid(s) {\n  // Write your code here\n  \n}"
  },
  {
    id: "binary-tree-inorder",
    title: "Binary Tree Inorder Traversal",
    topic: "Trees",
    difficulty: "easy",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    examples: [
      { input: "root = [1,null,2,3]", output: "[1,3,2]" }
    ],
    starterCode: "function inorderTraversal(root) {\n  // Write your code here\n  \n}"
  },
  {
    id: "longest-common-subsequence",
    title: "Longest Common Subsequence",
    topic: "Dynamic Programming",
    difficulty: "hard",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.",
    constraints: [
      "1 <= text1.length, text2.length <= 1000",
      "text1 and text2 consist of only lowercase English characters."
    ],
    examples: [
      { input: "text1 = \"abcde\", text2 = \"ace\"", output: "3", explanation: "The longest common subsequence is \"ace\"." }
    ],
    starterCode: "function longestCommonSubsequence(text1, text2) {\n  // Write your code here\n  \n}"
  },
  {
    id: "clone-graph",
    title: "Clone Graph",
    topic: "Graphs",
    difficulty: "medium",
    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.",
    constraints: [
      "The number of nodes in the graph is between 0 and 100.",
      "1 <= Node.val <= 100",
      "Node.val is unique for each node."
    ],
    examples: [
      { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]" }
    ],
    starterCode: "function cloneGraph(node) {\n  // Write your code here\n  \n}"
  }
];

export const APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: "apt-1",
    title: "Probability of Drawing Balls",
    topic: "Quantitative Aptitude",
    subtopic: "Probability",
    question: "A bag contains 6 black and 8 white balls. One ball is drawn at random. What is the probability that the ball drawn is white?",
    options: ["3/7", "4/7", "1/8", "3/8"],
    correctOptionIndex: 1,
    explanation: "Total balls = 6 black + 8 white = 14 balls.\nNumber of favorable outcomes (drawing a white ball) = 8.\nProbability = Favorable outcomes / Total outcomes = 8 / 14 = 4/7."
  },
  {
    id: "apt-2",
    title: "Syllogisms and Day-dreamers",
    topic: "Logical Reasoning",
    subtopic: "Syllogism",
    question: "Statements:\n- All poets are day-dreamers.\n- All painters are day-dreamers.\n\nConclusions:\n1. All painters are poets.\n2. Some day-dreamers are not painters.",
    options: [
      "Only Conclusion 1 follows",
      "Only Conclusion 2 follows",
      "Either Conclusion 1 or 2 follows",
      "Neither Conclusion 1 nor 2 follows"
    ],
    correctOptionIndex: 3,
    explanation: "Both premises are universal affirmative (A type). The middle term 'day-dreamers' is the predicate in both premises, so it is undistributed in both. Hence, no definite relation can be established between painters and poets. Conclusion 2 is negative, but both premises are positive, so no negative conclusion follows."
  },
  {
    id: "apt-3",
    title: "Joint Work Fractions",
    topic: "Quantitative Aptitude",
    subtopic: "Time and Work",
    question: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then what fraction of the work is left?",
    options: ["1/4", "1/10", "7/15", "8/15"],
    correctOptionIndex: 2,
    explanation: "A's 1-day work = 1/15.\nB's 1-day work = 1/20.\nJoint 1-day work = 1/15 + 1/20 = (4+3)/60 = 7/60.\nIn 4 days, they complete 4 * (7/60) = 7/15 of the work.\nLeftover work = 1 - 7/15 = 8/15."
  },
  {
    id: "apt-4",
    title: "Coding and Decoding Tiger",
    topic: "Logical Reasoning",
    subtopic: "Coding-Decoding",
    question: "If in a certain language, 'MONKEY' is coded as 'XDJMNL', how is 'TIGER' coded in that code?",
    options: ["QDFHS", "SDFHS", "UJHFS", "QDHJS"],
    correctOptionIndex: 0,
    explanation: "The coding pattern is reverse ordering combined with shifting one position backwards (-1). Reversing 'TIGER' gives 'REGIT'. Subtracting 1 from each letter:\nR - 1 = Q\nE - 1 = D\nG - 1 = F\nI - 1 = H\nT - 1 = S\nYields 'QDFHS'."
  },
  {
    id: "apt-5",
    title: "Profit margins on cost price",
    topic: "Quantitative Aptitude",
    subtopic: "Profit and Loss",
    question: "A shopkeeper sells an item at a gain of 15%. If he had bought it at 10% less and sold it for $4 less, he would have gained 25%. What is the cost price of the item?",
    options: ["$120", "$150", "$160", "$200"],
    correctOptionIndex: 2,
    explanation: "Let the initial Cost Price (CP) be $x.\nInitial Selling Price (SP) = 1.15x.\nNew CP = 0.90x.\nNew SP = 1.25 * 0.90x = 1.125x.\nGiven, SP1 - SP2 = $4.\nSo, 1.15x - 1.125x = 4 => 0.025x = 4 => x = 4 / 0.025 = $160."
  }
];

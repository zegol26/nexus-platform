import { validateEnglishQuestionData, type EnglishSanityIssue } from "../lib/english/dce/validation";

function printIssue(issue: EnglishSanityIssue) {
  console.log(`\nItem ID: ${issue.itemId}`);
  console.log(`Section: ${issue.section}`);
  console.log(`Level: ${issue.level}`);
  if (issue.transcriptPreview) console.log(`Transcript Preview: ${issue.transcriptPreview}`);
  console.log(`Issue: ${issue.issue}`);
  console.log(`Suggested Fix: ${issue.suggestedFix}`);
}

const result = validateEnglishQuestionData();

console.log(`Passed: ${result.checked} English questions checked`);
console.log(`Warning: ${result.warnings.length} items need review`);
console.log(`Failed: ${result.errors.length} question quality issues found`);

for (const issue of [...result.errors, ...result.warnings]) {
  printIssue(issue);
}

if (result.errors.length > 0) {
  process.exitCode = 1;
}

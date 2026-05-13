import { validateEnglishListeningData, type EnglishSanityIssue } from "../lib/english/dce/validation";

function printIssue(issue: EnglishSanityIssue) {
  console.log(`\nItem ID: ${issue.itemId}`);
  console.log(`Section: ${issue.section}`);
  console.log(`Level: ${issue.level}`);
  if (issue.audio) console.log(`Audio: ${issue.audio}`);
  if (issue.transcriptPreview) console.log(`Transcript Preview: ${issue.transcriptPreview}`);
  console.log(`Issue: ${issue.issue}`);
  console.log(`Suggested Fix: ${issue.suggestedFix}`);
}

const result = validateEnglishListeningData(process.cwd());

console.log(`Passed: ${result.checked} listening items checked`);
console.log(`Warning: ${result.warnings.length} items need review`);
console.log(`Failed: ${result.errors.length} transcript/audio mismatch found`);

for (const issue of [...result.errors, ...result.warnings]) {
  printIssue(issue);
}

if (result.errors.length > 0) {
  process.exitCode = 1;
}

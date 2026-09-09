// Enforces one blank line after every describe()/it() block, except when it's
// the last statement before its parent block's own closing brace.
import fs from 'fs';
import path from 'path';

const testDir = './tests/unit';

function specFiles(dir) {
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith('.spec.ts'))
    .map((f) => path.join(dir, f));
}

function indentOf(line) {
  return line.match(/^(\s*)/)[1].length;
}

function isCloseLine(trimmed) {
  return /^[)}]+;?$/.test(trimmed);
}

function findBlocks(lines) {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!/^(describe|it|it\.each)\(/.test(trimmed)) continue;

    const indent = indentOf(lines[i]);
    let end = -1;
    for (let j = i + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t === '') continue;
      if (indentOf(lines[j]) !== indent) continue;

      if (isCloseLine(t)) {
        end = j;
        break;
      }
      if (/^(describe|it|it\.each)\(/.test(t)) {
        end = -1; // new sibling started before our own close was found -- bail
        break;
      }
      // else: interstitial syntax of a multi-line header (e.g. the `])(`
      // line in `it.each([...])(...)`) at the same indent -- keep scanning
    }
    blocks.push({ end, indent });
  }
  return blocks;
}

function fixFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const endsWithNewline = content.endsWith('\n');
  const lines = content.split('\n');
  if (endsWithNewline) lines.pop();

  const inserts = [];
  const removals = [];

  for (const { end, indent } of findBlocks(lines)) {
    if (end < 0) continue;

    let next = end + 1;
    let firstNonBlank = next;
    while (firstNonBlank < lines.length && lines[firstNonBlank].trim() === '') firstNonBlank++;

    const hasBlank = firstNonBlank > next;
    const isLastChild =
      firstNonBlank >= lines.length ||
      (indentOf(lines[firstNonBlank]) < indent && isCloseLine(lines[firstNonBlank].trim()));

    if (isLastChild && hasBlank) {
      removals.push([next, firstNonBlank]);
    } else if (!isLastChild && !hasBlank) {
      inserts.push(end);
    }
  }

  if (inserts.length === 0 && removals.length === 0) return 0;

  const ops = [
    ...inserts.map((at) => ({ type: 'insert', at })),
    ...removals.map(([from, to]) => ({ type: 'remove', from, to }))
  ].sort((a, b) => (b.at ?? b.from) - (a.at ?? a.from));

  for (const op of ops) {
    if (op.type === 'insert') lines.splice(op.at + 1, 0, '');
    else lines.splice(op.from, op.to - op.from);
  }

  fs.writeFileSync(file, lines.join('\n') + (endsWithNewline ? '\n' : ''));
  return ops.length;
}

let changedFiles = 0;
let totalFixes = 0;

for (const file of specFiles(testDir)) {
  const fixes = fixFile(file);
  if (fixes > 0) {
    changedFiles++;
    totalFixes += fixes;
    console.log(`fixed ${fixes} spot(s) in ${file}`); // eslint-disable-line no-console
  }
}

console.log(`done: ${totalFixes} fix(es) across ${changedFiles} file(s)`); // eslint-disable-line no-console

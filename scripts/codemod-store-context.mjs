import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src");
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
})(srcDir);

const replacements = [
  ["db.stores.find(s=>s.ownerId===user.id)", "activeStoreFor(db,user)"],
  ["db.stores.find(s => s.ownerId === user.id)", "activeStoreFor(db, user)"],
  ["db.stores.find(item=>item.ownerId===user.id)", "activeStoreFor(db,user)"],
  ["db.stores.find(item => item.ownerId === user.id)", "activeStoreFor(db, user)"]
];

let changed = 0;
const leftovers = [];

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  let touched = false;
  for (const [from, to] of replacements) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      touched = true;
    }
  }
  if (touched && !text.includes('from "@/lib/store-context"')) {
    const lines = text.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trimStart().startsWith("import ")) lastImport = i;
    }
    const importLine = 'import { activeStoreFor } from "@/lib/store-context";';
    if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
    else lines.unshift(importLine, "");
    text = lines.join("\n");
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
    console.log("updated", path.relative(root, file));
  }
  if (text.includes("ownerId===user.id") || text.includes("ownerId === user.id") || text.includes("ownerId!==user.id")) {
    leftovers.push(path.relative(root, file));
  }
}

console.log(`\nfiles changed: ${changed}`);
console.log("leftovers needing manual review:");
for (const l of leftovers) console.log("  -", l);

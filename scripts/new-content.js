#!/usr/bin/env node

import { writeFileSync } from "fs";
import { join } from "path";

const [, , type, slug] = process.argv;

if (!type || !slug) {
  console.error("Usage: node new-content.js <post|list> <slug>");
  process.exit(1);
}

if (type !== "post" && type !== "list") {
  console.error('Type must be either "post" or "list"');
  process.exit(1);
}

// Format date as "Month Day Year" (e.g., "December 4 2025")
const date = new Date();
const month = date.toLocaleString("en-US", { month: "long" });
const day = date.getDate();
const year = date.getFullYear();
const formattedDate = `${month} ${day} ${year}`;

const template = `---
title: "Title"
description: "Description"
pubDate: "${formattedDate}"
---

`;

const dir = type === "post" ? "posts" : "lists";
const filePath = join(process.cwd(), "src", "content", dir, `${slug}.md`);

writeFileSync(filePath, template);
console.log(`✓ Created src/content/${dir}/${slug}.md`);

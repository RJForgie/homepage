---
title: "Asking a codebase questions with git log"
description: "Using git log to get up to speed"
pubDate: "March 28 2025"
---

I like using AI tools such as Cursor to ask questions about a codebase. Especially if the codebase is large, "legacy" or is maintained by a big team.

My favourite way to ask a codebase questions doesn't even require AI though; just humble `git log`.

Here are three questions I ask every codebase I onboard onto:

1. What are the 10 most frequently modified files in this repository?

```bash
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10
```

2. Who are the most active recent contributers to the repository?

```bash
git shortlog -sn --since="3 months ago"
```

3. Who are the most active historical contributers to the project that are still active? Also known as; who knows where all the bodies are buried?

```bash
git log --format='%an' | sort | uniq -c | sort -rg | \
while read commits author; do \
    git log --since="1 month ago" --format='%an' | grep -q "^$author$" && \
    echo "$commits $author"; \
done | head -10
```

If you interested in digging deeper I recommend the [General Guide For Exploring Large Open Source Codebases](https://pncnmnp.github.io/blogs/oss-guide.html)

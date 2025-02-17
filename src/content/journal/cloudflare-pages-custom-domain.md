---
title: 'Cloudflare Pages custom domains'
description: 'Redirecting to apex domains'
pubDate: 'April 30 2024'
---

This is a static [Astro](https://astro.build/) site deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

The setup process was straightforward apart from one issue when configuring the [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/). Navigating to the apex domain `ryanforgie.com` loaded the site successfully but `www.ryanforgie.com` resulted in a Not Found error.

[Redirecting to www to domain apex](https://developers.cloudflare.com/pages/how-to/www-redirect/) is the section of the documentation with the solution but there are two points that are not explicit in the instructions:
1. The source URL needs a trailing slash (e.g. `www.ryanforgie.com/`).
2. The target URL needs to specify HTTPS (e.g. `https://ryanforgie.com`).

With those in place you should be good to go.

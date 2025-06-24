# @webicient/sanity-kit

This plugin provides curated list of pre-built features for the [Sanity](https://sanity.io). It was designed to cater +75% of all the needed tools in development and marketing to any of [Webicient](https://webicient.com) projects with Sanity as a CMS.

# Development

This project written with `@sanity/plugin-kit`, is it an opinionated enhanced Sanity plugin development experience.

The `@sanity/plugin-kit` already provides a set of CLI commands for verifying and testing `@webicient/sanity-kit` plugin for [Sanity Studio](https://www.sanity.io/studio).

### Verify your plugin package.

```
pnpx @sanity/plugin-kit@latest verify-package
```

### Get help upgrading from Sanity Studio v2 → v3.

```
pnpx @sanity/plugin-kit@latest verify-studio
```

## Requirements

- [Node v18+](https://nodejs.org)

## Getting started

First, install the project dependencies:

```
pnpm install
```

Make the plugin linkable, and compile an initial version:

```
pnpm run dev
```

In another shell, run the command:

```
# The `studio` folder in this project is dedicated for live testing the Sanity Studio.
cd studio && pnpx yalc add @webicient/sanity-kit && pnpx yalc link @webicient/sanity-kit && pnpm install && pnpm run dev
```

## Features (WIP)

- [x] Organized structure of Sanity Structure Tool
- [x] Translation ready
- [x] Media library
- [x] Redirections
- [ ] Forms
- [x] Modules content builder (section block)
- [x] Modules presets
- [x] General settings
- [ ] Sitemap viewer
- [x] GTM ready
- [ ] Embedded video with bunny.net
- [x] SEO ready
  - [x] OpenGraph
  - [x] Canonical URLs
  - [x] Common tags such as title, description and etc.
  - [ ] Structured schema

## API

- Auto routing for Next
- Custom viewer for content builder section preview
- Custom fields and built in Typescript types for images, links, buttons, and etc.
- Exposed API route for form handling
- Exposed API route for
- Helper function for handling SEO metadata
- Helper function for registering section

## Verifying the package

The `@sanity/plugin-kit`

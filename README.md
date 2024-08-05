# @webicient/sanity-kit

This plugin provides curated list of pre-built features for the [Sanity](https://sanity.io). It was designed to cater +75% of all the needed tools in development and marketing to any of [Webicient](https://webicient.com) projects with Sanity as a CMS.

# Development

This project written with `@sanity/plugin-kit`, is it an opinionated enhanced Sanity plugin development experience.

The `@sanity/plugin-kit` already provides a set of CLI commands for verifying and testing `@webicient/sanity-kit` plugin for [Sanity Studio](https://www.sanity.io/studio).

### Verify your plugin package.

```
npx @sanity/plugin-kit@latest verify-package
```

### Get help upgrading from Sanity Studio v2 → v3.

```
npx @sanity/plugin-kit@latest verify-studio
```

## Requirements

- [Node v18+](https://nodejs.org)

## Getting started

First, install the project dependencies:

```
npx install && npx i yalc -g
```

Make the plugin linkable, and compile an initial version:

```
npx run dev
```

In another shell, run the command:

```
# The `studio` folder in this project is dedicated for live testing the Sanity Studio.
cd studio && npx yalc add @webicient/sanity-kit && npx yalc link @webicient/sanity-kit && npx install && npm run dev
```

## Features (WIP)

- [x] Organized structure of Sanity Structure Tool
- [ ] Translation ready
- [x] Media library
- [x] Redirections
- [ ] Forms
- [ ] Modules content builder (section block)
- [ ] Modules presets
- [x] General settings
- [ ] Sitemap viewer
- [x] GTM ready
- [ ] Embedded video with bunny.net
- [ ] SEO ready
  - [ ] OpenGraph
  - [ ] Canonical URLs
  - [ ] Common tags such as title, description and etc.
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

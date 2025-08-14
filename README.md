# @webicient/sanity-kit

A comprehensive Sanity plugin that provides curated pre-built features for Sanity CMS development. Designed to accelerate development by providing 75%+ of commonly needed tools and features for modern web projects.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Overview

`@webicient/sanity-kit` is an opinionated Sanity v3 plugin that provides a complete toolkit for building content-driven websites and applications. It includes pre-configured schemas, query builders, React components, and utilities that follow best practices for Sanity CMS development.

### What is Sanity Kit?

Sanity Kit is a plugin that extends Sanity Studio with:
- **Pre-built content schemas** for common use cases (pages, posts, settings)
- **Configuration-driven architecture** for rapid customization
- **Query utilities** for efficient data fetching
- **React components** for content rendering
- **Multi-language support** out of the box
- **SEO optimization** utilities and metadata management
- **Visual editing** integration for live preview
- **Module system** for content builder functionality

### Who is it for?

This plugin is designed for:
- Development teams building content-driven websites
- Agencies working on multiple Sanity projects
- Developers who want production-ready Sanity configurations
- Teams needing consistent patterns across projects

## Features

### Core Features

- ✅ **Schema System** - Pre-built schemas with `defineContentType()`, `defineEntity()`, `defineSetting()`, `defineTaxonomy()`, and `defineModule()`
- ✅ **Multi-language Support** - Built-in internationalization with `@sanity/language-filter`
- ✅ **Visual Editing** - Live preview and visual editing with Next.js integration
- ✅ **Media Library** - Integrated media management with `sanity-plugin-media`
- ✅ **SEO Ready** - Built-in SEO fields and metadata utilities
- ✅ **Module System** - Flexible content builder with custom modules
- ✅ **Query Builders** - GROQ query utilities and React hooks
- ✅ **TypeScript Support** - Full TypeScript definitions and type safety
- ✅ **GTM Integration** - Google Tag Manager and analytics support
- ✅ **Redirect Management** - Built-in redirect content type
- ✅ **Settings Management** - Global settings with multiple categories

### Built-in Content Types

- **Page** - Hierarchical pages with SEO and modules
- **Post** - Blog posts with categories and featured images
- **Redirect** - URL redirect management
- **Preset** - Reusable content modules

### Built-in Settings

- **General Settings** - Site title, domain, and search engine visibility
- **Social Media Settings** - Facebook, Twitter, Instagram, LinkedIn, YouTube links
- **SEO Settings** - Default title, description, and image
- **Integration Settings** - Google Tag Manager and marker.io IDs
- **Scripts Settings** - Custom head, pre-body, and post-body scripts
- **Advanced Settings** - Technical configuration options

## Installation

### Requirements

- Node.js 18+
- Sanity v3.45.0+
- Next.js 14.2.8+ (for full feature support)
- React 18+

### Install the Package

```bash
npm install @webicient/sanity-kit
```

or with yarn:

```bash
yarn add @webicient/sanity-kit
```

## Quick Start

### 1. Configure your Sanity Studio

Create or update your `sanity.config.ts`:

```typescript
import { defineConfig } from 'sanity';
import { sanityKit } from '@webicient/sanity-kit';
import { kitConfig } from '@webicient/sanity-kit';

// Create your kit configuration
const config = kitConfig({
  // Optional: Add languages for multi-language support
  languages: [
    { id: 'en', title: 'English', isDefault: true },
    { id: 'es', title: 'Spanish' }
  ],
  
  // Optional: Add custom schemas
  schema: {
    contentTypes: [
      // Your custom content types
    ],
    modules: [
      // Your custom modules
    ]
  }
});

export default defineConfig({
  projectId: 'your-project-id',
  dataset: 'production',
  plugins: [
    sanityKit(config)
  ]
});
```

### 2. Create a Kit Configuration File

For better organization, create a separate `kit.config.ts`:

```typescript
import { kitConfig, defineContentType, defineModule } from '@webicient/sanity-kit';

export default kitConfig({
  languages: [
    { id: 'en', title: 'English', isDefault: true },
    { id: 'fr', title: 'French' }
  ],
  
  schema: {
    // Add custom content types
    contentTypes: [
      defineContentType({
        name: 'product',
        title: 'Product',
        pluralTitle: 'Products',
        supports: ['title', 'slug', 'seo', 'modules'],
        rewrite: '/products/:slug',
        translate: true
      })
    ],
    
    // Add custom modules for content builder
    modules: [
      defineModule({
        name: 'module.hero',
        title: 'Hero Section',
        fields: [
          // Module fields
        ],
        renderer: HeroModule, // React component
        imageUrl: '/module-hero.png'
      })
    ]
  }
});
```

### 3. Use in Next.js Application

Set up your Next.js app with Sanity Kit components:

```typescript
// app/layout.tsx
import { KitProvider } from '@webicient/sanity-kit/provider';
import { loadSettings } from '@webicient/sanity-kit/query';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const settings = await loadSettings();
  
  return (
    <html>
      <body>
        <KitProvider settings={settings}>
          {children}
        </KitProvider>
      </body>
    </html>
  );
}
```

```typescript
// app/page.tsx
import { loadQuery } from '@webicient/sanity-kit/query';
import { pageQuery } from '@webicient/sanity-kit/queries';
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';

export default async function HomePage() {
  const { data: page } = await loadQuery(
    pageQuery('home', 'en')
  );
  
  return (
    <main>
      <h1>{page.title}</h1>
      <ModuleResolver data={page.modules} />
    </main>
  );
}
```

## Configuration

### KitConfig Interface

The main configuration object accepts the following options:

```typescript
interface KitConfig {
  // Multi-language configuration
  languages?: Array<{
    id: string;
    title: string;
    isDefault?: boolean;
  }>;
  
  // Schema definitions
  schema?: {
    objects?: SchemaType[];        // Custom object types
    contentTypes?: ContentType[];  // Custom content types
    taxonomies?: Taxonomy[];       // Custom taxonomies
    entities?: Entity[];           // Custom entities
    settings?: Setting[];          // Custom settings
    modules?: Module[];            // Content builder modules
    structures?: Structure[];      // Custom studio structures
  };
  
  // Customization options
  custom?: {
    projection?: (type: string, defaultProjection: string) => string;
  };
  
  // Disable default schemas
  disableDefault?: {
    schema?: {
      contentTypes?: string[];
      taxonomies?: string[];
    };
  };
  
  // Resolver functions
  resolve?: {
    hrefResolver?: Function;
    documentHrefResolver?: Function;
    internalLinkQueryFields?: Function;
    hierarchyQueryFields?: Function;
    richTextQueryFields?: Function;
  };
  
  // Rich text configuration
  richText?: SchemaType[];
}
```

## Documentation

### Core Documentation

- [Getting Started](./docs/getting-started.md) - Installation and setup guide
- [Configuration](./docs/configuration.md) - Complete configuration reference
- [API Reference](./docs/api-reference.md) - Full API documentation

### Schema Documentation

- [Schema System](./docs/schema-system.md) - Creating and managing schemas
- [Content Types](./docs/content-types.md) - Built-in content type documentation
- [Settings](./docs/settings.md) - Built-in settings documentation

### Features

- [Queries](./docs/queries.md) - GROQ queries and data fetching
- [Components](./docs/components.md) - React components and resolvers
- [Modules](./docs/modules.md) - Content builder module system
- [Multi-language](./docs/multi-language.md) - Internationalization setup
- [Visual Editing](./docs/visual-editing.md) - Preview and visual editing

### Advanced Topics

- [TypeScript](./docs/typescript.md) - TypeScript integration
- [Examples](./docs/examples.md) - Common use cases and patterns
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions

## API Reference

### Main Exports

```typescript
// Configuration
export { kitConfig } from './config/kitConfig';
export { sanityKit } from './config/sanityKit';

// Schema Definitions
export { defineContentType } from './config/registry/define';
export { defineEntity } from './config/registry/define';
export { defineSetting } from './config/registry/define';
export { defineTaxonomy } from './config/registry/define';
export { defineModule } from './config/registry/define';
export { defineStructure } from './config/registry/define';

// Types
export * from './types/definition';
export * from './types/seo';
export * from './types/validity';
export * from './types/payload';
export * from './types/object';
```

### Query Exports (`/query`)

```typescript
// Query utilities
export { loadQuery } from './query/loadQuery';
export { serverClient } from './query/serverClient';

// React hooks
export { useQuery } from './query/useQuery';

// Structure loaders
export { loadContentType } from './query/structure/loadContentType';
export { loadEntity } from './query/structure/loadEntity';
export { loadSettings } from './query/structure/loadSettings';
export { loadTaxonomy } from './query/structure/loadTaxonomy';
```

### Component Exports (`/resolvers`)

```typescript
// Resolvers
export { ImageResolver } from './resolvers/ImageResolver';
export { LinkResolver } from './resolvers/LinkResolver';
export { ModuleResolver } from './resolvers/ModuleResolver';
```

### Provider Exports (`/provider`)

```typescript
// Provider and hooks
export { KitProvider } from './provider/KitProvider';
export { useKit } from './provider/KitProvider';
```

## Examples

### Creating a Custom Content Type

```typescript
import { defineContentType } from '@webicient/sanity-kit';
import { defineField } from 'sanity';

const product = defineContentType({
  name: 'product',
  title: 'Product',
  pluralTitle: 'Products',
  supports: ['title', 'slug', 'seo', 'featuredImage'],
  hierarchical: false,
  rewrite: '/shop/:slug',
  translate: true,
  fields: [
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: Rule => Rule.required().positive()
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true
    })
  ]
});
```

### Creating a Custom Module

```typescript
import { defineModule } from '@webicient/sanity-kit';
import { defineField } from 'sanity';

const heroModule = defineModule({
  name: 'module.hero',
  title: 'Hero Section',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true }
    })
  ],
  renderer: HeroComponent,
  imageUrl: '/modules/hero.png',
  query: (language) => `
    heading,
    subheading,
    backgroundImage
  `
});
```

### Fetching Data with Type Safety

```typescript
import { loadQuery } from '@webicient/sanity-kit/query';
import { pageQuery } from '@webicient/sanity-kit/queries';
import type { Page } from '@webicient/sanity-kit';

export async function getPage(slug: string, language: string = 'en') {
  const { data } = await loadQuery<Page>(
    pageQuery(slug, language),
    { slug, language }
  );
  
  return data;
}
```

## Development

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/webicient/sanity-kit.git
cd sanity-kit
```

2. Install dependencies:
```bash
npm install
```

3. Link for local development:
```bash
npm run dev
```

4. Test in the studio:
```bash
cd studio
npx yalc add @webicient/sanity-kit
npx yalc link @webicient/sanity-kit
npm install
npm run dev
```

### Available Scripts

- `npm run dev` - Start development mode with watch
- `npm run build` - Build the package
- `npm run test` - Run tests with Vitest
- `npm run lint` - Lint the codebase
- `npm run format` - Format code with Prettier

### Project Structure

```
@webicient/sanity-kit/
├── src/
│   ├── config/          # Configuration and plugin setup
│   ├── queries/         # GROQ query builders
│   ├── query/           # Query utilities and hooks
│   ├── resolvers/       # React component resolvers
│   ├── provider/        # React context provider
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Utility functions
│   └── visual-editing/  # Visual editing components
├── studio/              # Test studio application
├── test/                # Test files
└── docs/                # Documentation
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Reporting Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/webicient/sanity-kit/issues).

### Development Guidelines

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR

## Support

- [Documentation](./docs)
- [GitHub Issues](https://github.com/webicient/sanity-kit/issues)
- [Webicient](https://webicient.com)

## License

MIT © [Webicient](https://webicient.com)

---

Built with ❤️ by [Webicient](https://webicient.com) for the Sanity community.
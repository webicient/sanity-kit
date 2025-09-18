# TypeScript Integration

Complete guide to using TypeScript with @webicient/sanity-kit for type-safe development.

## Overview

@webicient/sanity-kit provides comprehensive TypeScript support with built-in type definitions, generated types from schemas, and utilities for type-safe development.

## Built-in Types

### Core Type Definitions

```typescript
// Import core types
import type {
  ContentType,
  Entity,
  Setting,
  Taxonomy,
  Module,
  KitConfig,
  Supports,
} from "@webicient/sanity-kit";

// Schema definition types
interface ContentType {
  name: string;
  title: string;
  pluralTitle: string;
  supports?: Supports[];
  rewrite?: string;
  hierarchical?: boolean;
  translate?: boolean;
  taxonomies?: ContentTypeTaxonomy[];
  fields?: FieldDefinition[];
  menu?: StructureMenu;
  hidden?: boolean;
}

interface Entity {
  name: string;
  title: string;
  supports?: Supports[];
  rewrite?: string;
  translate?: boolean;
  fields?: FieldDefinition[];
  menu?: StructureMenu;
  hidden?: boolean;
}

interface Module {
  name: string;
  title: string;
  fields: FieldDefinition[];
  renderer: ComponentType<any>;
  imageUrl: string;
  query?: (language?: string) => string;
}
```

### Supported Field Types

```typescript
type Supports =
  | "title"
  | "slug"
  | "seo"
  | "modules"
  | "body"
  | "excerpt"
  | "featuredImage"
  | "publishedAt";

// Usage in schema definitions
const blogPost = defineContentType({
  name: "post",
  supports: ["title", "slug", "publishedAt", "body"] as Supports[],
});
```

### Configuration Types

```typescript
interface KitConfig {
  languages?: Array<Language & { isDefault?: boolean }>;
  schema?: {
    objects?: ReturnType<typeof defineType>[];
    contentTypes?: ContentType[];
    taxonomies?: Taxonomy[];
    entities?: Entity[];
    settings?: Setting[];
    modules?: Module[];
    structures?: Structure[];
  };
  custom?: {
    projection?: (
      type: CustomProjectionType,
      defaultProjection: string,
    ) => string;
  };
  disableDefault?: {
    schema?: {
      contentTypes?: string[];
      taxonomies?: string[];
    };
  };
  resolve?: ResolverFunctions;
  richText?: ReturnType<typeof defineType>[];
}
```

## Generated Types from Schemas

### Sanity TypeGen Setup

Generate TypeScript types from your Sanity schemas:

```bash
# Install Sanity CLI globally
npm install -g @sanity/cli

# Generate schema and types
npx sanity schema extract
npx sanity typegen generate
```

This creates type definitions in `sanity.types.ts`:

```typescript
// Generated types (sanity.types.ts)
export interface Page {
  _id: string;
  _type: "page";
  title: string;
  slug: Slug;
  seo?: Seo;
  modules?: Array<Module>;
  parent?: {
    _ref: string;
    _type: "reference";
  };
}

export interface Post {
  _id: string;
  _type: "post";
  title: string;
  slug: Slug;
  publishedAt: string;
  featuredImage?: SanityImage;
  excerpt?: string;
  body?: Array<Block>;
  categories: Array<{
    _ref: string;
    _type: "reference";
  }>;
  seo?: Seo;
}
```

### Using Generated Types

```typescript
// Import generated types
import type { Page, Post, GeneralSettings } from '../sanity.types';
import { loadQuery } from '@webicient/sanity-kit/query';

// Type-safe data fetching
export async function getPage(slug: string): Promise<Page | null> {
  const { data } = await loadQuery<Page>(
    `*[_type == "page" && slug.current == $slug][0]`,
    { slug }
  );

  return data;
}

// Type-safe component props
interface PageProps {
  page: Page;
}

export default function PageComponent({ page }: PageProps) {
  return (
    <main>
      <h1>{page.title}</h1>
      {page.modules && <ModuleResolver data={page.modules} />}
    </main>
  );
}
```

## Type-Safe Schema Definitions

### Content Type with Types

```typescript
import { defineContentType, defineField } from "@webicient/sanity-kit";
import type { ContentType } from "@webicient/sanity-kit";

// Define interface for the content type
interface ProductContentType extends ContentType {
  name: "product";
}

export const product: ProductContentType = defineContentType({
  name: "product",
  title: "Product",
  pluralTitle: "Products",
  supports: ["title", "slug", "seo", "featuredImage"],
  rewrite: "/products/:slug",
  translate: true,
  fields: [
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "productCategory" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
});
```

### Module with Types

```typescript
import { defineModule, defineField } from '@webicient/sanity-kit';
import type { Module } from '@webicient/sanity-kit';
import HeroComponent from '@/components/modules/Hero';

// Define props interface for the component
interface HeroModuleProps {
  heading: string;
  subheading?: string;
  backgroundImage?: SanityImage;
  cta?: Link;
}

// Type the module definition
interface HeroModule extends Module {
  name: 'module.hero';
  renderer: React.ComponentType<HeroModuleProps>;
}

export const heroModule: HeroModule = defineModule({
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
      type: 'text'
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image'
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'kit.link'
    })
  ],
  renderer: HeroComponent,
  imageUrl: '/modules/hero.png'
});

// Component with typed props
export default function HeroComponent({
  heading,
  subheading,
  backgroundImage,
  cta
}: HeroModuleProps) {
  return (
    <section className="hero">
      {backgroundImage && (
        <ImageResolver {...backgroundImage} alt={heading} />
      )}
      <div>
        <h1>{heading}</h1>
        {subheading && <p>{subheading}</p>}
        {cta && <LinkResolver {...cta}>{cta.text}</LinkResolver>}
      </div>
    </section>
  );
}
```

## Query Type Safety

### Typed Query Functions

```typescript
// Create typed query functions
import type { Page, Post, Settings } from "../sanity.types";

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const { data } = await loadQuery<Page>(
    `*[_type == "page" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      "slug": slug.current,
      seo,
      modules[] {
        _type,
        _key,
        ...
      }
    }`,
    { slug },
  );

  return data;
}

export async function getRecentPosts(limit: number = 10): Promise<Post[]> {
  const { data } = await loadQuery<Post[]>(
    `*[_type == "post"] | order(publishedAt desc) [0...${limit}] {
      _id,
      _type,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      featuredImage,
      categories[]-> {
        _id,
        title,
        "slug": slug.current
      }
    }`,
  );

  return data || [];
}

export async function getAllSettings(): Promise<Settings> {
  const { data } = await loadQuery<Settings>(
    `{
      "general": *[_type == "generalSettings"][0],
      "social": *[_type == "socialMediaSettings"][0],
      "seo": *[_type == "seoSettings"][0]
    }`,
  );

  return data;
}
```

### Custom Query Types

```typescript
// Define custom query result types
interface PageWithBreadcrumbs extends Page {
  breadcrumbs: Array<{
    title: string;
    slug: string;
  }>;
}

interface PostWithAuthor extends Post {
  author: {
    name: string;
    bio?: string;
    image?: SanityImage;
  };
}

// Use in query functions
export async function getPageWithBreadcrumbs(
  slug: string,
): Promise<PageWithBreadcrumbs | null> {
  const { data } = await loadQuery<PageWithBreadcrumbs>(
    `*[_type == "page" && slug.current == $slug][0] {
      ...,
      "breadcrumbs": *[_type == "page" && _id in path("$.parent")] {
        title,
        "slug": slug.current
      }
    }`,
    { slug },
  );

  return data;
}
```

## Component Type Safety

### Typed React Components

```typescript
// Type-safe page components
import type { Page } from '../sanity.types';

interface PageTemplateProps {
  page: Page;
  locale?: string;
}

export default function PageTemplate({ page, locale = 'en' }: PageTemplateProps) {
  return (
    <main>
      <h1>{page.title}</h1>
      {page.modules && (
        <ModuleResolver<Page['modules']> data={page.modules} />
      )}
    </main>
  );
}

// Type-safe settings hook
import { useKit } from '@webicient/sanity-kit/provider';
import type { Settings } from '../types/settings';

export function useTypedSettings() {
  const { settings } = useKit();

  // Type assertion with runtime validation
  return settings as Settings;
}

// Usage with type safety
function Header() {
  const settings = useTypedSettings();

  return (
    <header>
      <h1>{settings.general?.siteTitle}</h1>
      <nav>
        {settings.social?.facebook && (
          <a href={settings.social.facebook}>Facebook</a>
        )}
      </nav>
    </header>
  );
}
```

### Generic Component Types

```typescript
// Generic resolver component
interface ResolverProps<T> {
  data: T;
  renderer: (item: T) => React.ReactNode;
}

function GenericResolver<T>({ data, renderer }: ResolverProps<T>) {
  if (!data) return null;
  return <>{renderer(data)}</>;
}

// Usage with type inference
<GenericResolver
  data={page}
  renderer={(page: Page) => <PageContent page={page} />}
/>
```

## Utility Types

### Common Utility Types

```typescript
// Sanity-specific utility types
export type SanityImage = {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
};

export type SanitySlug = {
  _type: "slug";
  current: string;
};

export type SanityReference<T = any> = {
  _ref: string;
  _type: "reference";
  _weak?: boolean;
};

export type SanityBlock = {
  _type: "block";
  _key: string;
  style?: string;
  children: Array<{
    _type: "span";
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: any;
  }>;
};
```

### Kit-Specific Types

```typescript
// Link types
export type InternalLink = {
  _type: 'internalLink';
  reference: SanityReference;
  slug: SanitySlug;
  text?: string;
};

export type ExternalLink = {
  _type: 'externalLink';
  url: string;
  text: string;
  newWindow?: boolean;
};

export type Link = InternalLink | ExternalLink;

// SEO types
export interface SEO {
  title?: string;
  description?: string;
  image?: SanityImage;
  noIndex?: boolean;
  keywords?: string[];
  canonicalUrl?: string;
}

// Module base type
export interface ModuleBase {
  _type: string;
  _key: string;
}

// Specific module types
export interface HeroModule extends ModuleBase {
  _type: 'module.hero';
  heading: string;
  subheading?: string;
  backgroundImage?: SanityImage;
  cta?: Link;
}

export interface GalleryModule extends ModuleBase {
  _type: 'module.gallery';
  title?: string;
  images: SanityImage[];
  layout: 'grid' | 'masonry' | 'carousel';
}

export type Module = HeroModule | GalleryModule | /* other modules */;
```

## Type Guards and Validation

### Runtime Type Checking

```typescript
// Type guards for runtime validation
export function isPage(document: any): document is Page {
  return document && document._type === 'page' && typeof document.title === 'string';
}

export function isPost(document: any): document is Post {
  return document && document._type === 'post' && typeof document.title === 'string';
}

export function hasSlug(document: any): document is { slug: SanitySlug } {
  return document && document.slug && typeof document.slug.current === 'string';
}

// Usage in components
function DocumentRenderer({ document }: { document: any }) {
  if (isPage(document)) {
    return <PageComponent page={document} />;
  }

  if (isPost(document)) {
    return <PostComponent post={document} />;
  }

  return <div>Unknown document type</div>;
}
```

### Schema Validation

```typescript
// Zod schema for runtime validation
import { z } from "zod";

const PageSchema = z.object({
  _id: z.string(),
  _type: z.literal("page"),
  title: z.string(),
  slug: z.object({
    current: z.string(),
  }),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  modules: z.array(z.any()).optional(),
});

type ValidatedPage = z.infer<typeof PageSchema>;

// Validate data at runtime
export async function getValidatedPage(
  slug: string,
): Promise<ValidatedPage | null> {
  const rawData = await loadQuery(pageQuery(slug));

  try {
    const page = PageSchema.parse(rawData.data);
    return page;
  } catch (error) {
    console.error("Invalid page data:", error);
    return null;
  }
}
```

## Advanced TypeScript Patterns

### Conditional Types

```typescript
// Conditional types based on configuration
type ContentTypeFields<T extends ContentType> =
  T["supports"] extends Array<infer U>
    ? U extends "title"
      ? { title: string }
      : U extends "slug"
        ? { slug: SanitySlug }
        : U extends "seo"
          ? { seo?: SEO }
          : {}
    : {};

// Template literal types for module names
type ModuleName<T extends string> = `module.${T}`;

type ValidModuleName = ModuleName<"hero" | "gallery" | "contact">;
// Results in: 'module.hero' | 'module.gallery' | 'module.contact'
```

### Mapped Types

```typescript
// Create settings type from configuration
type SettingsMap<T extends readonly Setting[]> = {
  [K in T[number]["name"]]: Extract<T[number], { name: K }>;
};

// Usage
const settings = ["general", "seo", "social"] as const;
type Settings = SettingsMap<typeof settings>;
// Results in: { general: GeneralSettings, seo: SeoSettings, social: SocialSettings }
```

### Template Types for Queries

```typescript
// Template types for type-safe queries
type QueryProjection<T> = {
  [K in keyof T]?: T[K] extends object ? QueryProjection<T[K]> | true : true;
};

// Usage
const pageProjection: QueryProjection<Page> = {
  title: true,
  slug: true,
  seo: {
    title: true,
    description: true,
  },
};
```

## Development Setup

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "sanity.types.ts"
  ],
  "exclude": ["node_modules"]
}
```

### Type Declaration Files

```typescript
// types/global.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SANITY_PROJECT_ID: string;
      NEXT_PUBLIC_SANITY_DATASET: string;
      SANITY_API_TOKEN: string;
      NEXT_PUBLIC_SITE_URL: string;
    }
  }
}

export {};
```

## Testing with Types

### Type-Safe Testing

```typescript
// __tests__/types/page.test.ts
import { expect, test } from '@jest/globals';
import type { Page } from '../../sanity.types';

const mockPage: Page = {
  _id: 'page-1',
  _type: 'page',
  title: 'Test Page',
  slug: { current: 'test-page' },
  seo: {
    title: 'Test Page SEO',
    description: 'Test description'
  }
};

test('page type validation', () => {
  expect(mockPage._type).toBe('page');
  expect(mockPage.title).toBe('Test Page');
  expect(mockPage.slug.current).toBe('test-page');
});

// Component testing with types
import { render } from '@testing-library/react';
import PageComponent from '@/components/PageComponent';

test('page component renders correctly', () => {
  const { getByRole } = render(<PageComponent page={mockPage} />);

  expect(getByRole('heading', { level: 1 })).toHaveTextContent('Test Page');
});
```

## Best Practices

### 1. Use Generated Types

```typescript
// ✅ Good: Use generated types
import type { Page, Post } from "../sanity.types";

// ❌ Avoid: Manual type definitions
interface ManualPage {
  title: string;
  // ... potentially out of sync with schema
}
```

### 2. Type Query Results

```typescript
// ✅ Good: Type query results
const { data } = await loadQuery<Page>(query, params);

// ❌ Avoid: Untyped queries
const { data } = await loadQuery(query, params); // data is any
```

### 3. Use Type Guards

```typescript
// ✅ Good: Runtime type checking
if (isPage(document)) {
  // TypeScript knows document is Page here
  console.log(document.title);
}

// ❌ Avoid: Unsafe type assertions
const page = document as Page; // Might throw at runtime
```

### 4. Leverage Template Literal Types

```typescript
// ✅ Good: Type-safe module names
type ModuleName = `module.${string}`;

const heroModule = defineModule({
  name: "module.hero" as ModuleName, // Type-checked
  // ...
});
```

### 5. Use Proper Generic Constraints

```typescript
// ✅ Good: Constrained generics
function processDocument<T extends { _id: string; _type: string }>(doc: T): T {
  // Implementation
  return doc;
}

// ❌ Avoid: Unconstrained generics
function processDocument<T>(doc: T): T {
  // Less type safety
  return doc;
}
```

## Related Documentation

- [API Reference](./api-reference.md) - Type definitions reference
- [Schema System](./schema-system.md) - Schema type definitions
- [Configuration](./configuration.md) - Configuration types
- [Components](./components.md) - Component type patterns

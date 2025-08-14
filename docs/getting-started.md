# Getting Started with @webicient/sanity-kit

This guide will walk you through installing and setting up @webicient/sanity-kit in your Sanity project.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Sanity Studio v3.45.0+** project (or create a new one)
- **Next.js 14.2.8+** for full feature support (optional but recommended)
- **React 18+** installed
- Basic knowledge of Sanity CMS and React

## Installation

### Step 1: Install the Package

Install @webicient/sanity-kit using npm or yarn:

```bash
npm install @webicient/sanity-kit
```

or with yarn:

```bash
yarn add @webicient/sanity-kit
```

### Step 2: Install Peer Dependencies

The plugin requires several peer dependencies. Install them if not already present:

```bash
npm install sanity@^3.45.0 next@^14.2.8 next-sanity@^9.3.10 next-intl@^3.17.4
```

## Basic Setup

### Step 1: Create Kit Configuration

Create a `kit.config.ts` file in your project root:

```typescript
// kit.config.ts
import { kitConfig } from '@webicient/sanity-kit';

export default kitConfig({
  // Basic configuration - no languages means single language mode
  schema: {
    // Your custom schemas will be merged with defaults
  }
});
```

### Step 2: Configure Sanity Studio

Update your `sanity.config.ts` to use the plugin:

```typescript
// sanity.config.ts
import { defineConfig } from 'sanity';
import { sanityKit } from '@webicient/sanity-kit';
import kitConfig from './kit.config';

export default defineConfig({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  
  plugins: [
    sanityKit(kitConfig)
  ]
});
```

### Step 3: Set Environment Variables

Create a `.env.local` file with your Sanity project details:

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-read-token # Optional, for draft content

# Studio Configuration (if embedded in Next.js)
SANITY_STUDIO_URL=/studio
```

## Multi-Language Setup

To enable multi-language support, update your kit configuration:

```typescript
// kit.config.ts
import { kitConfig } from '@webicient/sanity-kit';

export default kitConfig({
  languages: [
    { id: 'en', title: 'English', isDefault: true },
    { id: 'es', title: 'Spanish' },
    { id: 'fr', title: 'French' }
  ],
  
  schema: {
    // Schemas that support translation
    contentTypes: [
      // Your translatable content types
    ]
  }
});
```

## Next.js Integration

### Step 1: Configure Next.js App

Set up your Next.js application structure:

```
app/
├── layout.tsx       # Root layout with KitProvider
├── page.tsx         # Home page
├── [slug]/
│   └── page.tsx     # Dynamic pages
├── api/
│   └── draft/
│       ├── enable/
│       │   └── route.ts
│       └── disable/
│           └── route.ts
└── studio/
    └── [[...index]]/
        └── page.tsx  # Embedded Sanity Studio (optional)
```

### Step 2: Set Up Root Layout

Configure the root layout with KitProvider:

```typescript
// app/layout.tsx
import { KitProvider } from '@webicient/sanity-kit/provider';
import { loadSettings } from '@webicient/sanity-kit/query';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load all settings from Sanity
  const settings = await loadSettings();
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <KitProvider settings={settings}>
          {children}
        </KitProvider>
      </body>
    </html>
  );
}
```

### Step 3: Create Home Page

Set up your home page to fetch content:

```typescript
// app/page.tsx
import { loadQuery } from '@webicient/sanity-kit/query';
import { entityQuery } from '@webicient/sanity-kit/queries';
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';

export default async function HomePage() {
  const { data: home } = await loadQuery(
    entityQuery('home'),
    {},
    { next: { tags: ['home'] } }
  );
  
  if (!home) {
    return <div>Home page not configured</div>;
  }
  
  return (
    <main>
      <h1>{home.title}</h1>
      {home.modules && <ModuleResolver data={home.modules} />}
    </main>
  );
}
```

### Step 4: Create Dynamic Page Route

Handle dynamic pages with hierarchical support:

```typescript
// app/[...slug]/page.tsx
import { loadQuery } from '@webicient/sanity-kit/query';
import { pageQuery, generateStaticSlugs } from '@webicient/sanity-kit/queries';
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string[] };
}

export async function generateStaticParams() {
  const slugs = await generateStaticSlugs('page');
  return slugs.map((slug) => ({
    slug: slug.split('/').filter(Boolean),
  }));
}

export default async function Page({ params }: PageProps) {
  const slug = params.slug.join('/');
  
  const { data: page } = await loadQuery(
    pageQuery(slug),
    { slug },
    { next: { tags: [`page:${slug}`] } }
  );
  
  if (!page) {
    notFound();
  }
  
  return (
    <main>
      <h1>{page.title}</h1>
      {page.modules && <ModuleResolver data={page.modules} />}
    </main>
  );
}
```

## Visual Editing Setup

### Step 1: Enable Draft Mode

Create API routes for draft mode:

```typescript
// app/api/draft/enable/route.ts
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverClient } from '@webicient/sanity-kit/query';

const token = process.env.SANITY_API_TOKEN!;

export async function GET(request: Request) {
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    serverClient.withConfig({ token }),
    request.url
  );
  
  if (!isValid) {
    return new Response('Invalid secret', { status: 401 });
  }
  
  draftMode().enable();
  redirect(redirectTo);
}
```

```typescript
// app/api/draft/disable/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  draftMode().disable();
  redirect('/');
}
```

### Step 2: Add Visual Editing Component

Enable visual editing in your layout:

```typescript
// app/layout.tsx
import { KitVisualEditing } from '@webicient/sanity-kit/visual-editing';
import { draftMode } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await loadSettings();
  const { isEnabled } = draftMode();
  
  return (
    <html lang="en">
      <body>
        <KitProvider settings={settings}>
          {children}
          {isEnabled && <KitVisualEditing />}
        </KitProvider>
      </body>
    </html>
  );
}
```

## Verifying Installation

### Step 1: Check Studio

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your Sanity Studio (usually at `/studio`)

3. You should see the following structure:
   - **Content** section with Pages, Posts
   - **Taxonomies** section with Categories
   - **Settings** section with multiple setting types
   - **Media** library

### Step 2: Create Test Content

1. Create a new Page:
   - Click on "Pages" → "Create new"
   - Fill in Title and Slug
   - Add some modules if configured
   - Publish the document

2. Configure Home entity:
   - Go to "Entities" → "Home"
   - Add content and publish

### Step 3: Test Frontend

Visit your Next.js application and verify:
- Home page loads with content from Sanity
- Dynamic pages work with your test page
- Visual editing works in draft mode

## Common Setup Issues

### Module Not Found Errors

If you get module resolution errors, ensure all peer dependencies are installed:

```bash
npm list sanity next next-sanity next-intl
```

### TypeScript Errors

Generate TypeScript definitions for your schemas:

```bash
npx sanity schema extract
npx sanity typegen generate
```

### Studio Not Loading

Check that your project ID and dataset are correctly configured:

```bash
echo $NEXT_PUBLIC_SANITY_PROJECT_ID
echo $NEXT_PUBLIC_SANITY_DATASET
```

## Next Steps

Now that you have @webicient/sanity-kit installed and configured:

1. **Explore Schema System**: Learn how to create custom content types in [Schema System](./schema-system.md)
2. **Configure Settings**: Set up your site settings in [Settings Guide](./settings.md)
3. **Add Custom Modules**: Build content modules in [Modules Guide](./modules.md)
4. **Implement Queries**: Learn about data fetching in [Queries Guide](./queries.md)
5. **Add Components**: Use built-in components in [Components Guide](./components.md)

## Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md) for common issues
- Review [Examples](./examples.md) for implementation patterns
- Open an issue on [GitHub](https://github.com/webicient/sanity-kit/issues)
- Visit [Webicient](https://webicient.com) for professional support
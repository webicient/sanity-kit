# Troubleshooting Guide

Common issues and solutions when using @webicient/sanity-kit.

## Installation Issues

### Module Not Found Errors

**Problem:** Getting module resolution errors when importing from @webicient/sanity-kit

**Solution:** Ensure all peer dependencies are installed:

```bash
# Check current installations
npm list sanity next next-sanity next-intl

# Install missing dependencies
npm install sanity@^3.45.0 next@^14.2.8 next-sanity@^9.3.10 next-intl@^3.17.4
```

### TypeScript Import Errors

**Problem:** TypeScript can't find module declarations

**Solution:** Ensure the package is properly installed and restart your TypeScript server:

```bash
# Reinstall the package
npm uninstall @webicient/sanity-kit
npm install @webicient/sanity-kit

# Clear Node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Version Conflicts

**Problem:** Peer dependency version conflicts

**Solution:** Check and update your dependencies:

```bash
npm install @webicient/sanity-kit --legacy-peer-deps
```

Or update your package.json to match the required versions:

```json
{
  \"dependencies\": {
    \"sanity\": \"^3.45.0\",
    \"next\": \"^14.2.8\",
    \"next-sanity\": \"^9.3.10\",
    \"next-intl\": \"^3.17.4\"
  }
}
```

## Configuration Issues

### Plugin Not Loading

**Problem:** Sanity Studio loads but doesn't show kit features

**Solution:** Verify your sanity.config.ts is correctly configured:

```typescript
// ❌ Incorrect
import { sanityKit } from '@webicient/sanity-kit';

export default defineConfig({
  plugins: [sanityKit] // Missing function call
});

// ✅ Correct
import { sanityKit } from '@webicient/sanity-kit';
import kitConfig from './kit.config';

export default defineConfig({
  plugins: [sanityKit(kitConfig)] // Pass configuration
});
```

### Configuration Not Applied

**Problem:** Custom schemas or settings not appearing

**Solution:** Check that kitConfig is properly exported and imported:

```typescript
// kit.config.ts
import { kitConfig } from '@webicient/sanity-kit';

export default kitConfig({
  // Your configuration
});

// sanity.config.ts
import kitConfig from './kit.config'; // Import your config

export default defineConfig({
  plugins: [sanityKit(kitConfig)]
});
```

### Module Name Validation Error

**Problem:** `Module name \"hero\" does not start with \"module.\"`

**Solution:** Ensure module names are prefixed correctly:

```typescript
// ❌ Incorrect
defineModule({
  name: 'hero',
  // ...
})

// ✅ Correct
defineModule({
  name: 'module.hero',
  // ...
})
```

### Rewrite Path Error

**Problem:** `Rewrite path \"/products\" does not include \":slug\"`

**Solution:** Include the `:slug` parameter in rewrite paths:

```typescript
// ❌ Incorrect
defineContentType({
  name: 'product',
  rewrite: '/products',
  // ...
})

// ✅ Correct
defineContentType({
  name: 'product',
  rewrite: '/products/:slug',
  // ...
})
```

## Schema Issues

### Duplicate Schema Names

**Problem:** Schema conflicts with existing types

**Solution:** Use unique names or disable default schemas:

```typescript
// Option 1: Use unique names
defineContentType({
  name: 'customPage', // Different from default 'page'
  // ...
})

// Option 2: Disable default and replace
export default kitConfig({
  disableDefault: {
    schema: {
      contentTypes: ['page']
    }
  },
  schema: {
    contentTypes: [
      defineContentType({
        name: 'page', // Now you can use 'page'
        // ...
      })
    ]
  }
});
```

### Field Validation Errors

**Problem:** Custom validation rules not working

**Solution:** Ensure proper validation syntax:

```typescript
// ❌ Incorrect
defineField({
  name: 'price',
  type: 'number',
  validation: Rule => Rule.required() && Rule.positive() // Wrong syntax
})

// ✅ Correct
defineField({
  name: 'price',
  type: 'number',
  validation: Rule => Rule.required().positive()
})
```

### Translation Fields Not Showing

**Problem:** Language fields not appearing in translated schemas

**Solution:** Verify language configuration and translate flags:

```typescript
// Ensure languages are configured
export default kitConfig({
  languages: [
    { id: 'en', title: 'English', isDefault: true },
    { id: 'es', title: 'Spanish' }
  ],
  schema: {
    contentTypes: [
      defineContentType({
        name: 'page',
        translate: true, // Enable translation
        // ...
      })
    ]
  }
});
```

## Query Issues

### GROQ Query Errors

**Problem:** Invalid GROQ syntax or query failures

**Solution:** Debug your queries step by step:

```typescript
// Test queries in Sanity Vision first
const query = `*[_type == \"page\" && slug.current == $slug][0]`;

// Add error handling
try {
  const { data } = await loadQuery(query, { slug: 'home' });
  console.log(data);
} catch (error) {
  console.error('Query failed:', error);
}
```

### Data Not Loading

**Problem:** loadQuery returns undefined or null

**Solution:** Check query syntax and document existence:

```typescript
// Debug the query
const debugQuery = `*[_type == \"page\"]`; // List all pages first
const { data: allPages } = await loadQuery(debugQuery);
console.log('All pages:', allPages);

// Then test specific query
const specificQuery = `*[_type == \"page\" && slug.current == $slug][0]`;
const { data: page } = await loadQuery(specificQuery, { slug: 'home' });
console.log('Specific page:', page);
```

### Missing Query Fields

**Problem:** Expected fields not returned in query results

**Solution:** Verify field names and projections:

```typescript
// Check field names in Sanity Studio
const query = `
  *[_type == \"page\" && slug.current == $slug][0] {
    title,
    \"slug\": slug.current, // Use projection for nested fields
    seo,
    modules[] {
      _type,
      _key,
      // Include all module fields
      ...
    }
  }
`;
```

## Component Issues

### ModuleResolver Not Rendering

**Problem:** Modules not rendering in ModuleResolver

**Solution:** Ensure modules are properly registered:

```typescript
// Check module registration in kit config
export default kitConfig({
  schema: {
    modules: [
      heroModule, // Ensure module is included
      // ... other modules
    ]
  }
});

// Verify renderer is properly assigned
defineModule({
  name: 'module.hero',
  renderer: HeroComponent, // Component must be imported
  // ...
});
```

### Image Not Loading

**Problem:** ImageResolver not displaying images

**Solution:** Check image data structure:

```typescript
// Ensure image has proper structure
const query = `
  *[_type == \"page\"][0] {
    featuredImage {
      asset,
      hotspot,
      crop,
      alt
    }
  }
`;

// Use ImageResolver correctly
<ImageResolver
  {...page.featuredImage}
  alt={page.featuredImage?.alt || page.title}
  className=\"w-full h-auto\"
/>
```

### Link Resolution Failing

**Problem:** LinkResolver not working correctly

**Solution:** Implement proper href resolver:

```typescript
// In kit.config.ts
export default kitConfig({
  resolve: {
    hrefResolver: (prev, documentType, params, document) => {
      switch (documentType) {
        case 'page':
          return `/${params?.slug}`;
        case 'post':
          return `/blog/${params?.slug}`;
        default:
          return prev;
      }
    }
  }
});
```

## Environment Issues

### Environment Variables Not Loading

**Problem:** NEXT_PUBLIC_SANITY_PROJECT_ID is undefined

**Solution:** Check environment variable configuration:

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-token

# Restart development server after changes
npm run dev
```

### Draft Mode Not Working

**Problem:** Visual editing or draft preview not functioning

**Solution:** Verify draft mode setup:

```typescript
// app/api/draft/enable/route.ts
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { draftMode } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  if (!process.env.SANITY_API_TOKEN) {
    return new Response('Missing SANITY_API_TOKEN', { status: 500 });
  }
  
  // ... rest of implementation
}
```

### Studio Not Accessible

**Problem:** /studio route returns 404

**Solution:** Verify studio configuration:

```typescript
// app/studio/[[...index]]/page.tsx
import { Studio } from 'sanity';
import config from '../../../sanity.config';

export default function StudioPage() {
  return <Studio config={config} />;
}

// Or check Next.js routing
export const dynamic = 'force-static';
export { metadata } from 'next-sanity/studio';
```

## Performance Issues

### Slow Query Performance

**Problem:** Queries taking too long to execute

**Solution:** Optimize queries and add caching:

```typescript
// Add specific projections
const query = `
  *[_type == \"page\"] {
    title,
    slug,
    _updatedAt
  } // Only fetch needed fields
`;

// Use proper caching
const { data } = await loadQuery(
  query,
  {},
  {
    next: {
      revalidate: 3600, // Cache for 1 hour
      tags: ['pages']
    }
  }
);
```

### Bundle Size Issues

**Problem:** Large JavaScript bundle size

**Solution:** Use dynamic imports for heavy components:

```typescript
// Dynamic import for large modules
const HeavyModule = dynamic(() => import('@/components/HeavyModule'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

// Code splitting for modules
export const getBlock = (type: string) => {
  switch (type) {
    case 'module.hero':
      return dynamic(() => import('@/modules/Hero'));
    case 'module.gallery':
      return dynamic(() => import('@/modules/Gallery'));
    default:
      return null;
  }
};
```

## Build Issues

### Build Failures

**Problem:** npm run build fails with TypeScript errors

**Solution:** Generate and check types:

```bash
# Generate Sanity types
npx sanity schema extract
npx sanity typegen generate

# Check TypeScript configuration
npx tsc --noEmit

# Build with verbose output
npm run build -- --verbose
```

### Missing Dependencies in Production

**Problem:** Runtime errors in production build

**Solution:** Ensure all dependencies are in dependencies, not devDependencies:

```json
{
  \"dependencies\": {
    \"@webicient/sanity-kit\": \"latest\",
    \"sanity\": \"^3.45.0\",
    \"next-sanity\": \"^9.3.10\"
  },
  \"devDependencies\": {
    \"@types/react\": \"^18.3.3\"
  }
}
```

## Studio Issues

### Studio Loading Blank

**Problem:** Sanity Studio shows blank page

**Solution:** Check console errors and configuration:

```typescript
// Ensure proper configuration
export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, // Required
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!, // Required
  
  plugins: [
    sanityKit(kitConfig)
  ]
});
```

### Missing Permissions

**Problem:** \"Insufficient permissions\" errors

**Solution:** Check Sanity project permissions:

1. Go to sanity.io/manage
2. Select your project
3. Check API settings and tokens
4. Verify user roles and permissions

### Structure Not Loading

**Problem:** Custom structure not appearing

**Solution:** Verify structure configuration:

```typescript
// Check structure plugin order
export default defineConfig({
  plugins: [
    structureTool({
      structure: customStructure // Make sure this is defined
    }),
    sanityKit(kitConfig) // Kit will override structure
  ]
});
```

## Getting Help

### Debug Mode

Enable debug mode for more information:

```bash
# Enable debug logging
DEBUG=sanity* npm run dev

# Or set environment variable
SANITY_STUDIO_DEBUG=true npm run dev
```

### Common Commands

```bash
# Clear cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Sanity CLI
npx sanity --version
npx sanity check
```

### Where to Get Support

1. **Documentation**: Check [official docs](https://docs.sanity.io)
2. **Community**: [Sanity Discord](https://slack.sanity.io)
3. **Issues**: [GitHub Issues](https://github.com/webicient/sanity-kit/issues)
4. **Professional Support**: [Webicient](https://webicient.com)

### Reporting Bugs

When reporting issues, include:

1. **Environment details**: Node.js version, package versions
2. **Configuration**: Your kit.config.ts and sanity.config.ts
3. **Error messages**: Full error logs and stack traces
4. **Steps to reproduce**: Minimal reproduction case
5. **Expected vs actual behavior**: What should happen vs what does happen
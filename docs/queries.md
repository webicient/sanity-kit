# Queries and Data Fetching

Complete guide to querying data with @webicient/sanity-kit using GROQ and React hooks.

## Overview

@webicient/sanity-kit provides both GROQ query builders and React hooks for efficient data fetching. The system includes built-in queries for common use cases and utilities for building custom queries.

## Query Builders

### Built-in Query Functions

The plugin provides pre-built query functions for common content types:

```typescript
import {
  pageQuery,
  postQuery,
  entityQuery,
  settingsQuery,
  taxonomyQuery,
} from "@webicient/sanity-kit/queries";

// Query a page by slug
const query = pageQuery("home", "en");

// Query a post by slug
const query = postQuery("my-post", "en");

// Query an entity (singleton)
const query = entityQuery("home", "en");

// Query all settings
const query = settingsQuery("en");

// Query taxonomy by slug
const query = taxonomyQuery("category", "tech", "en");
```

### Page Queries

```typescript
// Basic page query
const basicPageQuery = pageQuery("about");

// Generates:
`*[_type == "page" && slug.current == "about"][0] {
  title,
  "slug": slug.current,
  seo,
  modules[] {
    _type,
    _key,
    ...
  }
}`;

// With language support
const localizedPageQuery = pageQuery("about", "es");

// Generates language-aware query with coalesce
`*[_type == "page" && slug.current == "about"][0] {
  "title": coalesce(es.title, title),
  "slug": slug.current,
  "seo": coalesce(es.seo, seo),
  modules[] {
    _type,
    _key,
    ...coalesce(es, @)
  }
}`;
```

### Post Queries

```typescript
// Single post query
const postQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    publishedAt,
    featuredImage,
    excerpt,
    body,
    categories[]-> {
      title,
      "slug": slug.current
    },
    seo
  }
`;

// Posts list query
const postsListQuery = `
  *[_type == "post"] | order(publishedAt desc) [0...$limit] {
    title,
    "slug": slug.current,  
    publishedAt,
    featuredImage,
    excerpt,
    categories[]-> {
      title,
      "slug": slug.current
    }
  }
`;

// Posts by category
const postsByCategoryQuery = `
  *[_type == "post" && $categoryId in categories[]._ref] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    featuredImage
  }
`;
```

### Entity Queries

```typescript
// Home page entity
const homeQuery = entityQuery("home");

// About page entity
const aboutQuery = entityQuery("about");

// Custom entity query
const customEntityQuery = `
  *[_type == $entityType][0] {
    title,
    seo,
    modules[] {
      _type,
      _key,
      ...
    }
  }
`;
```

### Settings Queries

```typescript
// All settings
const allSettingsQuery = settingsQuery();

// Specific settings
const specificSettingsQuery = `{
  "generalSettings": *[_type == "generalSettings"][0],
  "seoSettings": *[_type == "seoSettings"][0],
  "socialSettings": *[_type == "socialMediaSettings"][0]
}`;

// Settings with fallbacks
const settingsWithFallbacksQuery = `{
  "siteTitle": coalesce(
    *[_type == "generalSettings"][0].siteTitle,
    "Default Site Title"
  ),
  "domain": *[_type == "generalSettings"][0].domain,
  "social": {
    "facebook": *[_type == "socialMediaSettings"][0].facebook,
    "twitter": *[_type == "socialMediaSettings"][0].twitter
  }
}`;
```

## Server-side Data Loading

### Using loadQuery

```typescript
import { loadQuery } from '@webicient/sanity-kit/query';

// Basic usage
export default async function Page({ params }: { params: { slug: string } }) {
  const { data: page } = await loadQuery(
    pageQuery(params.slug),
    { slug: params.slug }
  );

  return <div>{page?.title}</div>;
}

// With caching options
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { data: post } = await loadQuery(
    postQuery(params.slug),
    { slug: params.slug },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: [`post:${params.slug}`, 'post']
      }
    }
  );

  return <article>{/* Render post */}</article>;
}
```

### Structure Loaders

Convenient functions for loading common document types:

```typescript
import {
  loadContentType,
  loadEntity,
  loadSettings,
  loadTaxonomy,
} from "@webicient/sanity-kit/query";

// Load a content type document
const page = await loadContentType("page", "home", "en");

// Load an entity (singleton)
const home = await loadEntity("home", "en");

// Load all settings
const settings = await loadSettings("en");

// Load a taxonomy document
const category = await loadTaxonomy("category", "technology", "en");
```

### Static Path Generation

```typescript
import { generateStaticSlugs } from "@webicient/sanity-kit/queries";

// Generate static paths for pages
export async function generateStaticParams() {
  const slugs = await generateStaticSlugs("page");

  return slugs.map((slug) => ({
    slug: slug.split("/").filter(Boolean),
  }));
}

// Generate paths for posts
export async function generateStaticParams() {
  const slugs = await generateStaticSlugs("post");

  return slugs.map((slug) => ({
    slug,
  }));
}

// Custom static params generation
const customStaticParams = async () => {
  const { data: pages } = await loadQuery(`
    *[_type == "page" && defined(slug.current)] {
      "slug": slug.current,
      "locale": language
    }
  `);

  return pages.map((page) => ({
    slug: page.slug.split("/").filter(Boolean),
    locale: page.locale,
  }));
};
```

## Client-side Data Fetching

### useQuery Hook

```typescript
'use client';
import { useQuery } from '@webicient/sanity-kit/query';

function BlogPostList() {
  const { data: posts, loading, error } = useQuery(`
    *[_type == "post"] | order(publishedAt desc) [0...10] {
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      featuredImage
    }
  `);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {posts?.map((post: any) => (
        <article key={post.slug}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Dynamic Queries with Parameters

```typescript
function SearchResults({ query }: { query: string }) {
  const { data: results, loading } = useQuery(
    `*[_type in ["post", "page"] && title match $searchQuery] {
      _type,
      title,
      "slug": slug.current,
      excerpt
    }`,
    { searchQuery: `${query}*` }
  );

  if (loading) return <div>Searching...</div>;

  return (
    <div>
      {results?.map((result: any) => (
        <div key={result.slug}>
          <span className="badge">{result._type}</span>
          <h3>{result.title}</h3>
        </div>
      ))}
    </div>
  );
}
```

## Advanced Query Patterns

### Hierarchical Content

```typescript
// Get page with breadcrumb trail
const pageWithBreadcrumbs = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    seo,
    modules,
    "breadcrumbs": *[_type == "page" && _id in path("$.parent")].{
      title,
      "slug": slug.current
    }
  }
`;

// Get page children
const pageWithChildren = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    "children": *[_type == "page" && parent._ref == ^._id] {
      title,
      "slug": slug.current,
      excerpt
    }
  }
`;
```

### Content with References

```typescript
// Post with author and category details
const postWithReferences = `
  *[_type == "post" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    publishedAt,
    body,
    "author": author-> {
      name,
      bio,
      image
    },
    "categories": categories[]-> {
      title,
      "slug": slug.current,
      color
    }
  }
`;

// Product with related products
const productWithRelated = `
  *[_type == "product" && slug.current == $slug][0] {
    title,
    price,
    description,
    images,
    "related": *[_type == "product" && category == ^.category && _id != ^._id][0...4] {
      title,
      "slug": slug.current,
      price,
      images[0]
    }
  }
`;
```

### Conditional Content

```typescript
// Content based on user role or conditions
const conditionalContent = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    "content": select(
      $userRole == "admin" => fullContent,
      $userRole == "member" => memberContent,
      publicContent
    )
  }
`;

// Published content only
const publishedContent = `
  *[_type == "post" && publishedAt <= now() && !(_id in path("drafts.**"))] 
  | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt
  }
`;
```

### Aggregated Data

```typescript
// Category with post count
const categoriesWithCounts = `
  *[_type == "category"] {
    title,
    "slug": slug.current,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
`;

// Author with recent posts
const authorsWithPosts = `
  *[_type == "author"] {
    name,
    bio,
    image,
    "recentPosts": *[_type == "post" && author._ref == ^._id] 
      | order(publishedAt desc) [0...3] {
      title,
      "slug": slug.current,
      publishedAt
    }
  }
`;
```

## Language-Aware Queries

### Multi-language Content

```typescript
// Query with language fallback
const multiLanguageQuery = (language: string) => `
  *[_type == "page" && slug.current == $slug][0] {
    "title": coalesce(${language}.title, title),
    "slug": slug.current,
    "body": coalesce(${language}.body, body),
    "seo": coalesce(${language}.seo, seo)
  }
`;

// All languages for a document
const allLanguagesQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    en,
    es,
    fr,
    de
  }
`;
```

### Language-specific Queries

```typescript
// Content available in specific language
const languageSpecificQuery = `
  *[_type == "post" && defined(${language}.title)] {
    "title": coalesce(${language}.title, title),
    "slug": slug.current,
    "excerpt": coalesce(${language}.excerpt, excerpt)
  }
`;
```

## Performance Optimization

### Efficient Projections

```typescript
// Good: Only fetch needed fields
const efficientQuery = `
  *[_type == "post"] {
    title,
    "slug": slug.current,
    publishedAt
  }
`;

// Avoid: Fetching everything
const inefficientQuery = `*[_type == "post"]`;
```

### Pagination

```typescript
// Paginated results
const paginatedQuery = `
  *[_type == "post"] | order(publishedAt desc) [$start...$end] {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt
  }
`;

// Usage
const { data: posts } = await loadQuery(paginatedQuery, {
  start: page * limit,
  end: (page + 1) * limit - 1,
});
```

### Caching Strategies

```typescript
// Static content - cache for 24 hours
const staticContent = await loadQuery(
  pageQuery("about"),
  { slug: "about" },
  { next: { revalidate: 86400 } },
);

// Dynamic content - cache for 5 minutes
const dynamicContent = await loadQuery(
  postsQuery,
  {},
  { next: { revalidate: 300 } },
);

// Real-time content - no cache
const realTimeContent = await loadQuery(
  liveDataQuery,
  {},
  { next: { revalidate: 0 } },
);
```

## Custom Query Utilities

### Query Builder Helper

```typescript
// Custom query builder
export function buildContentQuery(
  type: string,
  slug: string,
  language?: string,
) {
  const baseProjection = `
    title,
    "slug": slug.current,
    seo,
    modules
  `;

  const localizedProjection = language
    ? `
    "title": coalesce(${language}.title, title),
    "slug": slug.current,
    "seo": coalesce(${language}.seo, seo),
    "modules": modules[] {
      _type,
      _key,
      ...coalesce(${language}, @)
    }
  `
    : baseProjection;

  return `
    *[_type == "${type}" && slug.current == "${slug}"][0] {
      ${localizedProjection}
    }
  `;
}
```

### Reusable Query Fragments

```typescript
// Common projections
const seoProjection = `
  seo {
    title,
    description,
    image,
    noIndex
  }
`;

const imageProjection = `
  image {
    asset,
    hotspot,
    crop,
    alt
  }
`;

const linkProjection = `
  {
    _type,
    text,
    url,
    "internal": internal-> {
      _type,
      title,
      "slug": slug.current
    }
  }
`;

// Compose queries
const pageQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    ${seoProjection},
    "featuredImage": featuredImage ${imageProjection},
    modules[] {
      ...,
      "link": link ${linkProjection}
    }
  }
`;
```

## Error Handling

### Query Error Handling

```typescript
async function safeQuery(query: string, params = {}) {
  try {
    const { data } = await loadQuery(query, params);
    return { data, error: null };
  } catch (error) {
    console.error('Query failed:', error);
    return { data: null, error };
  }
}

// Usage
const { data: page, error } = await safeQuery(
  pageQuery('home'),
  { slug: 'home' }
);

if (error) {
  // Handle error - show fallback, redirect, etc.
  return <ErrorPage />;
}
```

### Client-side Error Handling

```typescript
function DataComponent() {
  const { data, loading, error } = useQuery(queryString);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <ErrorBoundary>
        <ErrorMessage error={error} />
      </ErrorBoundary>
    );
  }

  if (!data) {
    return <EmptyState />;
  }

  return <DataDisplay data={data} />;
}
```

## Best Practices

### 1. Use Specific Projections

```typescript
// Good: Specific fields
const specificQuery = `
  *[_type == "post"] {
    title,
    "slug": slug.current,
    publishedAt
  }
`;

// Avoid: Fetching everything
const broadQuery = `*[_type == "post"]`;
```

### 2. Implement Proper Caching

```typescript
// Cache static content longer
const staticPage = await loadQuery(pageQuery, params, {
  next: { revalidate: 3600, tags: ["page"] },
});

// Cache dynamic content shorter
const dynamicList = await loadQuery(listQuery, params, {
  next: { revalidate: 300, tags: ["posts"] },
});
```

### 3. Handle Loading States

```typescript
function AsyncComponent() {
  const { data, loading, error } = useQuery(query);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState />;

  return <DataComponent data={data} />;
}
```

### 4. Use TypeScript for Type Safety

```typescript
interface Post {
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
}

const { data: posts } = await loadQuery<Post[]>(
  postsQuery,
  {},
  { next: { tags: ["posts"] } },
);
```

## Related Documentation

- [Data Fetching](./data-fetching.md) - Server and client patterns
- [API Reference](./api-reference.md) - Query function reference
- [Configuration](./configuration.md) - Custom query resolvers

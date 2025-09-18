# Built-in Content Types

Complete reference for all built-in content types provided by @webicient/sanity-kit.

## Overview

@webicient/sanity-kit includes several pre-configured content types that cover common use cases for most websites. These content types are ready to use out-of-the-box and can be extended or customized as needed.

## Page Content Type

Hierarchical pages with SEO and module support.

### Configuration

```typescript
export const page = defineContentType({
  name: "page",
  title: "Page",
  pluralTitle: "Pages",
  icon: DocumentIcon,
  hierarchical: true,
  supports: ["title", "slug", "seo", "modules"],
  rewrite: "/:slug",
  translate: true,
});
```

### Features

- **Hierarchical Structure**: Parent-child page relationships
- **SEO Support**: Complete SEO metadata fields
- **Module System**: Content builder with modules
- **Translation Ready**: Multi-language support
- **Automatic Slug Generation**: From title field

### Fields Included

- `title` (string): Page title
- `slug` (slug): URL-friendly identifier
- `parent` (reference): Parent page for hierarchy
- `seo` (object): SEO metadata
- `modules` (array): Content builder modules

### Usage Example

```typescript
// Query a page with all data
const pageQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    seo,
    modules[] {
      _type,
      _key,
      ...
    },
    "parent": parent->{
      title,
      "slug": slug.current
    }
  }
`;

// In Next.js component
const { data: page } = await loadQuery(pageQuery, { slug: params.slug });
```

## Post Content Type

Blog posts with taxonomy support.

### Configuration

```typescript
export const post = defineContentType({
  name: "post",
  title: "Post",
  pluralTitle: "Posts",
  icon: EditIcon,
  taxonomies: [{ name: "category", multiple: true, required: true }],
  supports: [
    "title",
    "slug",
    "publishedAt",
    "featuredImage",
    "excerpt",
    "body",
    "seo",
  ],
  rewrite: "/post/:slug",
  translate: true,
});
```

### Features

- **Blog Functionality**: Complete blog post structure
- **Category Association**: Required category taxonomy
- **Publication Dates**: Published at timestamp
- **Featured Images**: With hotspot and alt text
- **Rich Content**: Body field with portable text
- **SEO Optimized**: Full metadata support

### Fields Included

- `title` (string): Post title
- `slug` (slug): URL-friendly identifier
- `publishedAt` (date): Publication date
- `featuredImage` (image): Featured image with hotspot
- `excerpt` (text): Short description
- `body` (rich text): Main content
- `categories` (reference array): Associated categories
- `seo` (object): SEO metadata

### Usage Example

```typescript
// Query posts with categories
const postsQuery = `
  *[_type == "post"] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    featuredImage,
    categories[]-> {
      title,
      "slug": slug.current
    }
  }
`;

// Blog post page
const postQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    publishedAt,
    featuredImage,
    body,
    categories[]-> {
      title,
      "slug": slug.current
    },
    seo
  }
`;
```

## Redirect Content Type

URL redirect management for SEO and migration.

### Configuration

```typescript
export const redirect = defineContentType({
  name: "redirect",
  title: "Redirect",
  pluralTitle: "Redirects",
  icon: LinkIcon,
  supports: [],
  groups: [],
  menu: {
    level: 4,
  },
  fields: [
    // Custom fields for redirect management
  ],
});
```

### Features

- **Redirect Management**: Source to destination URL mapping
- **Unique Validation**: Prevents duplicate source URLs
- **HTTP Status Codes**: 301, 302, 307, 308 redirect types
- **Path Validation**: Ensures proper URL format

### Fields Included

- `name` (string): Descriptive name for the redirect
- `source` (string): Source path (must start with /)
- `destination` (url): Destination URL (full URL with domain)
- `statusCode` (number): HTTP redirect status code
- `enabled` (boolean): Enable/disable redirect

### Usage Example

```typescript
// Query all active redirects
const redirectsQuery = `
  *[_type == "redirect" && enabled == true] {
    source,
    destination,
    statusCode
  }
`;

// In Next.js middleware for redirect handling
export function middleware(request: NextRequest) {
  const { data: redirects } = await loadQuery(redirectsQuery);

  const redirect = redirects.find((r) => r.source === request.nextUrl.pathname);
  if (redirect) {
    return NextResponse.redirect(redirect.destination, redirect.statusCode);
  }
}
```

## Preset Content Type

Reusable content modules for consistent branding.

### Configuration

```typescript
export const preset = defineContentType({
  name: "preset",
  title: "Preset",
  pluralTitle: "Presets",
  icon: StackIcon,
  supports: ["title", "modules"],
  menu: {
    level: 3,
  },
});
```

### Features

- **Reusable Content**: Pre-built module combinations
- **Consistent Design**: Maintains brand consistency
- **Easy Management**: Centralized content updates
- **Module Integration**: Works with module system

### Fields Included

- `title` (string): Preset name
- `modules` (array): Array of content modules
- `description` (text): Usage description

### Usage Example

```typescript
// Query preset with modules
const presetQuery = `
  *[_type == "preset" && title == $presetName][0] {
    title,
    modules[] {
      _type,
      _key,
      ...
    }
  }
`;

// Using preset in page modules
{
  "_type": "kit.preset",
  "preset": {
    "_type": "reference",
    "_ref": "preset-id"
  }
}
```

## Category Taxonomy

Default taxonomy for content categorization.

### Configuration

```typescript
export const category = defineTaxonomy({
  name: "category",
  title: "Category",
  pluralTitle: "Categories",
  supports: ["title", "slug", "description"],
  translate: true,
});
```

### Features

- **Content Organization**: Categorize posts and content
- **SEO Friendly**: With description and slug fields
- **Translation Support**: Multi-language categories
- **Hierarchical Option**: Can be extended for nested categories

### Fields Included

- `title` (string): Category name
- `slug` (slug): URL-friendly identifier
- `description` (text): Category description

### Usage Example

```typescript
// Query categories with post counts
const categoriesQuery = `
  *[_type == "category"] {
    title,
    "slug": slug.current,
    description,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
`;

// Category page with posts
const categoryPostsQuery = `
  *[_type == "post" && $categoryId in categories[]._ref] {
    title,
    "slug": slug.current,
    publishedAt,
    excerpt
  }
`;
```

## Customizing Built-in Content Types

### Extending with Additional Fields

```typescript
// Add custom fields to existing content types
export default kitConfig({
  schema: {
    contentTypes: [
      defineContentType({
        name: "post",
        // Inherits all default post configuration
        fields: [
          defineField({
            name: "author",
            title: "Author",
            type: "reference",
            to: [{ type: "author" }],
          }),
          defineField({
            name: "readingTime",
            title: "Reading Time (minutes)",
            type: "number",
          }),
        ],
      }),
    ],
  },
});
```

### Disabling Default Content Types

```typescript
// Remove unwanted default content types
export default kitConfig({
  disableDefault: {
    schema: {
      contentTypes: ["redirect", "preset"], // Disable these
    },
  },
});
```

### Customizing Rewrite Patterns

```typescript
// Custom URL patterns
const customPost = defineContentType({
  name: "post",
  rewrite: "/blog/:slug", // Custom blog path
  // ... other configuration
});

const customPage = defineContentType({
  name: "page",
  rewrite: "/pages/:slug", // Custom page path
  // ... other configuration
});
```

## Best Practices

### 1. Use Appropriate Content Types

- **Pages**: For static content and landing pages
- **Posts**: For blog articles and time-based content
- **Redirects**: For URL migration and SEO management
- **Presets**: For reusable content blocks

### 2. Leverage Taxonomy Relationships

```typescript
// Good: Use required categories for better content organization
taxonomies: [{ name: "category", multiple: true, required: true }];
```

### 3. Optimize for SEO

```typescript
// Always include SEO support for public content
supports: ["title", "slug", "seo"];
```

### 4. Consider Translation Needs

```typescript
// Enable translation for global content
translate: true;
```

### 5. Plan URL Structure

```typescript
// Consistent URL patterns
rewrite: "/blog/:slug"; // For posts
rewrite: "/:slug"; // For pages (hierarchical)
rewrite: "/products/:slug"; // For products
```

## Integration with Next.js

### Dynamic Routing

```typescript
// app/[...slug]/page.tsx - Handle all page routes
export async function generateStaticParams() {
  const { data: pages } = await loadQuery(`
    *[_type == "page"] {
      "slug": slug.current
    }
  `);

  return pages.map((page) => ({
    slug: page.slug.split("/").filter(Boolean),
  }));
}
```

### Blog Implementation

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { data: post } = await loadQuery(postQuery, { slug: params.slug });

  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
      <PortableText value={post.body} />
    </article>
  );
}
```

## Related Documentation

- [Schema System](./schema-system.md) - Creating custom content types
- [Queries](./queries.md) - Querying content types
- [Configuration](./configuration.md) - Customizing built-in types

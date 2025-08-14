# API Reference

Complete API documentation for all @webicient/sanity-kit exports.

## Main Exports

### Configuration Functions

#### `kitConfig(config: KitConfig): KitConfig`

Creates and validates a kit configuration object.

**Parameters:**
- `config` (KitConfig): Configuration object

**Returns:** Validated KitConfig object

**Example:**
```typescript
import { kitConfig } from '@webicient/sanity-kit';

const config = kitConfig({
  languages: [
    { id: 'en', title: 'English', isDefault: true }
  ]
});
```

#### `sanityKit(config: KitConfig): Plugin`

Sanity plugin factory function.

**Parameters:**
- `config` (KitConfig): Kit configuration

**Returns:** Sanity plugin instance

**Example:**
```typescript
import { sanityKit } from '@webicient/sanity-kit';
import { defineConfig } from 'sanity';

export default defineConfig({
  plugins: [sanityKit(config)]
});
```

### Schema Definition Functions

#### `defineContentType(contentType: ContentType): ContentType`

Defines a content type (collection) schema.

**Parameters:**
- `contentType` (ContentType): Content type definition
  - `name` (string, required): Schema name
  - `title` (string, required): Display title
  - `pluralTitle` (string, required): Plural display title
  - `supports?` (Supports[]): Supported fields
  - `rewrite?` (string): URL rewrite pattern
  - `hierarchical?` (boolean): Enable hierarchy
  - `translate?` (boolean): Enable translation
  - `taxonomies?` (ContentTypeTaxonomy[]): Associated taxonomies
  - `fields?` (FieldDefinition[]): Custom fields
  - `menu?` (StructureMenu): Menu configuration
  - `hidden?` (boolean): Hide from structure

**Returns:** ContentType object

**Example:**
```typescript
const product = defineContentType({
  name: 'product',
  title: 'Product',
  pluralTitle: 'Products',
  supports: ['title', 'slug', 'seo'],
  rewrite: '/products/:slug',
  translate: true,
  taxonomies: [
    { name: 'category', multiple: true }
  ]
});
```

#### `defineEntity(entity: Entity): Entity`

Defines an entity (singleton) schema.

**Parameters:**
- `entity` (Entity): Entity definition
  - `name` (string, required): Schema name
  - `title` (string, required): Display title
  - `supports?` (Supports[]): Supported fields
  - `rewrite?` (string): URL rewrite pattern
  - `translate?` (boolean): Enable translation
  - `fields?` (FieldDefinition[]): Custom fields
  - `menu?` (StructureMenu): Menu configuration
  - `hidden?` (boolean): Hide from structure

**Returns:** Entity object

**Example:**
```typescript
const about = defineEntity({
  name: 'about',
  title: 'About Page',
  supports: ['seo', 'modules'],
  rewrite: '/about'
});
```

#### `defineSetting(setting: Setting): Setting`

Defines a settings schema.

**Parameters:**
- `setting` (Setting): Setting definition
  - `name` (string, required): Schema name
  - `title` (string, required): Display title
  - `translate?` (boolean): Enable translation
  - `fields?` (FieldDefinition[]): Setting fields

**Returns:** Setting object

**Example:**
```typescript
const shopSettings = defineSetting({
  name: 'shop',
  title: 'Shop Settings',
  fields: [
    defineField({
      name: 'currency',
      type: 'string',
      title: 'Currency'
    })
  ]
});
```

#### `defineTaxonomy(taxonomy: Taxonomy): Taxonomy`

Defines a taxonomy schema.

**Parameters:**
- `taxonomy` (Taxonomy): Taxonomy definition
  - `name` (string, required): Schema name
  - `title` (string, required): Display title
  - `pluralTitle` (string, required): Plural display title
  - `supports?` (Supports[]): Supported fields
  - `translate?` (boolean): Enable translation
  - `fields?` (FieldDefinition[]): Custom fields

**Returns:** Taxonomy object

**Example:**
```typescript
const brand = defineTaxonomy({
  name: 'brand',
  title: 'Brand',
  pluralTitle: 'Brands',
  supports: ['title', 'slug', 'description']
});
```

#### `defineModule(module: Module): Module`

Defines a content builder module.

**Parameters:**
- `module` (Module): Module definition
  - `name` (string, required): Module name (must start with 'module.')
  - `title` (string, required): Display title
  - `fields` (FieldDefinition[], required): Module fields
  - `renderer` (ComponentType, required): React component
  - `imageUrl` (string, required): Preview image URL
  - `query?` (function): GROQ query function

**Returns:** Module object

**Example:**
```typescript
const hero = defineModule({
  name: 'module.hero',
  title: 'Hero Section',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading'
    })
  ],
  renderer: HeroComponent,
  imageUrl: '/modules/hero.png',
  query: (language) => `
    heading,
    subheading
  `
});
```

#### `defineStructure(structure: Structure): Structure`

Defines a custom studio structure.

**Parameters:**
- `structure` (Structure): Structure definition
  - `menu?` (StructureMenu): Menu configuration
  - `builder?` (function): Structure builder function

**Returns:** Structure object

## Query Exports (/query)

### Data Loading Functions

#### `loadQuery<T>(query: string, params?: QueryParams, options?: QueryOptions): Promise<QueryResult<T>>`

Loads data using GROQ query with appropriate caching.

**Parameters:**
- `query` (string): GROQ query string
- `params` (QueryParams, optional): Query parameters
- `options` (QueryOptions, optional): Query options
  - `perspective?` (string): 'published' | 'previewDrafts'
  - `next?` (object): Next.js cache options

**Returns:** Promise resolving to QueryResult with data and metadata

**Example:**
```typescript
import { loadQuery } from '@webicient/sanity-kit/query';

const { data } = await loadQuery(
  `*[_type == "page" && slug.current == $slug][0]`,
  { slug: 'home' },
  { next: { tags: ['page:home'] } }
);
```

### Structure Loaders

#### `loadContentType(name: string, slug: string, language?: string): Promise<any>`

Loads a content type document by slug.

**Parameters:**
- `name` (string): Content type name
- `slug` (string): Document slug
- `language` (string, optional): Language code

**Returns:** Promise resolving to document data

#### `loadEntity(name: string, language?: string): Promise<any>`

Loads an entity (singleton) document.

**Parameters:**
- `name` (string): Entity name
- `language` (string, optional): Language code

**Returns:** Promise resolving to entity data

#### `loadSettings(language?: string): Promise<Record<string, any>>`

Loads all settings documents.

**Parameters:**
- `language` (string, optional): Language code

**Returns:** Promise resolving to settings object

#### `loadTaxonomy(name: string, slug: string, language?: string): Promise<any>`

Loads a taxonomy document by slug.

**Parameters:**
- `name` (string): Taxonomy name
- `slug` (string): Document slug
- `language` (string, optional): Language code

**Returns:** Promise resolving to taxonomy data

### Client Utilities

#### `serverClient: SanityClient`

Pre-configured Sanity client for server-side queries.

**Example:**
```typescript
import { serverClient } from '@webicient/sanity-kit/query';

const data = await serverClient.fetch(
  `*[_type == "page"][0...10]`
);
```

### React Hooks

#### `useQuery<T>(query: string, params?: QueryParams): QueryResult<T>`

React hook for client-side data fetching.

**Parameters:**
- `query` (string): GROQ query string
- `params` (QueryParams, optional): Query parameters

**Returns:** QueryResult with data and loading state

**Example:**
```typescript
import { useQuery } from '@webicient/sanity-kit/query';

function Component() {
  const { data, loading, error } = useQuery(
    `*[_type == "post"][0...10]`
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

## Component Exports (/resolvers)

### Resolver Components

#### `<ModuleResolver data={modules} />`

Renders an array of content modules.

**Props:**
- `data` (array): Array of module objects

**Example:**
```typescript
import { ModuleResolver } from '@webicient/sanity-kit/resolvers';

<ModuleResolver data={page.modules} />
```

#### `<ImageResolver {...imageData} />`

Renders responsive images with Sanity image optimization.

**Props:**
- Image data from Sanity
- `alt?` (string): Alt text
- `className?` (string): CSS classes
- `sizes?` (string): Responsive sizes

**Example:**
```typescript
import { ImageResolver } from '@webicient/sanity-kit/resolvers';

<ImageResolver 
  {...page.featuredImage}
  alt="Featured image"
  className="w-full h-auto"
/>
```

#### `<LinkResolver {...linkData} />`

Renders internal or external links.

**Props:**
- Link data from Sanity
- `className?` (string): CSS classes
- `children` (ReactNode): Link content

**Example:**
```typescript
import { LinkResolver } from '@webicient/sanity-kit/resolvers';

<LinkResolver 
  {...page.cta}
  className="btn btn-primary"
>
  Learn More
</LinkResolver>
```

## Provider Exports (/provider)

### Provider Component

#### `<KitProvider settings={settings}>`

Provides kit context to child components.

**Props:**
- `settings` (object): Settings from Sanity
- `children` (ReactNode): Child components

**Example:**
```typescript
import { KitProvider } from '@webicient/sanity-kit/provider';

<KitProvider settings={settings}>
  {children}
</KitProvider>
```

### Hooks

#### `useKit(): KitContextProps`

Access kit context values.

**Returns:**
- `settings` (object): Global settings
- `translations` (object): Translation data
- `setTranslations` (function): Update translations

**Example:**
```typescript
import { useKit } from '@webicient/sanity-kit/provider';

function Component() {
  const { settings } = useKit();
  
  return <div>{settings.generalSettings?.siteName}</div>;
}
```

## Visual Editing Exports (/visual-editing)

### Components

#### `<KitVisualEditing />`

Enables visual editing in preview mode.

**Example:**
```typescript
import { KitVisualEditing } from '@webicient/sanity-kit/visual-editing';
import { draftMode } from 'next/headers';

export default function Layout({ children }) {
  const { isEnabled } = draftMode();
  
  return (
    <>
      {children}
      {isEnabled && <KitVisualEditing />}
    </>
  );
}
```

#### `<DisablePreviewMode />`

Provides UI to disable preview mode.

**Example:**
```typescript
import { DisablePreviewMode } from '@webicient/sanity-kit/visual-editing';

<DisablePreviewMode />
```

## Query Builder Exports (/queries)

### Query Functions

#### `pageQuery(slug: string, language?: string): string`

Generates GROQ query for page documents.

#### `postQuery(slug: string, language?: string): string`

Generates GROQ query for post documents.

#### `entityQuery(name: string, language?: string): string`

Generates GROQ query for entity documents.

#### `settingsQuery(language?: string): string`

Generates GROQ query for all settings.

#### `taxonomyQuery(name: string, slug: string, language?: string): string`

Generates GROQ query for taxonomy documents.

### Utility Functions

#### `generateStaticSlugs(contentType: string): Promise<string[]>`

Generates static paths for content types.

**Example:**
```typescript
import { generateStaticSlugs } from '@webicient/sanity-kit/queries';

export async function generateStaticParams() {
  const slugs = await generateStaticSlugs('page');
  return slugs.map(slug => ({ slug }));
}
```

## Utility Exports (/utils)

### Image Utilities

#### `getImageDimensions(image: SanityImage): { width: number, height: number, aspectRatio: number }`

Extracts dimensions from Sanity image.

#### `urlForImage(image: SanityImage): ImageUrlBuilder`

Creates image URL builder.

### URL Utilities

#### `isValidUrlSegment(segment: string): boolean`

Validates URL segment format.

#### `resolveHref(documentType: string, slug?: string): string`

Resolves document href.

### Metadata Utilities

#### `generateMetadata(page: any, settings: any): Metadata`

Generates Next.js metadata object.

**Example:**
```typescript
import { generateMetadata } from '@webicient/sanity-kit/utils';

export async function generateMetadata({ params }) {
  const page = await loadPage(params.slug);
  const settings = await loadSettings();
  
  return generateMetadata(page, settings);
}
```

## Type Exports

### Core Types

```typescript
// Content type definition
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

// Entity definition
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

// Module definition
interface Module {
  name: string;
  title: string;
  fields: FieldDefinition[];
  renderer: ComponentType<any>;
  imageUrl: string;
  query?: (language?: string) => string;
}

// Supported fields
type Supports = 
  | 'title'
  | 'slug'
  | 'seo'
  | 'modules'
  | 'body'
  | 'excerpt'
  | 'featuredImage'
  | 'publishedAt';
```

## Environment Variables

### Required Variables

```bash
# Sanity project configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# Optional: For authenticated requests
SANITY_API_TOKEN=your-token

# Optional: Studio configuration
SANITY_STUDIO_URL=/studio
```

## Error Handling

All functions handle errors gracefully:

```typescript
try {
  const { data } = await loadQuery(query);
  // Handle data
} catch (error) {
  if (error.code === 'QUERY_ERROR') {
    // Handle query error
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network error
  }
}
```

## Version Compatibility

- Sanity Studio: v3.45.0+
- Next.js: v14.2.8+
- React: v18+
- Node.js: v18+
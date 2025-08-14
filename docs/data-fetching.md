# Data Fetching Patterns

Server and client-side data fetching strategies with @webicient/sanity-kit.

## Server-Side Data Fetching

### Next.js App Router with loadQuery

```typescript
import { loadQuery } from '@webicient/sanity-kit/query';
import { pageQuery } from '@webicient/sanity-kit/queries';

// Static page generation
export default async function Page({ params }: { params: { slug: string } }) {
  const { data: page } = await loadQuery(
    pageQuery(params.slug),
    { slug: params.slug },
    {
      next: {
        revalidate: 3600, // ISR - revalidate every hour
        tags: [`page:${params.slug}`] // On-demand revalidation
      }
    }
  );
  
  if (!page) {
    notFound();
  }
  
  return (
    <main>
      <h1>{page.title}</h1>
      {/* Render page content */}
    </main>
  );
}

// Generate static params for SSG
export async function generateStaticParams() {
  const { data: pages } = await loadQuery(`
    *[_type == "page"] {
      "slug": slug.current
    }
  `);
  
  return pages.map((page) => ({
    slug: page.slug.split('/').filter(Boolean)
  }));
}
```

### Caching Strategies

#### Static Site Generation (SSG)

```typescript
// Static generation with ISR fallback
export default async function StaticPage({ params }: PageProps) {
  const { data: page } = await loadQuery(
    pageQuery(params.slug),
    { slug: params.slug },
    {
      next: {
        revalidate: false, // Static generation
        tags: [`page:${params.slug}`]
      }
    }
  );
  
  return <PageComponent page={page} />;
}

export async function generateStaticParams() {
  // Generate all pages at build time
  const slugs = await generateStaticSlugs('page');
  return slugs.map(slug => ({ slug: slug.split('/').filter(Boolean) }));
}

// Force static generation
export const dynamic = 'force-static';
```

#### Incremental Static Regeneration (ISR)

```typescript
// ISR with time-based revalidation
export default async function ISRPage({ params }: PageProps) {
  const { data: page } = await loadQuery(
    pageQuery(params.slug),
    { slug: params.slug },
    {
      next: {
        revalidate: 3600, // Regenerate every hour
        tags: [`page:${params.slug}`]
      }
    }
  );
  
  return <PageComponent page={page} />;
}
```

#### Server-Side Rendering (SSR)

```typescript
// SSR for dynamic content
export default async function DynamicPage({ searchParams }: {
  searchParams: { q?: string }
}) {
  const { data: results } = await loadQuery(
    `*[_type in ["post", "page"] && title match $query] {
      title,
      "slug": slug.current,
      _type
    }`,
    { query: `${searchParams.q}*` },
    {
      next: { revalidate: 0 } // Always fresh data
    }
  );
  
  return <SearchResults results={results} />;
}

// Force SSR
export const dynamic = 'force-dynamic';
```

### On-Demand Revalidation

```typescript
// API route for webhook revalidation
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate webhook (implementation depends on your setup)
  const isValid = validateWebhook(body, request.headers);
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Revalidate based on document type
    if (body._type === 'page') {
      revalidateTag(`page:${body.slug.current}`);
      revalidateTag('pages'); // Revalidate page lists
    } else if (body._type === 'post') {
      revalidateTag(`post:${body.slug.current}`);
      revalidateTag('posts');
    } else if (body._type.endsWith('Settings')) {
      revalidateTag('settings');
    }
    
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
```

### Structure Loaders

Convenient methods for common document types:

```typescript
import { 
  loadEntity, 
  loadSettings, 
  loadContentType,
  loadTaxonomy 
} from '@webicient/sanity-kit/query';

// Load homepage entity
export default async function Homepage() {
  const home = await loadEntity('home');
  const settings = await loadSettings();
  
  return (
    <div>
      <h1>{home?.title}</h1>
      <p>Site: {settings.generalSettings?.siteTitle}</p>
    </div>
  );
}

// Load blog post
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await loadContentType('post', params.slug);
  
  if (!post) notFound();
  
  return <ArticleComponent post={post} />;
}
```

## Client-Side Data Fetching

### useQuery Hook

```typescript
'use client';
import { useQuery } from '@webicient/sanity-kit/query';
import { useState } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: results, loading, error } = useQuery(
    searchTerm ? `
      *[_type in ["post", "page"] && title match $searchQuery] {
        title,
        "slug": slug.current,
        _type,
        excerpt
      }
    ` : null, // Only query when there's a search term
    { searchQuery: `${searchTerm}*` }
  );
  
  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error.message}</div>}
      
      {results && (
        <div>
          {results.map((result) => (
            <div key={result.slug}>
              <h3>{result.title}</h3>
              <span className="badge">{result._type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Conditional Queries

```typescript
function ConditionalDataComponent({ userId }: { userId?: string }) {
  // Only fetch user data if userId is provided
  const { data: user, loading } = useQuery(
    userId ? `*[_type == "user" && _id == $userId][0]` : null,
    { userId }
  );
  
  const { data: publicData } = useQuery(`
    *[_type == "public"] {
      title,
      content
    }
  `);
  
  return (
    <div>
      <PublicContent data={publicData} />
      {userId && (
        <UserContent user={user} loading={loading} />
      )}
    </div>
  );
}
```

### Optimistic Updates

```typescript
'use client';
import { useQuery } from '@webicient/sanity-kit/query';
import { useState, useTransition } from 'react';

function CommentsList({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticComments, setOptimisticComments] = useState([]);
  
  const { data: comments, loading } = useQuery(`
    *[_type == "comment" && post._ref == $postId] | order(_createdAt desc) {
      _id,
      text,
      author,
      _createdAt
    }
  `, { postId });
  
  const addComment = (text: string) => {
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      text,
      author: 'You',
      _createdAt: new Date().toISOString()
    };
    
    setOptimisticComments(prev => [optimisticComment, ...prev]);
    
    startTransition(async () => {
      try {
        await submitComment(postId, text);
        // Refresh data after successful submission
        setOptimisticComments([]);
      } catch (error) {
        // Remove optimistic comment on error
        setOptimisticComments([]);
      }
    });
  };
  
  const displayComments = [...optimisticComments, ...(comments || [])];
  
  return (
    <div>
      {displayComments.map((comment) => (
        <div key={comment._id} className={isPending ? 'opacity-50' : ''}>
          <p>{comment.text}</p>
          <small>{comment.author} - {comment._createdAt}</small>
        </div>
      ))}
    </div>
  );
}
```

## Hybrid Data Fetching

### Server + Client Combination

```typescript
// Server component with initial data
export default async function HybridPage() {
  // Server-side: Load initial content
  const initialPosts = await loadQuery(`
    *[_type == "post"] | order(publishedAt desc) [0...5] {
      title,
      "slug": slug.current,
      publishedAt
    }
  `);
  
  return (
    <div>
      <h1>Latest Posts</h1>
      <PostsList initialPosts={initialPosts} />
    </div>
  );
}

// Client component with incremental loading
'use client';
function PostsList({ initialPosts }: { initialPosts: any[] }) {
  const [offset, setOffset] = useState(5);
  const [allPosts, setAllPosts] = useState(initialPosts);
  
  const { data: morePosts, loading } = useQuery(
    offset > 5 ? `
      *[_type == "post"] | order(publishedAt desc) [${offset}...${offset + 5}] {
        title,
        "slug": slug.current,
        publishedAt
      }
    ` : null
  );
  
  useEffect(() => {
    if (morePosts) {
      setAllPosts(prev => [...prev, ...morePosts]);
    }
  }, [morePosts]);
  
  const loadMore = () => {
    setOffset(prev => prev + 5);
  };
  
  return (
    <div>
      {allPosts.map((post) => (
        <PostItem key={post.slug} post={post} />
      ))}
      
      <button onClick={loadMore} disabled={loading}>
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}
```

## Error Handling and Loading States

### Comprehensive Error Handling

```typescript
'use client';
import { useQuery } from '@webicient/sanity-kit/query';
import { ErrorBoundary } from 'react-error-boundary';

function DataComponent() {
  const { data, loading, error } = useQuery(`
    *[_type == "post"] {
      title,
      "slug": slug.current
    }
  `);
  
  if (loading) {
    return <LoadingSkeleton />;
  }
  
  if (error) {
    return <ErrorFallback error={error} />;
  }
  
  if (!data || data.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div>
      {data.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}

// Wrap with error boundary
export default function PageWithErrorBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DataComponent />
    </ErrorBoundary>
  );
}
```

### Loading Skeletons

```typescript
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-4 p-4 border rounded">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}
```

## Performance Optimization

### Query Deduplication

```typescript
// Multiple components can use the same query - automatically deduped
function Header() {
  const { data: settings } = useQuery(`
    *[_type == "generalSettings"][0] {
      siteTitle,
      logo
    }
  `);
  
  return <header>{settings?.siteTitle}</header>;
}

function Footer() {
  const { data: settings } = useQuery(`
    *[_type == "generalSettings"][0] {
      siteTitle,
      logo
    }
  `);
  
  return <footer>{settings?.siteTitle}</footer>;
}
```

### Pagination

```typescript
function PaginatedPosts() {
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { data: posts, loading } = useQuery(`
    *[_type == "post"] | order(publishedAt desc) [${page * limit}...${(page + 1) * limit - 1}] {
      title,
      "slug": slug.current,
      publishedAt,
      excerpt
    }
  `);
  
  const { data: total } = useQuery(`count(*[_type == "post"])`);
  
  const totalPages = Math.ceil((total || 0) / limit);
  
  return (
    <div>
      <PostGrid posts={posts} loading={loading} />
      
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Infinite Scrolling

```typescript
'use client';
import { useQuery } from '@webicient/sanity-kit/query';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';

function InfinitePostsList() {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  
  const { data: newPosts, loading } = useQuery(
    `*[_type == "post"] | order(publishedAt desc) [${offset}...${offset + limit - 1}] {
      title,
      "slug": slug.current,
      publishedAt,
      excerpt
    }`
  );
  
  useEffect(() => {
    if (newPosts) {
      setPosts(prev => offset === 0 ? newPosts : [...prev, ...newPosts]);
    }
  }, [newPosts, offset]);
  
  const loadMore = useCallback(() => {
    if (!loading) {
      setOffset(prev => prev + limit);
    }
  }, [loading, limit]);
  
  useInfiniteScroll(loadMore);
  
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={`${post.slug}-${posts.indexOf(post)}`} post={post} />
      ))}
      {loading && <LoadingSpinner />}
    </div>
  );
}
```

## Advanced Patterns

### Real-time Updates

```typescript
'use client';
import { useQuery } from '@webicient/sanity-kit/query';
import { useEffect } from 'react';

function RealTimeComponent() {
  const { data, loading, refetch } = useQuery(`
    *[_type == "liveData"] | order(_updatedAt desc) {
      title,
      value,
      _updatedAt
    }
  `);
  
  useEffect(() => {
    // Set up real-time updates (WebSocket, Server-Sent Events, etc.)
    const eventSource = new EventSource('/api/live-updates');
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'liveData') {
        refetch();
      }
    };
    
    return () => eventSource.close();
  }, [refetch]);
  
  return (
    <div>
      {data?.map((item) => (
        <div key={item._updatedAt}>
          <h3>{item.title}</h3>
          <p>Value: {item.value}</p>
          <small>Updated: {new Date(item._updatedAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

### Background Sync

```typescript
'use client';
import { useQuery } from '@webicient/sanity-kit/query';
import { useInterval } from './hooks/useInterval';

function BackgroundSyncComponent() {
  const { data, loading, refetch } = useQuery(`
    *[_type == "syncData"] {
      title,
      status,
      lastSync
    }
  `);
  
  // Sync every 30 seconds in the background
  useInterval(() => {
    if (!loading) {
      refetch();
    }
  }, 30000);
  
  return (
    <div>
      {data?.map((item) => (
        <SyncStatusCard key={item.title} item={item} />
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Choose the Right Fetching Strategy

- **SSG**: For static content that changes infrequently
- **ISR**: For content that updates regularly but can be cached
- **SSR**: For highly dynamic, user-specific content
- **Client-side**: For interactive features and real-time updates

### 2. Implement Proper Error Boundaries

```typescript
function App() {
  return (
    <ErrorBoundary>
      <DataComponent />
    </ErrorBoundary>
  );
}
```

### 3. Use Loading States

Always provide feedback during data fetching:

```typescript
if (loading) return <Skeleton />;
if (error) return <ErrorMessage />;
if (!data) return <EmptyState />;
```

### 4. Optimize Query Performance

- Use specific projections
- Implement pagination for large datasets
- Cache frequently accessed data
- Use proper revalidation strategies

### 5. Handle Edge Cases

```typescript
const { data, loading, error } = useQuery(query);

// Handle all possible states
if (loading) return <Loading />;
if (error) return <Error error={error} />;
if (!data) return <NoData />;
if (data.length === 0) return <EmptyList />;

return <DataDisplay data={data} />;
```

## Related Documentation

- [Queries](./queries.md) - GROQ query patterns
- [API Reference](./api-reference.md) - Data fetching API reference
- [Components](./components.md) - Using data in components
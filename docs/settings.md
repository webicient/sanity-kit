# Settings Management

Complete guide to the built-in settings system in @webicient/sanity-kit.

## Overview

@webicient/sanity-kit provides a comprehensive settings management system with pre-configured setting schemas for common website needs. All settings are singleton documents grouped under the "Settings" menu in Sanity Studio.

## Built-in Settings

### General Settings

Basic site information and configuration.

```typescript
export const generalSettings = defineSetting({
  name: "generalSettings",
  title: "General",
  icon: CogIcon,
  fields: [
    {
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      validation: (rule) => rule.required(),
    },
    {
      name: "domain",
      title: "Domain",
      type: "string",
      validation: (rule) =>
        rule.custom((value?: string) => {
          return isValidDomain(value) ? true : "Invalid domain";
        }),
    },
    {
      name: "searchEngineVisibility",
      title: "Search Engine Visibility",
      type: "boolean",
      description: "Discourage search engines from indexing this site.",
    },
  ],
});
```

**Fields:**

- `siteTitle` (string, required): The main site title
- `domain` (string): Site domain with validation
- `searchEngineVisibility` (boolean): Search engine indexing preference

### Social Media Settings

Social media platform links and profiles.

```typescript
export const socialSettings = defineSetting({
  name: "socialMediaSettings",
  title: "Social Media",
  icon: EyeOpenIcon,
  fields: [
    { name: "facebook", title: "Facebook", type: "url" },
    { name: "twitter", title: "Twitter", type: "url" },
    { name: "instagram", title: "Instagram", type: "url" },
    { name: "linkedin", title: "LinkedIn", type: "url" },
    { name: "youtube", title: "YouTube", type: "url" },
  ],
});
```

**Supported Platforms:**

- Facebook
- Twitter
- Instagram
- LinkedIn
- YouTube

### SEO Settings

Default SEO metadata and configuration.

```typescript
export const seoSettings = defineSetting({
  name: "seoSettings",
  title: "SEO",
  icon: SearchIcon,
  translate: true, // Supports multiple languages
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "description", title: "Description", type: "text" },
    { name: "image", title: "Image", type: "image" },
  ],
});
```

**Fields:**

- `title` (string): Default site title for meta tags
- `description` (text): Default meta description
- `image` (image): Default social sharing image

### Integration Settings

Third-party service integrations.

```typescript
export const integrationSettings = defineSetting({
  name: "integrationSettings",
  title: "Integrations",
  icon: PackageIcon,
  fields: [
    {
      name: "gtmId",
      title: "Google Tag Manager ID",
      type: "string",
      description:
        "The tag manager ID for Google Tag Manager. Formatted as `GTM-XXXXXX`",
    },
    {
      name: "markerId",
      title: "Marker ID",
      type: "string",
      description: "Integration ID for marker.io",
    },
  ],
});
```

**Supported Integrations:**

- **Google Tag Manager**: For analytics and tracking
- **Marker.io**: For user feedback and bug reporting

### Scripts Settings

Custom script injection for different page sections.

```typescript
export const scriptsSettings = defineSetting({
  name: "scriptsSettings",
  title: "Scripts",
  icon: CodeBlockIcon,
  fields: [
    {
      name: "head",
      title: "Head",
      type: "text",
      description: "Scripts to include in the head of the document.",
    },
    {
      name: "preBody",
      title: "Pre Body",
      type: "text",
      description: "Scripts to include at the beginning of the body.",
    },
    {
      name: "postBody",
      title: "Post Body",
      type: "text",
      description: "Scripts to include at the end of the body.",
    },
  ],
});
```

**Script Locations:**

- `head`: Scripts in the `<head>` section
- `preBody`: Scripts at the start of `<body>`
- `postBody`: Scripts before closing `</body>`

### Advanced Settings

Technical configuration options.

```typescript
export const advancedSettings = defineSetting({
  name: "advancedSettings",
  title: "Advanced",
  icon: JoystickIcon,
  fields: [
    // Advanced configuration fields
  ],
});
```

## Using Settings in Your Application

### Loading All Settings

```typescript
import { loadSettings } from "@webicient/sanity-kit/query";

// Load all settings
const settings = await loadSettings();

// Access specific settings
const siteTitle = settings.generalSettings?.siteTitle;
const gtmId = settings.integrationSettings?.gtmId;
const socialLinks = settings.socialMediaSettings;
```

### Settings in KitProvider

The KitProvider automatically provides settings context to your application:

```typescript
// app/layout.tsx
import { KitProvider } from '@webicient/sanity-kit/provider';
import { loadSettings } from '@webicient/sanity-kit/query';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

### Accessing Settings with useKit Hook

```typescript
'use client';
import { useKit } from '@webicient/sanity-kit/provider';

export default function Header() {
  const { settings } = useKit();

  return (
    <header>
      <h1>{settings.generalSettings?.siteTitle}</h1>

      <nav>
        {settings.socialMediaSettings?.facebook && (
          <a href={settings.socialMediaSettings.facebook}>Facebook</a>
        )}
        {settings.socialMediaSettings?.twitter && (
          <a href={settings.socialMediaSettings.twitter}>Twitter</a>
        )}
      </nav>
    </header>
  );
}
```

## Integration Features

### Google Tag Manager Integration

The KitProvider automatically integrates Google Tag Manager when configured:

```typescript
// Automatically rendered when gtmId is set
{integrationSettings?.gtmId && (
  <GoogleTagManager gtmId={integrationSettings.gtmId} />
)}
```

### Custom Scripts Injection

Scripts settings are automatically injected by KitProvider:

```typescript
// Head scripts
{scriptsSettings?.head && (
  <Script
    id="headScript"
    dangerouslySetInnerHTML={{ __html: scriptsSettings.head }}
  />
)}

// Pre-body scripts
{scriptsSettings?.preBody && (
  <script
    id="preBodyScript"
    dangerouslySetInnerHTML={{ __html: scriptsSettings.preBody }}
  />
)}

// Post-body scripts
{scriptsSettings?.postBody && (
  <script
    id="postBodyScript"
    dangerouslySetInnerHTML={{ __html: scriptsSettings.postBody }}
  />
)}
```

### Marker.io Integration

Feedback widget automatically loads when marker ID is configured:

```typescript
{integrationSettings?.markerId && (
  <Script
    id="marker-io"
    dangerouslySetInnerHTML={{
      __html: `window.markerConfig = {
        project: '${integrationSettings.markerId}',
        source: 'snippet'
      };`
    }}
  />
)}
```

## Creating Custom Settings

### Define Custom Setting Schema

```typescript
import { defineSetting } from "@webicient/sanity-kit";
import { defineField } from "sanity";

const shopSettings = defineSetting({
  name: "shopSettings",
  title: "Shop Settings",
  fields: [
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: {
        list: [
          { title: "US Dollar", value: "USD" },
          { title: "Euro", value: "EUR" },
          { title: "British Pound", value: "GBP" },
        ],
      },
      initialValue: "USD",
    }),
    defineField({
      name: "taxRate",
      title: "Tax Rate (%)",
      type: "number",
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: "shippingRates",
      title: "Shipping Rates",
      type: "array",
      of: [
        defineField({
          name: "rate",
          type: "object",
          fields: [
            defineField({
              name: "region",
              title: "Region",
              type: "string",
            }),
            defineField({
              name: "cost",
              title: "Cost",
              type: "number",
            }),
          ],
        }),
      ],
    }),
  ],
});
```

### Add to Kit Configuration

```typescript
// kit.config.ts
export default kitConfig({
  schema: {
    settings: [
      shopSettings, // Add your custom setting
    ],
  },
});
```

### Access Custom Settings

```typescript
const settings = await loadSettings();
const currency = settings.shopSettings?.currency;
const taxRate = settings.shopSettings?.taxRate;
```

## Multi-language Settings

Settings can be translated by setting `translate: true`:

```typescript
const multiLangSettings = defineSetting({
  name: "websiteContent",
  title: "Website Content",
  translate: true, // Enable translation
  fields: [
    defineField({
      name: "welcomeMessage",
      title: "Welcome Message",
      type: "string",
    }),
    defineField({
      name: "contactInfo",
      title: "Contact Information",
      type: "text",
    }),
  ],
});

// Load with specific language
const settings = await loadSettings("es"); // Spanish
const welcomeMessage = settings.websiteContent?.welcomeMessage;
```

## Settings Validation

### Custom Validation Rules

```typescript
const emailSettings = defineSetting({
  name: "emailSettings",
  title: "Email Settings",
  fields: [
    defineField({
      name: "fromEmail",
      title: "From Email",
      type: "string",
      validation: (Rule) =>
        Rule.required().email().error("Please enter a valid email address"),
    }),
    defineField({
      name: "smtpPort",
      title: "SMTP Port",
      type: "number",
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1)
          .max(65535)
          .error("Port must be between 1 and 65535"),
    }),
  ],
});
```

### Conditional Field Display

```typescript
const apiSettings = defineSetting({
  name: "apiSettings",
  title: "API Settings",
  fields: [
    defineField({
      name: "apiEnabled",
      title: "Enable API",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "apiKey",
      title: "API Key",
      type: "string",
      hidden: ({ parent }) => !parent?.apiEnabled, // Hide if API disabled
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.apiEnabled && !value) {
            return "API Key is required when API is enabled";
          }
          return true;
        }),
    }),
  ],
});
```

## Settings Query Patterns

### Load Specific Settings

```typescript
// Load only specific settings
const specificSettings = await loadQuery(`{
  "general": *[_type == "generalSettings"][0],
  "seo": *[_type == "seoSettings"][0]
}`);
```

### Settings with Fallbacks

```typescript
const settingsWithFallbacks = await loadQuery(`{
  "siteTitle": coalesce(
    *[_type == "generalSettings"][0].siteTitle,
    "Default Site Title"
  ),
  "description": coalesce(
    *[_type == "seoSettings"][0].description,  
    "Default description"
  )
}`);
```

## Best Practices

### 1. Group Related Settings

```typescript
// Good: Group related settings together
const ecommerceSettings = defineSetting({
  name: "ecommerce",
  title: "E-commerce",
  fields: [
    // All e-commerce related settings
  ],
});

// Avoid: Scattered individual settings
```

### 2. Provide Helpful Descriptions

```typescript
defineField({
  name: "gtmId",
  title: "Google Tag Manager ID",
  type: "string",
  description: "Find this in your GTM dashboard. Format: GTM-XXXXXXX",
  placeholder: "GTM-XXXXXXX",
});
```

### 3. Use Validation for Critical Fields

```typescript
defineField({
  name: "apiKey",
  title: "API Key",
  type: "string",
  validation: (Rule) =>
    Rule.required().min(32).error("API key must be at least 32 characters"),
});
```

### 4. Consider Default Values

```typescript
defineField({
  name: "itemsPerPage",
  title: "Items Per Page",
  type: "number",
  initialValue: 10,
  validation: (Rule) => Rule.min(1).max(100),
});
```

### 5. Use Environment-based Settings

```typescript
// Different settings for different environments
const isDev = process.env.NODE_ENV === "development";

const analyticsSettings = defineSetting({
  name: "analytics",
  fields: [
    defineField({
      name: "debugMode",
      title: "Debug Mode",
      type: "boolean",
      initialValue: isDev,
      readOnly: !isDev,
    }),
  ],
});
```

## Related Documentation

- [Configuration](./configuration.md) - Adding custom settings
- [Components](./components.md) - Using settings in components
- [API Reference](./api-reference.md) - Settings API documentation

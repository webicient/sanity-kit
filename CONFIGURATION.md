# Sanity Kit Configuration

## Overview

The Sanity Kit now uses a `sanity.kit.ts` file to configure your project instead of passing configuration directly to the `kitConfig` function.

## Setup

1. Create a `sanity.kit.ts` file in your project root or studio directory:

```typescript
import { type KitConfig } from "@webicient/sanity-kit";
import cards from "@/modules/cards";
import pages from "@/modules/pages";
import service from "@/schema/service";
import { customStructure } from "@/schema/structure";

const config: KitConfig = {
  languages: [
    { id: "sv", title: "Swedish", isDefault: true },
    { id: "en", title: "English" },
  ],
  schema: {
    modules: [cards, pages],
    contentTypes: [service],
    structures: [customStructure],
  },
};

export default config;
```

2. Use the `sanityKit` plugin in your `sanity.config.ts`:

```typescript
import { defineConfig } from 'sanity';
import { sanityKit } from '@webicient/sanity-kit';

export default defineConfig({
  plugins: [sanityKit()],
  // ... other config
});
```

## File Locations

The configuration system will look for `sanity.kit.ts` in the following locations (in order):
1. Project root (`./sanity.kit.ts`)
2. Studio directory (`./studio/sanity.kit.ts`)
3. Source directory (`./src/sanity.kit.ts`)

## Migration from Old Approach

If you were previously using the `kitConfig` function directly:

**Before:**
```typescript
import { kitConfig } from "@webicient/sanity-kit";

export default kitConfig({
  languages: [...],
  schema: {...}
});
```

**After:**
```typescript
// sanity.kit.ts
import { type KitConfig } from "@webicient/sanity-kit";

const config: KitConfig = {
  languages: [...],
  schema: {...}
};

export default config;
```

## Benefits

- **Separation of Concerns**: Configuration is now separate from the plugin initialization
- **Better IDE Support**: TypeScript can better infer types from the configuration file
- **Easier Testing**: Configuration can be loaded independently for testing
- **Cleaner API**: The plugin no longer requires configuration parameters 

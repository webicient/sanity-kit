import { kitConfig, sanityKit, KitConfig } from "../src/index";

// Since kitConfig is now async and sanityKit is a plugin factory,
// we don't need to call them in the test setup
// The actual configuration will be loaded when the plugin is used

// For testing purposes, we can export a mock config if needed
export const mockConfig: KitConfig = {
  languages: [
    { id: "sv", title: "Swedish", isDefault: true },
    { id: "en", title: "English" },
  ],
};

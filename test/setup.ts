import { kitConfig, sanityKit, KitConfig } from "../src/index";

sanityKit(
  kitConfig({
    languages: [
      { id: "sv", title: "Swedish", isDefault: true },
      { id: "en", title: "English" },
    ],
  } as KitConfig),
);

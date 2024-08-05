import { describe, it, expect } from "vitest";
import { parentQueryField } from "../../src/queries/hierarchy";

describe("queries: hierarchy", () => {
  describe("parentQueryField", () => {
    it("should generate the correct query for single depth", () => {
      const expectedQuery = `"parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug, "parent": parent->{ _type, _id, title, slug}}}}}}}}}}`;
      const actualQuery = parentQueryField();
      expect(actualQuery).toBe(expectedQuery);
    });

    it("should generate the correct query with language", () => {
      const language = "en";
      const expectedQuery = `"parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}, "parent": parent->{ _type, _id, title, slug.${language}}}}}}}}}}}`;
      const actualQuery = parentQueryField(language);
      expect(actualQuery).toBe(expectedQuery);
    });
  });
});

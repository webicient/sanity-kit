import { describe, it, expect } from "vitest";
import {
  getSlugQueryFilter,
  getContentTypeQuery,
} from "../../src/queries/contentType";
import { clean } from "../../src/queries/projection";
import { parentQueryField } from "../../src/queries/hierarchy";

describe("queries: contentType", () => {
  describe("getSlugQueryFilter", () => {
    it("should generate the correct query for single slug", () => {
      const slug = ["a"];
      const expectedQuery = `&& slug.current == "${slug[0]}"`;
      const actualQuery = getSlugQueryFilter(slug);
      expect(actualQuery).toBe(expectedQuery);
    });

    it("should generate the correct query for multiple slugs", () => {
      const slug = ["a", "b", "c"];
      const expectedQuery = `&& slug.current == "${slug[0]}" && parent->slug.current == "${slug[1]}" && parent->parent->slug.current == "${slug[2]}"`;
      const actualQuery = getSlugQueryFilter(slug);
      expect(actualQuery).toBe(expectedQuery);
    });

    it("should generate the correct query for single slug with language", () => {
      const slug = ["a"];
      const language = "en";
      const expectedQuery = `&& slug.en.current == "${slug[0]}"`;
      const actualQuery = getSlugQueryFilter(slug, language);
      expect(actualQuery).toBe(expectedQuery);
    });

    it("should generate the correct query for multiple slugs with language", () => {
      const slug = ["a", "b", "c"];
      const language = "en";
      const expectedQuery = `&& slug.en.current == "${slug[0]}" && parent->slug.en.current == "${slug[1]}" && parent->parent->slug.en.current == "${slug[2]}"`;
      const actualQuery = getSlugQueryFilter(slug, language);
      expect(actualQuery).toBe(expectedQuery);
    });
  });

  describe("getContentTypeQuery", () => {
    it("should return the correct query for single slug", () => {
      const name = "page";
      const slug = ["a"];
      const expectedQuery = `*[_type=="page"&&slug.current=="a"][0]{_id,_type,"title":title,"slug":slug,"modules":modules[]{...},"seo":seo,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug}}}}}}}}}}}`;
      const actualQuery = getContentTypeQuery(name, slug);
      expect(clean(actualQuery)).toBe(expectedQuery);
    });

    it("should return the correct query for multiple slugs", () => {
      const name = "page";
      const slug = ["a", "b", "c"];
      const expectedQuery = `*[_type=="page"&&slug.current=="c"&&parent->slug.current=="b"&&parent->parent->slug.current=="a"][0]{_id,_type,"title":title,"slug":slug,"modules":modules[]{...},"seo":seo,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug,"parent":parent->{_type,_id,title,slug}}}}}}}}}}}`;
      const actualQuery = getContentTypeQuery(name, slug);
      expect(clean(actualQuery)).toBe(expectedQuery);
    });

    it("should return the correct query for single slug with language", () => {
      const name = "page";
      const slug = ["a"];
      const language = "en";
      const expectedQuery = `*[_type=="page"&&slug.en.current=="a"][0]{_id,_type,"title":title.en,"slug":slug.en,"modules":modules.en[]{...},"seo":seo.en,${parentQueryField(language)}}`;
      const actualQuery = getContentTypeQuery(name, slug, language);
      expect(clean(actualQuery)).toBe(clean(expectedQuery));
    });

    it("should return the correct query for multiple slugs with language", () => {
      const name = "page";
      const slug = ["a", "b", "c"];
      const language = "en";
      const expectedQuery = `*[_type=="page"&&slug.en.current=="c"&&parent->slug.en.current=="b"&&parent->parent->slug.en.current=="a"][0]{_id,_type,"title":title.en,"slug":slug.en,"modules":modules.en[]{...},"seo":seo.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en,"parent":parent->{_type,_id,title,slug.en}}}}}}}}}}}`;
      const actualQuery = getContentTypeQuery(name, slug, language);
      expect(clean(actualQuery)).toBe(clean(expectedQuery));
    });
  });
});

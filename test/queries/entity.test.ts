import { describe, expect, it } from "vitest";
import { getEntityQuery } from "../../src/queries/entity";
import { baseQueryFields } from "../../src/queries/document";
import { supportsQueryField } from "../../src/queries/supports";
import { clean } from "../../src/queries/projection";

describe("getEntityQuery", () => {
  it("should return the correct query without projection", () => {
    const name = "example";
    const language = "en";
    const expectedQuery = `*[_id == $type][0]{${baseQueryFields},${supportsQueryField(name, language)}}`;
    const query = getEntityQuery(name, language);
    expect(clean(query)).toBe(clean(expectedQuery));
  });

  it("should return the correct query with projection", () => {
    const name = "example";
    const language = "en";
    const projection = `{ _id, title }`;
    const expectedQuery = `*[_id==$type][0]{_id,title,_id,_type,}`;
    const query: string = getEntityQuery(name, language, projection);
    expect(clean(query)).toBe(clean(expectedQuery));
  });
});

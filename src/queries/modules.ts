import { getModules } from "../utils/config";
import { isValidStatement } from "./projection";

/**
 * Composes a query string by joining the queries of all modules.
 *
 * @returns The composed query string.
 */
export function modulesQueryField(language?: string): string {
  const modulesQueries = getModules()
    .map((module) => {
      let query = module.query ? module.query(language) : null;

      if (!query) {
        return null;
      }

      if (!isValidStatement(query)) {
        throw new Error(
          `Invalid GROQ query format for module "${module.name}".`,
        );
      }

      return `_type == "${module.name}" => ${query}`;
    })
    .filter(Boolean);

  modulesQueries.push(`_type == "kit.preset" => @->{
    "data": modules[] {
      ...,
      ${modulesQueries.join(",")}
    }
  }`);

  let query = `"modules": `;

  if (language) {
    return (query += `modules.${language}[] {${["...", ...modulesQueries].join(",")}}`);
  }

  return `"modules": modules[] {${["...", ...modulesQueries].join(",")}}`;
}

import { type StructureResolver } from "sanity/structure";
import { getEntities } from "../../utils/config.js";

const UNLISTED_DOCUMENTS = [{ name: "media.tag" }];

export const structure = (): StructureResolver => {
  return (S) => {
    const entities = getEntities().map(({ name, title, icon }) =>
      S.listItem()
        .title(title)
        .icon(icon)
        .child(S.editor().id(name).schemaType(name).documentId(name)),
    );

    const allSchemaNames = [...getEntities(), ...UNLISTED_DOCUMENTS].map(
      ({ name }) => name,
    );

    const defaultListItems = S.documentTypeListItems().filter(
      (listItem) => !allSchemaNames.find((name) => name === listItem.getId()),
    );

    return S.list()
      .title("Structure")
      .items([...entities, S.divider(), ...defaultListItems]);
  };
};

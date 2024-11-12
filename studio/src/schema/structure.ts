import { defineStructure } from "@webicient/sanity-kit";

export const customStructure = defineStructure({
  builder: (S) => {
    return S.listItem()
      .title("Custom Structure")
      .child(
        S.documentList().title("Custom Structure").filter("_type == 'service'"),
      );
  },
});

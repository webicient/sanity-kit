/* eslint-disable @typescript-eslint/no-unsafe-member-access -- Temporarily ignored. */
/* eslint-disable @typescript-eslint/no-explicit-any -- Temporarily ignored. */
/* eslint-disable @typescript-eslint/no-unsafe-call -- Temporarily ignored. */
/* eslint-disable @typescript-eslint/no-unsafe-return -- Temporarily ignored. */
import { definePlugin } from "sanity";
import { getEntities } from "../../utils/config";

export const singleton = definePlugin(() => {
  const entities = getEntities().map(({ name }) => name);

  return {
    name: "@webicient/singleton",
    document: {
      newDocumentOptions: (prev: any, { creationContext }: any) => {
        if (creationContext.type === "global") {
          return prev.filter(
            (templateItem: { templateId: string }) =>
              !entities.includes(templateItem.templateId),
          );
        }
        return prev;
      },
      actions: (prev: any, { schemaType }: { schemaType: string }) => {
        if (entities.includes(schemaType)) {
          prev.filter(({ action }: any) => action !== "duplicate");
        }
        return prev;
      },
    },
  };
});

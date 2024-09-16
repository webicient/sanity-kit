import { ComponentType, Fragment } from "react";
import { getModules } from "../utils/config";
import { ModuleErrorBoundary } from "./ErrorBoundary";

type ModuleResolverProps = {
  data?: any[];
};

export const getBlock = (type: string): ComponentType<any> | null => {
  if (type === "kit.preset") {
    return ModuleResolver;
  }

  return getModules().find((module) => module.name === type)?.renderer || null;
};

export function ModuleResolver({
  data,
}: ModuleResolverProps): (JSX.Element | null)[] | null {
  if (!data || !Boolean(data.length)) {
    return null;
  }

  return data.map(({ _key, ...block }) => {
    const Block = getBlock(block._type);

    return Block ? (
      <ModuleErrorBoundary key={_key} moduleName={block._type}>
        <Block {...block} />
      </ModuleErrorBoundary>
    ) : null;
  });
}

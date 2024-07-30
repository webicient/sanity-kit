import { ComponentType, Fragment } from "react";
import { getModules } from "../utils/config";

type ModuleResolverProps = {
  data?: any[];
};

/**
 * Retrieves the component associated with the given type.
 *
 * @param type - The type of the component to retrieve.
 * @returns The component associated with the given type, or null if not found.
 */
export const getBlock = (type: string): ComponentType<any> | null => {
  return getModules().find((module) => module.name === type)?.renderer || null;
};

/**
 * Renders a module resolver component.
 *
 * @param {ModuleResolverProps} props - The component props.
 * @param {Array} props.data - The data to be resolved.
 * @returns {JSX.Element|null} The rendered module resolver component.
 */
export function ModuleResolver({ data }: ModuleResolverProps) {
  if (!data || !Boolean(data.length)) {
    return null;
  }

  return (
    <Fragment>
      {data.map(({ _key, ...block }) => {
        const Block = getBlock(block._type);
        return Block && <Block {...block} key={_key} />;
      })}
    </Fragment>
  );
}

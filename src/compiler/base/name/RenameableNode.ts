﻿import * as errors from "../../../errors";
import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { TypeGuards } from "../../../utils";
import { Node } from "../../common";
import { RenameOptions } from "../../tools";

export type RenameableNodeExtensionType = Node<ts.Node>;

export interface RenameableNode {
    /**
     * Renames the name of the node.
     * @param newName - New name.
     * @param options - Options for renaming.
     */
    rename(newName: string, options?: RenameOptions): this;
}

export function RenameableNode<T extends Constructor<RenameableNodeExtensionType>>(Base: T): Constructor<RenameableNode> & T {
    return class extends Base implements RenameableNode {
        rename(newName: string, options?: RenameOptions) {
            this.context.languageService.renameNode(getNodeToRename(this), newName, options);
            return this;

            function getNodeToRename(thisNode: Node) {
                if (TypeGuards.isIdentifier(thisNode))
                    return thisNode;
                else if ((thisNode as any).getNameNode != null) {
                    const node = (thisNode as any).getNameNode() as Node;
                    errors.throwIfNullOrUndefined(node, "Expected to find a name node when renaming.");
                    if (TypeGuards.isArrayBindingPattern(node) || TypeGuards.isObjectBindingPattern(node))
                        throw new errors.NotImplementedError(`Not implemented renameable scenario for ${node.getKindName()}.`);
                    return node;
                }
                else
                    throw new errors.NotImplementedError(`Not implemented renameable scenario for ${thisNode.getKindName()}`);
            }
        }
    };
}

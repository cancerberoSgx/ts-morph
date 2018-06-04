import { removeChildren, removeCommaSeparatedChild } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { NamedNode } from "../base";
import { Node } from "../common";
import { TypeNode } from "./TypeNode";

export const TypeParameterDeclarationBase = NamedNode(Node);
export class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
    /**
     * Gets the constraint node of the type parameter.
     */
    getConstraintNode(): TypeNode | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.constraint);
    }

    /**
     * Gets the default node of the type parameter.
     */
    getDefaultNode(): TypeNode | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.default);
    }

    /**
     * Removes this type parameter.
     */
    remove() {
        const parentSyntaxList = this.getParentSyntaxListOrThrow();
        const typeParameters = parentSyntaxList.getChildrenOfKind(SyntaxKind.TypeParameter);

        if (typeParameters.length === 1)
            removeAllTypeParameters();
        else
            removeCommaSeparatedChild(this);

        function removeAllTypeParameters() {
            const children = [
                parentSyntaxList.getPreviousSiblingIfKindOrThrow(SyntaxKind.LessThanToken),
                parentSyntaxList,
                parentSyntaxList.getNextSiblingIfKindOrThrow(SyntaxKind.GreaterThanToken)
            ];

            removeChildren({ children });
        }
    }
}

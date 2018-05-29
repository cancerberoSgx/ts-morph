import { ts } from "../../typescript";
import { MethodSignatureStructure } from "../../structures";
import { removeInterfaceMember } from "../../manipulation";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { PropertyNamedNode, QuestionTokenableNode, JSDocableNode, ChildOrderableNode, TypeParameteredNode, SignaturedDeclaration } from "../base";
import { TypeElement } from "./TypeElement";

export const MethodSignatureBase = ChildOrderableNode(JSDocableNode(QuestionTokenableNode(TypeParameteredNode(SignaturedDeclaration(PropertyNamedNode(TypeElement))))));
export class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<MethodSignatureStructure>) {
        callBaseFill(MethodSignatureBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this method signature.
     */
    remove() {
        removeInterfaceMember(this);
    }

    getStructure():MethodSignatureStructure {
        return {
            name: this.getName(),
            parameters: this.getParameters().map(param=>param.getStructure())
        }
    }
}

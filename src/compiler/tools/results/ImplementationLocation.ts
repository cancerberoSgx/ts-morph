import { GlobalContainer } from "../../../GlobalContainer";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { DocumentSpan } from "./DocumentSpan";

export class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: ts.ImplementationLocation) {
        super(global, compilerObject);
    }

    /**
     * Gets the kind.
     */
    getKind() {
        return this.compilerObject.kind;
    }

    /**
     * Gets the display parts.
     */
    @Memoize
    getDisplayParts() {
        return this.compilerObject.displayParts.map(p => this.global.compilerFactory.getSymbolDisplayPart(p));
    }
}

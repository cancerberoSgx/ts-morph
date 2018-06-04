import * as errors from "../../errors";
import { insertIntoParentTextRange, removeCommaSeparatedChild, replaceNodeText } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { TypeGuards } from "../../utils";
import { Node, Symbol } from "../common";

export class ExportSpecifier extends Node<ts.ExportSpecifier> {
    /**
     * Sets the name of what's being exported.
     */
    setName(name: string) {
        const nameNode = this.getNameNode();
        if (nameNode.getText() === name)
            return this;

        const start = nameNode.getStart();
        replaceNodeText({
            sourceFile: this.sourceFile,
            start,
            replacingLength: nameNode.getWidth(),
            newText: name
        });

        return this;
    }

    /**
     * Renames the name of what's being exported.
     */
    renameName(name: string) {
        this.getNameNode().rename(name);
        return this;
    }

    /**
     * Gets the name node of what's being exported.
     */
    getNameNode() {
        return this.getFirstChildByKindOrThrow(SyntaxKind.Identifier);
    }

    /**
     * Sets the alias for the name being exported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string) {
        let aliasIdentifier = this.getAliasIdentifier();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            const nameNode = this.getNameNode();
            insertIntoParentTextRange({
                insertPos: nameNode.getEnd(),
                parent: this,
                newText: ` as ${nameNode.getText()}`
            });
            aliasIdentifier = this.getAliasIdentifier()!;
        }
        aliasIdentifier.rename(alias);
        return this;
    }

    /**
     * Gets the alias identifier, if it exists.
     */
    getAliasIdentifier() {
        const asKeyword = this.getFirstChildByKind(SyntaxKind.AsKeyword);
        if (asKeyword == null)
            return undefined;
        const aliasIdentifier = asKeyword.getNextSibling();
        if (aliasIdentifier == null || !(TypeGuards.isIdentifier(aliasIdentifier)))
            return undefined;
        return aliasIdentifier;
    }

    /**
     * Gets the export declaration associated with this export specifier.
     */
    getExportDeclaration() {
        return this.getFirstAncestorByKindOrThrow(SyntaxKind.ExportDeclaration);
    }

    /**
     * Gets the local target symbol of the export specifier or throws if it doesn't exist.
     */
    getLocalTargetSymbolOrThrow() {
        return errors.throwIfNullOrUndefined(this.getLocalTargetSymbol(), `The export specifier's local target symbol was expected.`);
    }

    /**
     * Gets the local target symbol of the export specifier or undefined if it doesn't exist.
     */
    getLocalTargetSymbol(): Symbol | undefined {
        return this.global.typeChecker.getExportSpecifierLocalTargetSymbol(this);
    }

    /**
     * Gets all the declarations referenced by the export specifier.
     */
    getLocalTargetDeclarations(): Node[] {
        const symbol = this.getLocalTargetSymbol();
        return symbol == null ? [] : symbol.getDeclarations();
    }

    /**
     * Removes the export specifier.
     */
    remove() {
        const exportDeclaration = this.getExportDeclaration();
        const exports = exportDeclaration.getNamedExports();

        if (exports.length > 1)
            removeCommaSeparatedChild(this);
        else if (exportDeclaration.hasModuleSpecifier())
            exportDeclaration.toNamespaceExport();
        else
            exportDeclaration.remove();
    }
}

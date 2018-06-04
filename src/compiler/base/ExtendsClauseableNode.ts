import * as errors from "../../errors";
import { getNodeOrNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, verifyAndGetIndex } from "../../manipulation";
import { CommaSeparatedStructuresPrinter, StringStructurePrinter } from "../../structurePrinters";
import { ExtendsClauseableNodeStructure } from "../../structures";
import { Constructor } from "../../types";
import { SyntaxKind } from "../../typescript";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { ExpressionWithTypeArguments } from "../type/ExpressionWithTypeArguments";
import { HeritageClauseableNode } from "./HeritageClauseableNode";

export type ExtendsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export interface ExtendsClauseableNode {
    /**
     * Gets the extends clauses.
     */
    getExtends(): ExpressionWithTypeArguments[];
    /**
     * Adds multiple extends clauses.
     * @param texts - Texts to add for the extends clause.
     */
    addExtends(texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Adds an extends clause.
     * @param text - Text to add for the extends clause.
     */
    addExtends(text: string): ExpressionWithTypeArguments;
    /**
     * Inserts multiple extends clauses.
     * @param texts - Texts to insert for the extends clause.
     */
    insertExtends(index: number, texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Inserts an extends clause.
     * @param text - Text to insert for the extends clause.
     */
    insertExtends(index: number, text: string): ExpressionWithTypeArguments;
    /**
     * Removes the extends at the specified index.
     * @param index - Index to remove.
     */
    removeExtends(index: number): this;
    /**
     * Removes the specified extends.
     * @param extendsNode - Node of the extend to remove.
     */
    removeExtends(extendsNode: ExpressionWithTypeArguments): this;
}

export function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T {
    return class extends Base implements ExtendsClauseableNode {
        getExtends(): ExpressionWithTypeArguments[] {
            const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
            return extendsClause == null ? [] : extendsClause.getTypeNodes();
        }

        addExtends(texts: string[]): ExpressionWithTypeArguments[];
        addExtends(text: string): ExpressionWithTypeArguments;
        addExtends(text: string | string[]): ExpressionWithTypeArguments[] | ExpressionWithTypeArguments {
            return this.insertExtends(this.getExtends().length, text as any);
        }

        insertExtends(index: number, texts: string[]): ExpressionWithTypeArguments[];
        insertExtends(index: number, text: string): ExpressionWithTypeArguments;
        insertExtends(index: number, texts: string | string[]): ExpressionWithTypeArguments[] | ExpressionWithTypeArguments {
            const length = texts instanceof Array ? texts.length : 0;
            if (typeof texts === "string") {
                errors.throwIfNotStringOrWhitespace(texts, nameof(texts));
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }

            const writer = this.getWriterWithQueuedChildIndentation();
            const structurePrinter = new CommaSeparatedStructuresPrinter(new StringStructurePrinter());

            structurePrinter.printText(writer, texts);

            const extendsTypes = this.getExtends();
            index = verifyAndGetIndex(index, extendsTypes.length);

            if (extendsTypes.length > 0) {
                const extendsClause = this.getHeritageClauseByKindOrThrow(SyntaxKind.ExtendsKeyword);
                insertIntoCommaSeparatedNodes({
                    parent: extendsClause.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                    currentNodes: extendsTypes,
                    insertIndex: index,
                    newText: writer.toString()
                });
                return getNodeOrNodesToReturn(this.getExtends(), index, length);
            }

            const openBraceToken = this.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[openBraceStart - 1]);
            let insertText = `extends ${writer.toString()} `;
            if (!isLastSpace)
                insertText = " " + insertText;

            insertIntoParentTextRange({
                parent: this,
                insertPos: openBraceStart,
                newText: insertText
            });

            return getNodeOrNodesToReturn(this.getExtends(), index, length);
        }

        removeExtends(index: number): this;
        removeExtends(implementsNode: ExpressionWithTypeArguments): this;
        removeExtends(implementsNodeOrIndex: ExpressionWithTypeArguments | number) {
            const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
            if (extendsClause == null)
                throw new errors.InvalidOperationError("Cannot remove an extends when none exist.");

            extendsClause.removeExpression(implementsNodeOrIndex);
            return this;
        }

        fill(structure: Partial<ExtendsClauseableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.extends != null && structure.extends.length > 0)
                this.addExtends(structure.extends);

            return this;
        }
    };
}

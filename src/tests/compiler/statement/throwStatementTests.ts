import { expect } from "chai";
import { ThrowStatement } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<ThrowStatement>(text, SyntaxKind.ThrowStatement).descendant;
}

describe(nameof(ThrowStatement), () => {
    const expression = "new Error('foo')";
    const statement = `throw ${expression};`;
    describe(nameof<ThrowStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const doStatement = getStatement(text);
            expect(doStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should return the correct expression", () => {
            doTest(statement, expression);
        });
    });
});

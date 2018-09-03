﻿/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the definition file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import * as path from "path";
import Project, { SourceFile, ClassDeclaration, TypeGuards, ts, SyntaxKind } from "ts-simple-ast";

export function flattenDeclarationFiles(project: Project, mainFile: SourceFile) {
    const definitionFiles = project.getSourceFiles(["dist/**/*.d.ts", "!dist/typescript/typescript.d.ts", "!dist/codeBlockWriter/code-block-writer.d.ts"]);
    const compilerApiFile = project.getSourceFileOrThrow("dist/typescript/typescript.d.ts");
    const codeBlockWriterFile = project.getSourceFileOrThrow("dist/codeBlockWriter/code-block-writer.d.ts");
    const exportedDeclarations = mainFile.getExportedDeclarations();
    mainFile.removeText();

    for (let declaration of exportedDeclarations) {
        const sourceFile = declaration.getSourceFile();
        if (sourceFile === compilerApiFile || sourceFile === codeBlockWriterFile)
            continue;
        if (TypeGuards.isVariableDeclaration(declaration))
            declaration = declaration.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

        mainFile.insertText(mainFile.getFullWidth(), declaration.getFullText() + "\n");
    }

    // add imports the typescript compiler api and code block writer files
    mainFile.addImportDeclaration({
        namedImports: ["ts", "SyntaxKind", "CompilerOptions", "EmitHint", "ScriptKind", "NewLineKind", "LanguageVariant", "ScriptTarget",
            "TypeFlags", "ObjectFlags", "SymbolFlags", "TypeFormatFlags", "DiagnosticCategory", "EditorSettings", "ModuleResolutionKind"],
        moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(compilerApiFile)
    });
    mainFile.addImportDeclaration({
        namedImports: ["CodeBlockWriter"],
        moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(codeBlockWriterFile)
    });

    mainFile.addExportDeclaration({ moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(compilerApiFile) });
    mainFile.addExportDeclaration({ moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(codeBlockWriterFile) });

    // update the main.d.ts file
    mainFile.getClassOrThrow("Project").setIsDefaultExport(true);
    mainFile.replaceWithText(mainFile.getFullText().replace(/compiler\.([A-Za-z]+)/g, "$1"));

    definitionFiles.filter(f => f !== mainFile).forEach(f => f.delete());
}

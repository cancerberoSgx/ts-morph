﻿import * as ts from "typescript";
import {LanguageService} from "./compiler";
import {CompilerFactory} from "./factories";
import * as compiler from "./compiler";

export interface Options {
    compilerOptions?: ts.CompilerOptions;
    compilerHost?: ts.CompilerHost;
}

export class TsSimpleAst {
    private readonly compilerOptions: ts.CompilerOptions;
    private readonly languageService: LanguageService;
    private readonly compilerFactory: CompilerFactory;

    constructor(options: Options = {}) {
        this.compilerOptions = options.compilerOptions || {};
        this.compilerOptions.target = this.compilerOptions.target || ts.ScriptTarget.Latest;
        this.languageService = new LanguageService(this.compilerOptions);
        this.compilerFactory = new CompilerFactory(this.languageService);
    }

    createSourceFileFromText(filePath: string, sourceText: string): compiler.SourceFile {
        return this.compilerFactory.createSourceFileFromText(filePath, sourceText);
    }

    getSourceFiles(): compiler.SourceFile[] {
        return this.languageService.getSourceFiles();
    }
}

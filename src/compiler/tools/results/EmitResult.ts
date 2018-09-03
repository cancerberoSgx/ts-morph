import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { OutputFile } from "./OutputFile";

/**
 * Result of an emit.
 */
export class EmitResult {
    /** @internal */
    private readonly context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.EmitResult;

    /**
     * @internal
     */
    constructor(context: ProjectContext, compilerObject: ts.EmitResult) {
        this.context = context;
        this._compilerObject = compilerObject;
    }

    /**
     * TypeScript compiler emit result.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * If the emit was skipped.
     */
    getEmitSkipped() {
        return this.compilerObject.emitSkipped;
    }

    /**
     * Contains declaration emit diagnostics.
     */
    @Memoize
    getDiagnostics() {
        return this.compilerObject.diagnostics.map(d => this.context.compilerFactory.getDiagnostic(d));
    }

    /*
    // this requires the listEmittedFiles compiler option to be true, but that's not public...
    // todo: revaluate this to see if they've made it public yet
    getEmittedFilePaths() {
        return this.compilerEmitResult.emittedFiles;
    }
    */
}

/**
 * The emitted file in memory.
 */
export interface MemoryEmitResultFile {
    /**
     * File path that was emitted to.
     */
    filePath: string;
    /**
     * The text that was emitted.
     */
    text: string;
    /**
     * Whether the byte order mark should be written.
     */
    writeByteOrderMark: boolean;
}

/**
 * Result of an emit to memory.
 */
export class MemoryEmitResult extends EmitResult {
    /**
     * @internal
     */
    constructor(context: ProjectContext, compilerObject: ts.EmitResult, private readonly files: MemoryEmitResultFile[]) {
        super(context, compilerObject);
    }

    /**
     * Gets the files that were emitted to memory.
     */
    getFiles() {
        return this.files;
    }
}

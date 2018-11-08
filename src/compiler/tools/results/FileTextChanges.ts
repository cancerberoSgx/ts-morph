﻿import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { TextChange } from "./TextChange";

export class FileTextChanges {
    /** @internal */
    private readonly _compilerObject: ts.FileTextChanges;

    /** @private */
    constructor(compilerObject: ts.FileTextChanges) {
        this._compilerObject = compilerObject;
    }

    /**
     * Gets the file path.
     */
    getFilePath() {
        return this._compilerObject.fileName;
    }

    /**
     * Gets the text changes
     */
    @Memoize
    getTextChanges() {
        return this._compilerObject.textChanges.map(c => new TextChange(c));
    }

    /**
     * Gets if this change is for creating a new file.
     */
    isNewFile() {
        return !!this._compilerObject.isNewFile;
    }
}

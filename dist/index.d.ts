import { ForgeClient, ForgeExtension, IExtendedCompilationResult } from "@tryforge/forgescript";
import { IDataBaseOptions } from "./util";
export type TransformEvents<T> = {
    [P in keyof T]: T[P] extends any[] ? (...args: T[P]) => any : never;
};
export declare class ForgeDB extends ForgeExtension {
    readonly options?: IDataBaseOptions | undefined;
    static defaults?: Record<PropertyKey, IExtendedCompilationResult | unknown>;
    name: string;
    description: string;
    version: string;
    commands: any;
    emitter: any;
    constructor(options?: IDataBaseOptions | undefined);
    init(client: ForgeClient): void;
    variables(rec: Record<PropertyKey, unknown>): void;
    static variables(rec: Record<PropertyKey, unknown>): void;
    private static compileVariables;
}
export { DataBaseManager } from "./util";
//# sourceMappingURL=index.d.ts.map
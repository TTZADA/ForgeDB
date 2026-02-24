import "reflect-metadata";
import { IDataBaseOptions } from "./types";
import { DataSource, EntitySchema, MixedList } from "typeorm";
export declare abstract class DataBaseManager {
    abstract database: string;
    abstract entityManager: {
        sqlite: MixedList<Function | string | EntitySchema>;
        mongodb: MixedList<Function | string | EntitySchema>;
        mysql: MixedList<Function | string | EntitySchema>;
        postgres: MixedList<Function | string | EntitySchema>;
    };
    type?: IDataBaseOptions["type"];
    static type: IDataBaseOptions["type"];
    constructor(options?: IDataBaseOptions);
    protected getDB(): Promise<DataSource>;
    private tryInitialize;
    private waitForConfig;
    static getActiveDataBases(): {
        name: string;
        db: DataSource;
    }[];
    static closeConnection(name: string): Promise<boolean>;
    static openConnection(name: string): Promise<boolean>;
}
//# sourceMappingURL=databaseManager.d.ts.map
import { Cooldown, IDataBaseOptions, MongoCooldown, MongoRecord, MySQLRecord, PostgreSQLRecord, RecordData, SQLiteRecord } from "./types";
import { TypedEmitter } from "tiny-typed-emitter";
import { IDBEvents } from "../structures";
import { TransformEvents } from "..";
import "reflect-metadata";
import { DataBaseManager } from "./databaseManager";
export declare class DataBase extends DataBaseManager {
    private emitter;
    database: string;
    entityManager: {
        sqlite: (typeof SQLiteRecord | typeof Cooldown)[];
        mongodb: (typeof MongoRecord | typeof MongoCooldown)[];
        mysql: (typeof MySQLRecord | typeof Cooldown)[];
        postgres: (typeof PostgreSQLRecord | typeof Cooldown)[];
    };
    private static entities;
    private db;
    private static db;
    private static emitter;
    constructor(emitter: TypedEmitter<TransformEvents<IDBEvents>>, options?: IDataBaseOptions);
    init(): Promise<void>;
    static make_intetifier(data: RecordData): string;
    static set(data: RecordData): Promise<void>;
    static get(data: RecordData): Promise<any>;
    static getAll(): Promise<any>;
    static find(data?: RecordData): Promise<any>;
    static delete(data: RecordData): Promise<any>;
    static wipe(): Promise<void>;
    static cdWipe(): Promise<void>;
    static make_cdIdentifier(data: {
        name?: string;
        id?: string;
    }): string;
    static cdAdd(data: {
        name: string;
        id?: string;
        duration: number;
    }): Promise<any>;
    static cdDelete(identifier: string): Promise<void>;
    static cdTimeLeft(identifier: string): Promise<any>;
    static query(query: string): Promise<any>;
    static isActive(): boolean;
    static closeConnection(): Promise<void>;
    static startConnection(): Promise<void>;
    static checkHealth(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    static backup(dest?: string): Promise<string>;
    static setCache(key: string, value: string, ttlMs?: number): void;
    static getCache(key: string): string | undefined;
    static deleteCache(key: string): boolean;
    static resetCache(key: string): boolean;
    static resetAllCaches(keys?: string[]): void;
    static wipeCaches(): void;
    static getCacheSize(): number;
}
//# sourceMappingURL=database.d.ts.map
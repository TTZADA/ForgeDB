import {
    Cooldown,
    GuildData,
    IDataBaseOptions,
    MongoCooldown,
    MongoRecord,
    MySQLRecord,
    PostgreSQLRecord,
    RecordData,
    SQLiteRecord,
} from "./types";
import { DataSource } from "typeorm";
import { TypedEmitter } from "tiny-typed-emitter";
import { IDBEvents } from "../structures";
import { TransformEvents } from "..";
import "reflect-metadata";
import { DataBaseManager } from "./databaseManager";
import * as fs from "fs";
import * as path from "path";

function isGuildData(data: RecordData): data is GuildData {
    return ["member", "channel", "role"].includes(data.type!);
}

type AnyRecord = typeof SQLiteRecord | typeof MongoRecord | typeof MySQLRecord | typeof PostgreSQLRecord;
type AnyCooldown = typeof MongoCooldown | typeof Cooldown;

const internalCache = new Map<string, { value: string; expiresAt?: number }>();

export class DataBase extends DataBaseManager {
    public database = "forge.db";
    public entityManager = {
        sqlite: [SQLiteRecord, Cooldown],
        mongodb: [MongoRecord, MongoCooldown],
        mysql: [MySQLRecord, Cooldown],
        postgres: [PostgreSQLRecord, Cooldown],
    };

    private static entities: {
        Record: AnyRecord;
        Cooldown: typeof Cooldown | typeof MongoCooldown;
    };

    private db: Promise<DataSource>;
    private static db: DataSource;
    private static emitter: TypedEmitter<TransformEvents<IDBEvents>>;

    constructor(
        private emitter: TypedEmitter<TransformEvents<IDBEvents>>,
        options?: IDataBaseOptions
    ) {
        super(options ?? { type: "sqlite" });
        this.type = options?.type || "sqlite";
        this.db = this.getDB();
        DataBase.entities = {
            Record: this.entityManager[this.type === "better-sqlite3" ? "sqlite" : this.type][0] as AnyRecord,
            Cooldown: this.entityManager[this.type === "better-sqlite3" ? "sqlite" : this.type][1] as AnyCooldown,
        };
    }

    public async init() {
        DataBase.emitter = this.emitter;
        DataBase.db = await this.db;
        DataBase.emitter.emit("connect");
    }

    public static make_intetifier(data: RecordData) {
        return `${data.type}_${data.name}_${isGuildData(data) ? data.guildId + "_" : ""}${data.id}`;
    }

    public static async set(data: RecordData) {
        const newData = new this.entities.Record();
        newData.identifier = this.make_intetifier(data);
        newData.name = data.name!;
        newData.id = data.id!;
        newData.type = data.type!;
        newData.value = data.value!;
        if (isGuildData(data)) newData.guildId = data.guildId;

        internalCache.set(newData.identifier, { value: newData.value });

        const oldData = (await this.db
            .getRepository(this.entities.Record)
            .findOneBy({ identifier: this.make_intetifier(data) })) as SQLiteRecord;

        if (oldData && this.type === "mongodb") {
            this.emitter.emit("variableUpdate", { newData, oldData });
            await this.db.getRepository(this.entities.Record).update({ identifier: oldData.identifier }, newData);
        } else {
            oldData
                ? this.emitter.emit("variableUpdate", { newData, oldData })
                : this.emitter.emit("variableCreate", { data: newData });
            await this.db.getRepository(this.entities.Record).save(newData);
        }
    }

    public static async get(data: RecordData) {
        const identifier = data.identifier ?? this.make_intetifier(data);

        const cached = internalCache.get(identifier);
        if (cached) {
            if (!cached.expiresAt || cached.expiresAt > Date.now()) {
                const record = new this.entities.Record();
                record.identifier = identifier;
                record.value = cached.value;
                return record as SQLiteRecord;
            } else {
                internalCache.delete(identifier);
            }
        }

        const result = await this.db.getRepository(this.entities.Record).findOneBy({ identifier });
        if (result) internalCache.set(identifier, { value: result.value });
        return result;
    }

    public static async getAll() {
        return await this.db.getRepository(this.entities.Record).find();
    }

    public static async find(data?: RecordData) {
        return await this.db.getRepository(this.entities.Record).find({ where: { ...data } });
    }

    public static async delete(data: RecordData) {
        const identifier = data.identifier ?? this.make_intetifier(data);
        internalCache.delete(identifier);
        const record = (await this.db
            .getRepository(this.entities.Record)
            .findOneBy({ identifier })) as SQLiteRecord;
        this.emitter.emit("variableDelete", { data: record });
        return await this.db.getRepository(this.entities.Record).delete({ identifier });
    }

    public static async wipe() {
        internalCache.clear();
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type === "mongodb") {
            const all = await this.db.getRepository(this.entities.Record).find();
            for (const doc of all) {
                await this.db.getRepository(this.entities.Record).remove(doc);
            }
            return;
        }
        try {
            await this.db.getRepository(this.entities.Record).clear();
        } catch {
            await this.db.getRepository(this.entities.Record).createQueryBuilder().delete().execute();
        }
    }

    public static async cdWipe() {
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type === "mongodb") {
            const all = await this.db.getRepository(this.entities.Cooldown).find();
            for (const doc of all) {
                await this.db.getRepository(this.entities.Cooldown).remove(doc);
            }
            return;
        }
        try {
            await this.db.getRepository(this.entities.Cooldown).clear();
        } catch {
            await this.db.getRepository(this.entities.Cooldown).createQueryBuilder().delete().execute();
        }
    }

    public static make_cdIdentifier(data: { name?: string; id?: string }) {
        return `${data.name}${data.id ? "_" + data.id : ""}`;
    }

    public static async cdAdd(data: { name: string; id?: string; duration: number }) {
        const cd = new this.entities.Cooldown();
        cd.identifier = this.make_cdIdentifier(data);
        cd.name = data.name;
        cd.id = data.id;
        cd.startedAt = Date.now();
        cd.duration = data.duration;

        const oldCD = await this.db
            .getRepository(this.entities.Cooldown)
            .findOneBy({ identifier: this.make_cdIdentifier(data) });
        if (oldCD && this.type === "mongodb") {
            return await this.db.getRepository(this.entities.Cooldown).update({ identifier: oldCD.identifier }, cd);
        }
        return await this.db.getRepository(this.entities.Cooldown).save(cd);
    }

    public static async cdDelete(identifier: string) {
        await this.db.getRepository(this.entities.Cooldown).delete({ identifier });
    }

    public static async cdTimeLeft(identifier: string) {
        const data = await this.db.getRepository(this.entities.Cooldown).findOneBy({ identifier });
        return data
            ? { ...data, left: Math.max(data.duration - (Date.now() - data.startedAt), 0) }
            : { left: 0 };
    }

    public static async query(query: string) {
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type === "mongodb") {
            return await this.db.getRepository(this.entities.Record).count();
        }
        return await this.db.query(query);
    }

    public static isActive(): boolean {
        return this.db?.isInitialized ?? false;
    }

    public static async closeConnection(): Promise<void> {
        if (this.db?.isInitialized) {
            await this.db.destroy();
        }
    }

    public static async startConnection(): Promise<void> {
        if (!this.db?.isInitialized) {
            await this.db.initialize();
        }
    }

    public static async checkHealth(): Promise<{ healthy: boolean; details: string }> {
        try {
            if (!this.db?.isInitialized) return { healthy: false, details: "Connection is not initialized" };
            const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
            if (type === "sqlite") {
                const result = await this.db.query("PRAGMA integrity_check");
                const ok = result?.[0]?.integrity_check === "ok";
                return { healthy: ok, details: ok ? "ok" : JSON.stringify(result) };
            }
            await this.db.query("SELECT 1");
            return { healthy: true, details: "ok" };
        } catch (err) {
            return { healthy: false, details: (err as Error).message };
        }
    }

    public static async backup(dest?: string): Promise<string> {
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type !== "sqlite") throw new Error("Backup is only supported for SQLite databases.");
        const targetDir = dest ?? "backup";
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        const src = path.resolve(`database/${this.prototype?.database ?? "forge.db"}`);
        const timestamp = Date.now();
        const destFile = path.join(targetDir, `forge.db.${timestamp}.bak`);
        fs.copyFileSync(src, destFile);
        return destFile;
    }

    public static setCache(key: string, value: string, ttlMs?: number) {
        internalCache.set(key, {
            value,
            expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
        });
    }

    public static getCache(key: string): string | undefined {
        const entry = internalCache.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) {
            internalCache.delete(key);
            return undefined;
        }
        return entry.value;
    }

    public static deleteCache(key: string): boolean {
        return internalCache.delete(key);
    }

    public static resetCache(key: string): boolean {
        const entry = internalCache.get(key);
        if (!entry) return false;
        internalCache.set(key, { value: entry.value });
        return true;
    }

    public static resetAllCaches(keys?: string[]) {
        if (!keys || keys.length === 0) {
            for (const [k, v] of internalCache.entries()) {
                internalCache.set(k, { value: v.value });
            }
            return;
        }
        for (const key of keys) {
            const entry = internalCache.get(key);
            if (entry) internalCache.set(key, { value: entry.value });
        }
    }

    public static wipeCaches() {
        internalCache.clear();
    }

    public static getCacheSize(): number {
        return internalCache.size;
    }
}

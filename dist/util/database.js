"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = void 0;
require("reflect-metadata");
const databaseManager_1 = require("./databaseManager");
const fs = require("fs");
const path = require("path");
const internalCache = new Map();
class DataBase extends databaseManager_1.DataBaseManager {
    constructor(emitter, options) {
        super(options ?? { type: "sqlite" });
        this.emitter = emitter;
        this.database = "forge.db";
        this.entityManager = {
            sqlite: [require("./types").SQLiteRecord, require("./types").Cooldown],
            mongodb: [require("./types").MongoRecord, require("./types").MongoCooldown],
            mysql: [require("./types").MySQLRecord, require("./types").Cooldown],
            postgres: [require("./types").PostgreSQLRecord, require("./types").Cooldown],
        };
        this.type = options?.type || "sqlite";
        this.db = this.getDB();
        const normalType = this.type === "better-sqlite3" ? "sqlite" : this.type;
        DataBase.entities = {
            Record: this.entityManager[normalType][0],
            Cooldown: this.entityManager[normalType][1],
        };
    }
    async init() {
        DataBase.emitter = this.emitter;
        DataBase.db = await this.db;
        DataBase.emitter.emit("connect");
    }
    static make_intetifier(data) {
        const isGuild = ["member", "channel", "role"].includes(data.type);
        return `${data.type}_${data.name}_${isGuild ? data.guildId + "_" : ""}${data.id}`;
    }
    static async set(data) {
        const newData = new this.entities.Record();
        newData.identifier = this.make_intetifier(data);
        newData.name = data.name;
        newData.id = data.id;
        newData.type = data.type;
        newData.value = data.value;
        if (["member", "channel", "role"].includes(data.type)) newData.guildId = data.guildId;
        internalCache.set(newData.identifier, { value: newData.value });
        const oldData = await this.db.getRepository(this.entities.Record).findOneBy({ identifier: this.make_intetifier(data) });
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
    static async get(data) {
        const identifier = data.identifier ?? this.make_intetifier(data);
        const cached = internalCache.get(identifier);
        if (cached) {
            if (!cached.expiresAt || cached.expiresAt > Date.now()) {
                const record = new this.entities.Record();
                record.identifier = identifier;
                record.value = cached.value;
                return record;
            } else {
                internalCache.delete(identifier);
            }
        }
        const result = await this.db.getRepository(this.entities.Record).findOneBy({ identifier });
        if (result) internalCache.set(identifier, { value: result.value });
        return result;
    }
    static async getAll() {
        return await this.db.getRepository(this.entities.Record).find();
    }
    static async find(data) {
        return await this.db.getRepository(this.entities.Record).find({ where: { ...data } });
    }
    static async delete(data) {
        const identifier = data.identifier ?? this.make_intetifier(data);
        internalCache.delete(identifier);
        const record = await this.db.getRepository(this.entities.Record).findOneBy({ identifier });
        this.emitter.emit("variableDelete", { data: record });
        return await this.db.getRepository(this.entities.Record).delete({ identifier });
    }
    static async wipe() {
        internalCache.clear();
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type === "mongodb") {
            const all = await this.db.getRepository(this.entities.Record).find();
            for (const doc of all) await this.db.getRepository(this.entities.Record).remove(doc);
            return;
        }
        try {
            await this.db.getRepository(this.entities.Record).clear();
        } catch {
            await this.db.getRepository(this.entities.Record).createQueryBuilder().delete().execute();
        }
    }
    static async cdWipe() {
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type === "mongodb") {
            const all = await this.db.getRepository(this.entities.Cooldown).find();
            for (const doc of all) await this.db.getRepository(this.entities.Cooldown).remove(doc);
            return;
        }
        try {
            await this.db.getRepository(this.entities.Cooldown).clear();
        } catch {
            await this.db.getRepository(this.entities.Cooldown).createQueryBuilder().delete().execute();
        }
    }
    static make_cdIdentifier(data) {
        return `${data.name}${data.id ? "_" + data.id : ""}`;
    }
    static async cdAdd(data) {
        const cd = new this.entities.Cooldown();
        cd.identifier = this.make_cdIdentifier(data);
        cd.name = data.name;
        cd.id = data.id;
        cd.startedAt = Date.now();
        cd.duration = data.duration;
        const oldCD = await this.db.getRepository(this.entities.Cooldown).findOneBy({ identifier: this.make_cdIdentifier(data) });
        if (oldCD && this.type === "mongodb") {
            return await this.db.getRepository(this.entities.Cooldown).update({ identifier: oldCD.identifier }, cd);
        }
        return await this.db.getRepository(this.entities.Cooldown).save(cd);
    }
    static async cdDelete(identifier) {
        await this.db.getRepository(this.entities.Cooldown).delete({ identifier });
    }
    static async cdTimeLeft(identifier) {
        const data = await this.db.getRepository(this.entities.Cooldown).findOneBy({ identifier });
        return data ? { ...data, left: Math.max(data.duration - (Date.now() - data.startedAt), 0) } : { left: 0 };
    }
    static async query(query) {
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type === "mongodb") return await this.db.getRepository(this.entities.Record).count();
        return await this.db.query(query);
    }
    static isActive() {
        return this.db?.isInitialized ?? false;
    }
    static async closeConnection() {
        if (this.db?.isInitialized) await this.db.destroy();
    }
    static async startConnection() {
        if (!this.db?.isInitialized) await this.db.initialize();
    }
    static async checkHealth() {
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
            return { healthy: false, details: err.message };
        }
    }
    static async backup(dest) {
        const type = this.type === "better-sqlite3" ? "sqlite" : this.type;
        if (type !== "sqlite") throw new Error("Backup is only supported for SQLite databases.");
        const targetDir = dest ?? "backup";
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        const src = path.resolve(`database/forge.db`);
        const timestamp = Date.now();
        const destFile = path.join(targetDir, `forge.db.${timestamp}.bak`);
        fs.copyFileSync(src, destFile);
        return destFile;
    }
    static setCache(key, value, ttlMs) {
        internalCache.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : undefined });
    }
    static getCache(key) {
        const entry = internalCache.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) { internalCache.delete(key); return undefined; }
        return entry.value;
    }
    static deleteCache(key) { return internalCache.delete(key); }
    static resetCache(key) {
        const entry = internalCache.get(key);
        if (!entry) return false;
        internalCache.set(key, { value: entry.value });
        return true;
    }
    static resetAllCaches(keys) {
        const targets = keys?.length ? keys : [...internalCache.keys()];
        for (const key of targets) {
            const entry = internalCache.get(key);
            if (entry) internalCache.set(key, { value: entry.value });
        }
    }
    static wipeCaches() { internalCache.clear(); }
    static getCacheSize() { return internalCache.size; }
}
DataBase._cacheDatabaseVariables = false;
exports.DataBase = DataBase;

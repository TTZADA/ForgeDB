"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseManager = void 0;
require("reflect-metadata");
const activeDataBases = [];
let config;
class DataBaseManager {
    constructor(options) {
        if (!config && options) {
            options.type = options.type ?? "sqlite";
            config = options;
        }
    }
    async getDB() {
        await this.waitForConfig();
        this.type = config.type;
        DataBaseManager.type = this.type;
        const existing = activeDataBases.find((s) => s.name === this.database);
        if (existing) return existing.db;
        const data = { ...config };
        let db;
        switch (data.type) {
            case "mysql":
                db = new (require("typeorm").DataSource)({ ...data, entities: this.entityManager.mysql, synchronize: true });
                break;
            case "postgres":
                db = new (require("typeorm").DataSource)({ ...data, entities: this.entityManager.postgres, synchronize: true });
                break;
            case "mongodb":
                db = new (require("typeorm").DataSource)({ ...data, entities: this.entityManager.mongodb, synchronize: true });
                break;
            default:
                db = new (require("typeorm").DataSource)({
                    ...data,
                    entities: this.entityManager.sqlite,
                    synchronize: true,
                    database: `${data.folder ?? "database"}/${this.database}`,
                });
                break;
        }
        const initialized = await this.tryInitialize(db);
        activeDataBases.push({ name: this.database, db: initialized });
        return initialized;
    }
    async tryInitialize(db, attempt = 1, maxAttempts = 5) {
        try {
            return await db.initialize();
        } catch (err) {
            if (attempt >= maxAttempts) {
                throw new Error(`ForgeDB: Failed to connect after ${maxAttempts} attempts. Last error: ${err.message}`);
            }
            const delay = Math.min(1000 * 2 ** (attempt - 1), 30000);
            await new Promise((r) => setTimeout(r, delay));
            return this.tryInitialize(db, attempt + 1, maxAttempts);
        }
    }
    async waitForConfig() {
        if (config) return config;
        return new Promise((resolve, reject) => {
            const check = setInterval(() => {
                if (config) {
                    clearInterval(check);
                    resolve(config);
                }
            }, 50);
            setTimeout(() => {
                clearInterval(check);
                if (!config)
                    reject(new Error("ForgeDB: Unable to resolve configuration. Dependent packages failed to initialize."));
            }, 10000);
        });
    }
    static getActiveDataBases() {
        return activeDataBases;
    }
    static async closeConnection(name) {
        const idx = activeDataBases.findIndex((s) => s.name === name);
        if (idx === -1) return false;
        await activeDataBases[idx].db.destroy();
        activeDataBases.splice(idx, 1);
        return true;
    }
    static async openConnection(name) {
        const entry = activeDataBases.find((s) => s.name === name);
        if (!entry) return false;
        if (entry.db.isInitialized) return true;
        await entry.db.initialize();
        return true;
    }
}
exports.DataBaseManager = DataBaseManager;

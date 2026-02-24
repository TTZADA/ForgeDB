import "reflect-metadata";
import { IDataBaseOptions } from "./types";
import { DataSource, EntitySchema, MixedList } from "typeorm";

const activeDataBases: { name: string; db: DataSource }[] = [];
let config: IDataBaseOptions;

export abstract class DataBaseManager {
    public abstract database: string;
    public abstract entityManager: {
        sqlite: MixedList<Function | string | EntitySchema>;
        mongodb: MixedList<Function | string | EntitySchema>;
        mysql: MixedList<Function | string | EntitySchema>;
        postgres: MixedList<Function | string | EntitySchema>;
    };

    public type?: IDataBaseOptions["type"];
    public static type: IDataBaseOptions["type"];

    constructor(options?: IDataBaseOptions) {
        if (!config && options) {
            options.type = options.type ?? "sqlite";
            config = options;
        }
    }

    protected async getDB(): Promise<DataSource> {
        await this.waitForConfig();
        this.type = config.type;
        DataBaseManager.type = this.type;

        const existing = activeDataBases.find((s) => s.name === this.database);
        if (existing) return existing.db;

        const data: IDataBaseOptions = { ...config };
        let db: DataSource;

        switch (data.type) {
            case "mysql":
                db = new DataSource({ ...data, entities: this.entityManager.mysql, synchronize: true });
                break;
            case "postgres":
                db = new DataSource({ ...data, entities: this.entityManager.postgres, synchronize: true });
                break;
            case "mongodb":
                db = new DataSource({ ...data, entities: this.entityManager.mongodb, synchronize: true });
                break;
            default:
                db = new DataSource({
                    ...data,
                    entities: this.entityManager.sqlite,
                    synchronize: true,
                    database: `${(data as any).folder ?? "database"}/${this.database}`,
                });
                break;
        }

        const initialized = await this.tryInitialize(db);
        activeDataBases.push({ name: this.database, db: initialized });
        return initialized;
    }

    private async tryInitialize(db: DataSource, attempt = 1, maxAttempts = 5): Promise<DataSource> {
        try {
            return await db.initialize();
        } catch (err) {
            if (attempt >= maxAttempts) {
                throw new Error(
                    `ForgeDB: Failed to connect after ${maxAttempts} attempts. Last error: ${(err as Error).message}`
                );
            }
            const delay = Math.min(1000 * 2 ** (attempt - 1), 30000);
            await new Promise((r) => setTimeout(r, delay));
            return this.tryInitialize(db, attempt + 1, maxAttempts);
        }
    }

    private async waitForConfig(): Promise<IDataBaseOptions> {
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
                    reject(
                        new Error(
                            "ForgeDB: Unable to resolve configuration. Dependent packages failed to initialize."
                        )
                    );
            }, 10_000);
        });
    }

    public static getActiveDataBases() {
        return activeDataBases;
    }

    public static async closeConnection(name: string): Promise<boolean> {
        const idx = activeDataBases.findIndex((s) => s.name === name);
        if (idx === -1) return false;
        await activeDataBases[idx].db.destroy();
        activeDataBases.splice(idx, 1);
        return true;
    }

    public static async openConnection(name: string): Promise<boolean> {
        const entry = activeDataBases.find((s) => s.name === name);
        if (!entry) return false;
        if (entry.db.isInitialized) return true;
        await entry.db.initialize();
        return true;
    }
}

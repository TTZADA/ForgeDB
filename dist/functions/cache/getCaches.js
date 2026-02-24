"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$getCaches",
    version: "1.0.0",
    description: "Returns all entries in the in-memory cache, optionally filtered by minimum remaining TTL in milliseconds",
    output: forgescript_1.ArgType.Json,
    unwrap: true,
    brackets: false,
    args: [
        {
            name: "ttl",
            description: "If provided, only returns entries with at least this many milliseconds of TTL remaining",
            rest: false,
            type: forgescript_1.ArgType.Number,
            required: false,
        },
    ],
    async execute(_ctx, [ttl]) {
        const result = {};
        const now = Date.now();
        for (const [key, entry] of util_1.DataBase.getCacheEntries()) {
            if (entry.expiresAt && entry.expiresAt <= now) continue;
            const remaining = entry.expiresAt ? entry.expiresAt - now : null;
            if (ttl !== null && ttl !== undefined) {
                if (remaining === null) continue;
                if (remaining < ttl) continue;
            }
            result[key] = { value: entry.value, ttl: remaining };
        }
        return this.successJSON(result);
    },
});

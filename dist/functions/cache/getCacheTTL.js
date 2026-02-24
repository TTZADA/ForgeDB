"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$getCacheTTL",
    version: "1.0.0",
    description: "Returns the remaining TTL in milliseconds for a cache key. Returns null if no TTL, -1 if not found or expired",
    output: forgescript_1.ArgType.Number,
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "key",
            description: "The cache key",
            rest: false,
            type: forgescript_1.ArgType.String,
            required: true,
        },
    ],
    async execute(_ctx, [key]) {
        const entry = util_1.DataBase.getCacheEntry(key);
        if (!entry) return this.success(-1);
        const now = Date.now();
        if (entry.expiresAt && entry.expiresAt <= now) return this.success(-1);
        if (!entry.expiresAt) return this.success(null);
        return this.success(entry.expiresAt - now);
    },
});

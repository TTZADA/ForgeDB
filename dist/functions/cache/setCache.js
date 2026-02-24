"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$setCache",
    version: "1.0.0",
    description: "Sets a value in the in-memory cache with an optional TTL in milliseconds",
    unwrap: true,
    brackets: true,
    args: [
        { name: "key", description: "The cache key", rest: false, type: forgescript_1.ArgType.String, required: true },
        { name: "value", description: "The value to cache", rest: false, type: forgescript_1.ArgType.String, required: true },
        { name: "ttl", description: "Time to live in milliseconds (optional)", rest: false, type: forgescript_1.ArgType.Number, required: false },
    ],
    async execute(_ctx, [key, value, ttl]) {
        util_1.DataBase.setCache(key, value, ttl ?? undefined);
        return this.success();
    },
});

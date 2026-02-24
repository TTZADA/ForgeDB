"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$getCache",
    version: "1.0.0",
    description: "Gets a value from the in-memory cache",
    output: forgescript_1.ArgType.String,
    unwrap: true,
    brackets: true,
    args: [
        { name: "key", description: "The cache key", rest: false, type: forgescript_1.ArgType.String, required: true },
        { name: "default", description: "Default value if key is not found or expired", rest: false, type: forgescript_1.ArgType.String, required: false },
    ],
    async execute(_ctx, [key, def]) {
        const value = util_1.DataBase.getCache(key);
        return this.success(value ?? def ?? null);
    },
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$resetCache",
    version: "1.0.0",
    description: "Resets the TTL of a specific cache key, making it permanent",
    output: forgescript_1.ArgType.Boolean,
    unwrap: true,
    brackets: true,
    args: [{ name: "key", description: "The cache key to reset", rest: false, type: forgescript_1.ArgType.String, required: true }],
    async execute(_ctx, [key]) { return this.success(util_1.DataBase.resetCache(key)); },
});

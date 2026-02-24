"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$resetAllCaches",
    version: "1.0.0",
    description: "Resets the TTL of all cache keys or specific ones",
    unwrap: true,
    brackets: false,
    args: [{ name: "keys", description: "Comma-separated keys to reset (optional)", rest: true, type: forgescript_1.ArgType.String, required: false }],
    async execute(_ctx, [keys]) {
        util_1.DataBase.resetAllCaches(keys?.length ? keys : undefined);
        return this.success();
    },
});

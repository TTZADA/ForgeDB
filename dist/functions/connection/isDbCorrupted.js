"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$isDbCorrupted",
    version: "1.0.0",
    description: "Checks database health. Returns true if the database is unhealthy or unreachable.",
    output: forgescript_1.ArgType.Boolean,
    unwrap: false,
    async execute(_ctx) {
        const result = await util_1.DataBase.checkHealth();
        return this.success(!result.healthy);
    },
});

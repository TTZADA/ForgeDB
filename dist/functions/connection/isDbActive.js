"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$isDbActive",
    version: "1.0.0",
    description: "Returns whether the database connection is currently active",
    output: forgescript_1.ArgType.Boolean,
    unwrap: false,
    async execute(_ctx) { return this.success(util_1.DataBase.isActive()); },
});

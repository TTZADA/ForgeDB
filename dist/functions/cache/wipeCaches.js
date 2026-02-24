"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$wipeCaches",
    version: "1.0.0",
    description: "Completely clears the in-memory cache",
    unwrap: false,
    async execute(_ctx) { util_1.DataBase.wipeCaches(); return this.success(); },
});

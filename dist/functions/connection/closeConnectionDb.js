"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$closeConnectionDb",
    version: "1.0.0",
    description: "Closes the current database connection",
    unwrap: false,
    async execute(_ctx) { await util_1.DataBase.closeConnection(); return this.success(); },
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$startConnectionDb",
    version: "1.0.0",
    description: "Starts or restores the database connection",
    unwrap: false,
    async execute(_ctx) { await util_1.DataBase.startConnection(); return this.success(); },
});

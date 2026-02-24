"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$getDB",
    version: "1.0.0",
    aliases: ["$getDataBase", "$getRecords"],
    description: "Returns all stored records in the database",
    output: forgescript_1.ArgType.Json,
    unwrap: false,
    async execute(_ctx) {
        const all = await util_1.DataBase.getAll();
        const normalized = all.map((r) => ({
            identifier: r.identifier,
            name: r.name,
            id: r.id,
            type: r.type,
            value: r.value,
            guildId: r.guildId ?? null,
        }));
        return this.successJSON(normalized);
    },
});

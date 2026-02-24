"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const util_1 = require("../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$backupDb",
    version: "1.0.0",
    description: "Creates a backup of the SQLite database. Returns the path of the backup file.",
    output: forgescript_1.ArgType.String,
    unwrap: true,
    brackets: false,
    args: [{ name: "path", description: "Destination folder (default: backup/)", rest: false, type: forgescript_1.ArgType.String, required: false }],
    async execute(_ctx, [dest]) {
        try {
            const filePath = await util_1.DataBase.backup(dest ?? undefined);
            return this.success(filePath);
        } catch (err) {
            return this.customError(err.message);
        }
    },
});

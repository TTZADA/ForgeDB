import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$backupDb",
    version: "1.0.0",
    description: "Creates a backup of the SQLite database. Returns the path of the backup file.",
    output: ArgType.String,
    unwrap: true,
    brackets: false,
    args: [
        {
            name: "path",
            description: "Destination folder for the backup (default: backup/)",
            rest: false,
            type: ArgType.String,
            required: false,
        },
    ],
    async execute(_ctx, [dest]) {
        try {
            const filePath = await DataBase.backup(dest ?? undefined)
            return this.success(filePath)
        } catch (err) {
            return this.customError((err as Error).message)
        }
    },
})

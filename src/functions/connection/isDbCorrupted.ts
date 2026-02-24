import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$isDbCorrupted",
    version: "1.0.0",
    description: "Checks database health. Returns true if the database is unhealthy or unreachable. Only deep integrity checks are available for SQLite.",
    output: ArgType.Boolean,
    unwrap: false,
    async execute(_ctx) {
        const result = await DataBase.checkHealth()
        return this.success(!result.healthy)
    },
})

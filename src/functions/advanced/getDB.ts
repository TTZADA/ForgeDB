import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$getDB",
    version: "1.0.0",
    aliases: ["$getDataBase", "$getRecords"],
    description: "Returns all stored records in the database",
    output: ArgType.Json,
    unwrap: false,
    async execute(_ctx) {
        const all = await DataBase.getAll()
        const normalized = all.map((r) => ({
            identifier: r.identifier,
            name: r.name,
            id: r.id,
            type: r.type,
            value: r.value,
            guildId: r.guildId ?? null,
        }))
        return this.successJSON(normalized)
    },
})

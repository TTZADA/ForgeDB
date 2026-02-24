import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$resetAllCaches",
    version: "1.0.0",
    description: "Resets the TTL of all cache keys or specific ones, making them permanent",
    unwrap: true,
    brackets: false,
    args: [
        {
            name: "keys",
            description: "Comma-separated list of keys to reset (optional, resets all if omitted)",
            rest: true,
            type: ArgType.String,
            required: false,
        },
    ],
    async execute(_ctx, [keys]) {
        DataBase.resetAllCaches(keys?.length ? keys : undefined)
        return this.success()
    },
})

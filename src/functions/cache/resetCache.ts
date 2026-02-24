import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$resetCache",
    version: "1.0.0",
    description: "Resets the TTL of a specific cache key, making it permanent",
    output: ArgType.Boolean,
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "key",
            description: "The cache key to reset",
            rest: false,
            type: ArgType.String,
            required: true,
        },
    ],
    async execute(_ctx, [key]) {
        return this.success(DataBase.resetCache(key))
    },
})

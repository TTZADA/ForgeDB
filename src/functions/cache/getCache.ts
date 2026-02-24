import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$getCache",
    version: "1.0.0",
    description: "Gets a value from the in-memory cache",
    output: ArgType.String,
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "key",
            description: "The cache key",
            rest: false,
            type: ArgType.String,
            required: true,
        },
        {
            name: "default",
            description: "Default value if key is not found or expired",
            rest: false,
            type: ArgType.String,
            required: false,
        },
    ],
    async execute(_ctx, [key, def]) {
        const value = DataBase.getCache(key)
        return this.success(value ?? def ?? null)
    },
})

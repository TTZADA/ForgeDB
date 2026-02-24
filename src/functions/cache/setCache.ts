import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$setCache",
    version: "1.0.0",
    description: "Sets a value in the in-memory cache with an optional TTL in milliseconds",
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
            name: "value",
            description: "The value to cache",
            rest: false,
            type: ArgType.String,
            required: true,
        },
        {
            name: "ttl",
            description: "Time to live in milliseconds (optional)",
            rest: false,
            type: ArgType.Number,
            required: false,
        },
    ],
    async execute(_ctx, [key, value, ttl]) {
        DataBase.setCache(key, value, ttl ?? undefined)
        return this.success()
    },
})

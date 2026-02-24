import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$deleteCache",
    version: "1.0.0",
    description: "Deletes a specific key from the in-memory cache",
    output: ArgType.Boolean,
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "key",
            description: "The cache key to delete",
            rest: false,
            type: ArgType.String,
            required: true,
        },
    ],
    async execute(_ctx, [key]) {
        return this.success(DataBase.deleteCache(key))
    },
})

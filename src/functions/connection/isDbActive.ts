import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$isDbActive",
    version: "1.0.0",
    description: "Returns whether the database connection is currently active",
    output: ArgType.Boolean,
    unwrap: false,
    async execute(_ctx) {
        return this.success(DataBase.isActive())
    },
})

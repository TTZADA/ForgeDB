import { NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$wipeCaches",
    version: "1.0.0",
    description: "Completely clears the in-memory cache",
    unwrap: false,
    async execute(_ctx) {
        DataBase.wipeCaches()
        return this.success()
    },
})

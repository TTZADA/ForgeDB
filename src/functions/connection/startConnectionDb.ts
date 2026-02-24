import { NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$startConnectionDb",
    version: "1.0.0",
    description: "Starts or restores the database connection",
    unwrap: false,
    async execute(_ctx) {
        await DataBase.startConnection()
        return this.success()
    },
})

import { NativeFunction } from "@tryforge/forgescript"
import { DataBase } from "../../util"

export default new NativeFunction({
    name: "$closeConnectionDb",
    version: "1.0.0",
    description: "Closes the current database connection",
    unwrap: false,
    async execute(_ctx) {
        await DataBase.closeConnection()
        return this.success()
    },
})

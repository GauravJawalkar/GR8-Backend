import { app } from "./app.js";
import connectDB from "./db/index.js";
const PORT = process.env.PORT


connectDB().then(() => {
    app.listen(PORT || 8000, () => {
        console.log(`⚙️${' '} Server is running at port : ${PORT}`)
    })
}).catch((err) => {
    console.log("Failed to connect mongodb", err)
})
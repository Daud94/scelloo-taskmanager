const port = process.env.PORT || 3000;
import app from './app.js';
import db from "./database/models/index.js"

app.listen(port, async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (e) {
        console.error("Unable to connect to the database:", e.message)
    }
})
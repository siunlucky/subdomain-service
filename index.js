const app = require("./app");
require("dotenv").config();

const PORT = 3876;


app.listen(PORT, () => {
    console.log(`POS running on: http://localhost:${PORT}`);
});

const express = require("express");
const app = express();
require("dotenv").config();
// const db = require("./config/db");
const cors = require("cors");
// db();
app.use(cors());
app.use(express.json({limit: '50mb'}));

app.use(express.static(`${__dirname}`));

app.get("/", (req, res) => res.send("Home"));

app.use("/entry", require("./routes/entryRoutes"));
app.use("/nft", require("./routes/nftRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/merch", require("./routes/merchRoutes"));
app.use("/trade", require("./routes/tradeRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/currency", require("./routes/currencyRoutes"));

app.listen(process.env.PORT || 4000, () => console.log("APP RUNNING"));

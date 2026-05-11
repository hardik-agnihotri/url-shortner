const express = require("express");
const { urlShortner } = require("../controller/urlController");

const router = express.Router();

router.post("/shorten",urlShortner);
// router.get("/:shorcode",);
// router.get("/analytics/:shortcode",);
// router.delete("/:shortcode",);

module.exports = router
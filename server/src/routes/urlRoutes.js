const express = require("express");
const { urlShortner, getRedirect } = require("../controller/urlController");

const router = express.Router();

router.post("/shorten",urlShortner);
router.get("/:shortCode",getRedirect);
// router.get("/analytics/:shortcode",);
// router.delete("/:shortcode",);

module.exports = router
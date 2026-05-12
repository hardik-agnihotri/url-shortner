const express = require("express");
const { urlShortner, getRedirect, getAnalytics } = require("../controller/urlController");

const router = express.Router();

router.post("/shorten",urlShortner);
router.get("/:shortCode",getRedirect);
router.get("/analytics/:shortCode",getAnalytics);
// router.delete("/:shortcode",);

module.exports = router
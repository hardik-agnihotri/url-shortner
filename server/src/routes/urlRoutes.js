const express = require("express");
const { urlShortner, getRedirect, getAnalytics, deleteUrl } = require("../controller/urlController");

const router = express.Router();

router.post("/shorten",urlShortner);
router.get("/:shortCode",getRedirect);
router.get("/analytics/:shortCode",getAnalytics);
router.delete("/:shortCode",deleteUrl);

module.exports = router
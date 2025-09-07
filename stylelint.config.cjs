module.exports = {
  extends: ["stylelint-config-standard"],
  rules: {
    "no-duplicate-selectors": true,   // keep this ON (real error)
    "block-no-empty": true,           // keep this ON (real error)
    "color-no-invalid-hex": true,     // keep this ON (real error)

    // turn OFF style-only rules (formatting)
    "block-opening-brace-space-before": null,
    "declaration-colon-space-after": null,
    "declaration-block-trailing-semicolon": null,
  },
};

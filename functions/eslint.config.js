const js = require("@eslint/js"),
	globals = require("globals");

module.exports = [
	js.configs.recommended,
	{
		ignores: [
			"**/node_modules/**",
			"**/tf_js-pothole_classification_edge/**"
		]
	},
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "commonjs",
			globals: {
				...globals.node,
				...globals.es2021
			}
		},
		rules: {
			"quotes": ["error", "double"],
			"no-tabs": 0,
			"indent": ["error", "tab"],
			"one-var": ["error", "consecutive"],
			"comma-dangle": ["error", "never"],
			"max-len": ["error", {
				"code": 120,
				"tabWidth": 4,
				"comments": 120,
				"ignoreUrls": true
			}],
			"space-before-function-paren": ["error", { "named": "never" }]
		}
	}
];

module.exports = {
	extends: ["eslint:recommended", "plugin:react/recommended", "plugin:prettier/recommended"],
	rules: {
		"max-len": ["error", { code: 120, ignoreImports: true }],
		"import/newline-after-import": ["error", { count: 1 }],
		"import/order": [
			"error",
			{
				groups: [["builtin", "external", "internal"]],
				"newlines-between": "never"
			}
		]
	}
};

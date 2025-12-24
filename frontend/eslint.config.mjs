import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
    {
        ignores: [".next/**", "node_modules/**", "out/**", ".turbo/**"],
    },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "no-unused-vars": "off", // Too noisy, disable for now
            "no-console": "off",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "off", // Too noisy, disable for now
            "no-console": "off",
        },
    },
];

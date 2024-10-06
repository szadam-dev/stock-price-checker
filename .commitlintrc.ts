export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            ["build", "feat", "fix", "docs", "chore", "style", "refactor", "ci", "test", "revert", "perf"],
        ],
    },
};

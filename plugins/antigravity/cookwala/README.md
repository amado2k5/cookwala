# Cookwala for Antigravity

Search the Cookwala recipe catalog, scale ingredients, compare dishes, make shopping lists and plan meals. Includes cooking-with-kids filters and read-only tools for the cooking standard.

## Install locally

Requires Node.js 20 or later, npm/npx, internet access and the target client.
Run from the Cookwala repository root:

```sh
agy plugin install ./plugins/antigravity/cookwala
```

Restart the client and check its MCP/extension or plugin list. Enable Cookwala if prompted. No Cookwala account or API key is needed. The MCP server runs locally and reads public catalog data from cookwala.ai. The client provider's own data policies also apply.

## Try it

- Find Egyptian vegetarian recipes taking under 45 minutes.
- Scale one result to six people and show its ingredients.
- Find Cooking with Kids recipes for a four-year-old and identify grown-up tasks.
- Build a shopping list from two recipes returned by the search.

## Limits

Tools are read-only and cannot control devices or start cooking. V0 recipes are described, not machine-verified. Nutrition and cost are estimates; dietary and allergen screens are not certifications. Some collections withhold step wording: preserve source links and do not invent it.

Website: https://cookwala.ai/
Support: https://github.com/amado2k5/cookwala/issues
Source: https://github.com/amado2k5/cookwala
Code license: Apache-2.0. Recipe rights remain collection-specific.

This development package uses the latest published @cookwala/mcp. Verify and pin a tested npm version before a public release. See plugins/GOOGLE-RELEASE.md in the source repository for publication steps and outstanding checks.

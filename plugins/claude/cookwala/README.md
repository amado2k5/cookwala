# Cookwala

Find, scale and plan recipes from the open [Cookwala](https://cookwala.ai) catalog, from a conversation with Claude. The
catalog holds more than 2,000 recipes, mostly Egyptian and Middle Eastern, plus Mexican, Japanese, Moroccan, Chinese, French,
Vietnamese, Indian, Korean, Iranian, Italian, Spanish, Greek and Ethiopian dishes, and 50 easy recipes to cook with children.

## Use it

Install the plugin, then ask in plain words:

- "How do I cook béchamel?"
- "High-protein vegetarian dinners under 500 kcal per serving."
- "What can I make with lentils, rice and onions?"
- "Plan a 1,800 kcal day without dairy and give me one shopping list."
- "Easy recipes I can cook with a 6-year-old."

Claude searches the catalog, shows a short list, then gives ingredients and steps for the dish you pick. Recipes can be scaled
to a number of people, and titles are available in many languages. The plugin has two skills, `cookwala-recipes` (the workflow
and the honesty rules) and `cookwala-get-started` (a short introduction), and one connector, `cookwala`.

## The connector

`.mcp.json` points at the public, read-only Cookwala MCP endpoint, `https://mcp.cookwala.ai/open/mcp`. It needs no account, no
sign-in and no API key. Every tool is read-only. On claude.ai and in Cowork, add it from the plugin's **Connectors** tab.

## Data

The plugin sends only what you type into a search or a recipe request (for example ingredients, a diet, or a recipe id) to
`mcp.cookwala.ai`. Cookwala keeps no accounts, collects no personal data and has no telemetry of its own.
Two tools, `fifi_search` and `fifi_source`, fetch public pages from fifi.cooking, the source of most recipes. The hosted endpoint is listed on
mcprush.com, which counts calls to it; Cookwala's own code collects nothing. Privacy policy:
https://cookwala.ai/privacy/ · Terms: https://cookwala.ai/terms/ · Support: https://cookwala.ai/contribute/#contact

## What it will not do

- Diet, allergen and diabetic labels are screens from ingredient names and reviewed claims. They are not certifications,
  guarantees or medical advice. Read product labels and ask a clinician or dietitian.
- Nutrition and cost are modelled estimates.
- It cannot start, stop or control an oven or any kitchen device.

Source and issues: https://github.com/amado2k5/cookwala · License: Apache-2.0

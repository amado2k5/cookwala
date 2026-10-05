using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;

namespace Cookwala.Samples
{
    /// <summary>
    /// The bundled snapshot: envelopes, heat bands, limits, four recipes, four devices, expected answers.
    /// Regenerated from the repository by samples/tools/build_bundle.py and embedded in this assembly; never edited by hand.
    /// Callers get the shared, cached document: treat it as read-only and <see cref="J.Clone{T}"/> anything you change.
    /// </summary>
    public static class Bundle
    {
        private static readonly Lazy<JsonObject> Cached = new Lazy<JsonObject>(Read);

        /// <summary>The whole bundle (cached).</summary>
        public static JsonObject Load() => Cached.Value;

        /// <summary>Operation id → {label, executable, envelope}.</summary>
        public static JsonObject Ops => (JsonObject)Load()["ops"]!;
        /// <summary>Heat level → pan-surface {min, max} °C.</summary>
        public static JsonObject HeatBands => (JsonObject)Load()["heatBands"]!;
        /// <summary>The default SafetyLimits pack.</summary>
        public static JsonObject SafetyLimits => (JsonObject)Load()["safetyLimits"]!;
        /// <summary>Recipe key → recipe document.</summary>
        public static JsonObject Recipes => (JsonObject)Load()["recipes"]!;
        /// <summary>Device key → capabilities document.</summary>
        public static JsonObject Devices => (JsonObject)Load()["devices"]!;
        /// <summary>The pinned instant used for calibration, mandate expiry and the simulated clock.</summary>
        public static string Now => J.S(Load(), "now")!;
        /// <summary>The Core version the bundle was built for.</summary>
        public static string Core => J.S(Load(), "core")!;

        private static JsonObject Read()
        {
            using var s = typeof(Bundle).Assembly.GetManifestResourceStream("Cookwala.Samples.bundle.json")
                ?? throw new InvalidOperationException("embedded resource Cookwala.Samples.bundle.json is missing");
            using var r = new StreamReader(s);
            return J.ParseObject(r.ReadToEnd());
        }

        /// <summary>Find a recipe by global reference (cw:cookwala.ai:example-shakshuka), document id or bundle key.</summary>
        public static JsonObject? RecipeByRef(JsonObject recipes, string gref)
        {
            var rid = gref.Split(':').Last().Split('#').Last();
            foreach (var kv in recipes)
                if (kv.Value is JsonObject doc && (rid == kv.Key || rid == J.S(doc, "id"))) return doc;
            return null;
        }

        /// <summary>Find a recipe by reference in one document.</summary>
        public static bool RefMatches(JsonObject recipe, string gref) => RecipeByRef(new JsonObject { ["r"] = recipe.DeepClone() }, gref) != null;

        /// <summary>The recipe's global reference: <c>cw:cookwala.ai:&lt;id&gt;</c>.</summary>
        public static string GlobalRef(JsonObject recipe) => $"cw:cookwala.ai:{J.S(recipe, "id")}";

        /// <summary>Every allergen the recipe declares, in any scheme, plus per-ingredient allergens.</summary>
        public static HashSet<string> RecipeAllergens(JsonObject? recipe)
        {
            var present = new HashSet<string>(StringComparer.Ordinal);
            var declared = J.Get(J.O(recipe, "safety"), "allergens");
            if (declared is JsonObject d)
            {
                foreach (var kv in d)
                    if (kv.Value is JsonArray lst) foreach (var x in lst) if (J.Str(x) is string s) present.Add(s);
            }
            else if (declared is JsonArray lst)
            {
                foreach (var x in lst) if (J.Str(x) is string s) present.Add(s);
            }
            foreach (var ing in J.Items(recipe, "ingredients"))
                foreach (var s in J.Strings(ing, "allergens")) present.Add(s);
            return present;
        }
    }
}

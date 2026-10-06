import unittest

from cookwala import catalog


class CatalogTest(unittest.TestCase):
    def test_search_finds_example_across_languages(self):
        hits, total = catalog.search('koshari', cuisine='EG', level='V1')
        self.assertEqual([h['id'] for h in hits], ['example-koshari'])
        self.assertTrue(catalog.search('شكشوكة')[0])

    def test_get_and_render(self):
        d = catalog.load('shakshuka')
        self.assertIn('Ingredients', catalog.render(d))

    def test_cooklang_export(self):
        out = catalog.to_cooklang(catalog.load('shakshuka'))
        self.assertTrue(out.startswith('>> title: Shakshuka'))
        self.assertIn('@egg chicken large{6%pcs}', out)
        self.assertIn('not included', out)

    def test_facts_only_recipe_exports(self):
        hits, _ = catalog.search('', limit=1, level='V0')
        self.assertIn('@', catalog.to_cooklang(catalog.load(hits[0]['id'])))

    def test_schema_org(self):
        self.assertEqual(catalog.to_schema_org(catalog.load('shakshuka'))['@type'], 'Recipe')


if __name__ == '__main__':
    unittest.main()

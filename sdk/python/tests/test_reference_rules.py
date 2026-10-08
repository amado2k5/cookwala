"""Reference-library rules added for BACKLOG P-12 (timestamps fail closed) and P-16 (authoring rules)."""
import copy
import json
import unittest

from cookwala import ROOT, ref


def shakshuka():
    return json.loads((ROOT / 'examples' / 'shakshuka.cookwala.json').read_text())


class TimestampTest(unittest.TestCase):
    def test_rfc3339_only(self):
        self.assertEqual(ref._time('2026-10-07T12:00:00Z').year, 2026)
        for bad in ('2026-10-07', '2026-10-07T12:00:00', 'tomorrow', None, 42):
            with self.assertRaises(ValueError, msg=bad):
                ref._time(bad)

    def test_unreadable_calibration_is_not_trusted(self):
        caps = {'capabilities': {'sensors': [{'sensor': 'cw.sense.oil_temp', 'calibration': {'validUntil': 'soon'}}, {'sensor': 'cw.sense.liquid_temp'}]}}
        self.assertEqual(ref.trusted_sensors(caps, '2026-10-07T00:00:00Z'), {'cw.sense.liquid_temp'})
        with self.assertRaises(ValueError):
            ref.trusted_sensors(caps, 'yesterday')

    def test_format_checker(self):
        fc = ref.format_checker()
        self.assertTrue(fc.conforms('2026-10-07T12:00:00+03:00', 'date-time'))
        self.assertFalse(fc.conforms('2026-10-07', 'date-time'))
        self.assertTrue(fc.conforms('https://cookwala.ai/', 'uri'))
        self.assertFalse(fc.conforms('cookwala dot ai', 'uri'))


class AuthoringRulesTest(unittest.TestCase):
    def test_durations(self):
        self.assertEqual(ref.duration_seconds('PT1H30M'), 5400)
        self.assertEqual(ref.duration_seconds('P1DT2S'), 86402)
        for bad in ('PT', 'P', '1h', None):
            self.assertIsNone(ref.duration_seconds(bad))

    def test_time_window(self):
        d = shakshuka()
        node = next(n for n in d['process']['nodes'] if n.get('until'))
        bad = copy.deepcopy(d)
        bn = next(n for n in bad['process']['nodes'] if n['id'] == node['id'])
        bn['until'].update(minTime='PT2H', maxTime='PT1M')
        self.assertIn((node['id'], 'minTime PT2H is longer than maxTime PT1M'), ref.recipe_rule_problems(bad))
        bn['until'].update(minTime='PT1M', maxTime='PT10M', nominalTime='PT20M')
        self.assertTrue(any('nominalTime' in m for _, m in ref.recipe_rule_problems(bad)))

    def test_envelope_numbers(self):
        d = copy.deepcopy(shakshuka())
        node = next(n for n in d['process']['nodes'] if 'tempC' in ((ref._vocab('ops')[n['op']].get('envelope')) or {}))
        band = ref._vocab('ops')[node['op']]['envelope']['tempC']
        node.setdefault('params', {})['tempC'] = band['max'] + 50
        self.assertTrue(any(nid == node['id'] and 'outside' in m for nid, m in ref.recipe_rule_problems(d)))


if __name__ == '__main__':
    unittest.main()

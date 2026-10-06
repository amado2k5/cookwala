"""The service may run as a public function, so it must never reach another host: every endpoint
is exercised with outbound sockets disabled. Run: python -m unittest discover -s tests"""
import json
import pathlib
import socket
import sys
import unittest
from unittest.mock import patch

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from cookwala_samples.service import handle, handle_raw  # noqa: E402


def _no_network(*a, **kw):
    raise AssertionError('the service tried to open a network connection')


class ServiceIsolationTest(unittest.TestCase):
    """A deployed function serves only its own simulated devices."""

    CALLS = [
        ('GET', '/health', b''),
        ('GET', '/v1/samples', b''),
        ('GET', '/v1/samples/demo?format=markdown', b''),
        ('GET', '/v1/samples/demo?format=csv', b''),
        ('POST', '/v1/samples/gates', json.dumps({'recipe': 'koshari', 'device': 'demo-hob-robot-basic', 'humanPresent': True}).encode()),
        ('POST', '/v1/samples/plan', json.dumps({'order': {'dish': 'koshari'}, 'humanPresent': True}).encode()),
        ('POST', '/v1/samples/run', json.dumps({'jobs': [{'id': 'j1', 'order': {'dish': 'lentil-soup'}, 'humanPresent': True}]}).encode()),
        ('POST', '/v1/samples/run?format=json', json.dumps({'jobs': [{'order': {'dish': 'koshari'}}], 'faults': {'example-koshari#n14': 'overheat'}}).encode()),
    ]

    def test_no_endpoint_contacts_another_host(self):
        with patch.object(socket, 'socket', _no_network), \
             patch.object(socket, 'create_connection', _no_network):
            for method, url, body in self.CALLS:
                with self.subTest(url=url):
                    status, ctype, text = handle_raw(method, url, body)
                    self.assertLess(status, 500, f'{method} {url} -> {status}: {text[:200]}')

    def test_every_answer_is_simulated(self):
        status, _, text = handle('GET', '/v1/samples')
        self.assertEqual(status, 200)
        self.assertIn('simulated devices', text)


if __name__ == '__main__':
    unittest.main()

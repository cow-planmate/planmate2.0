import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule } from 'node:vm';

// Exercise the real connection entry point under missing and stale build settings.
// No STOMP/SockJS dependency is available to this module linker.
for (const setting of [undefined, 'stomp', 'proto']) {
  test(`editor uses raw WebSocket when VITE_SYNC_TRANSPORT=${setting}`, async () => {
    const calls = [];
    const sent = [];
    let connected = false;
    const adapter = { active: true, connected: true, publish: (message) => sent.push(message), deactivate() { this.active = false; } };
    const store = { getState: () => ({ setConnected: () => { connected = true; }, setDisconnected: () => { connected = false; } }), subscribe: () => () => {} };
    const originalStorage = globalThis.localStorage;
    globalThis.localStorage = { getItem: () => 'test-token' };
    try {
      const source = await readFile(new URL('../src/websocket/client.jsx', import.meta.url), 'utf8');
      const module = new SourceTextModule(source, {
        initializeImportMeta(meta) { meta.env = { VITE_API_URL: 'https://api.example.test', VITE_SYNC_TRANSPORT: setting }; },
      });
      await module.link((specifier) => {
        if (specifier === './protoClient') return new SyntheticModule(['createProtoClient'], function () {
          this.setExport('createProtoClient', (options) => { calls.push(options); return adapter; });
        });
        if (specifier.startsWith('../store/')) return new SyntheticModule(['default'], function () { this.setExport('default', store); });
        if (specifier === '../utils/createUtils') return new SyntheticModule(['convertBlock'], function () { this.setExport('convertBlock', (value) => value); });
        throw new Error(`Unexpected transport dependency: ${specifier}`);
      });
      await module.evaluate();
      module.namespace.initSyncClient('plan-123');
      assert.equal(calls.length, 1);
      assert.equal(calls[0].roomId, 'plan-123');
      assert.equal(calls[0].baseUrl, 'https://api.example.test');
      calls[0].onConnect(); assert.equal(connected, true);
      calls[0].onDisconnect(); assert.equal(connected, false);
      module.namespace.sendUndo('plan-123');
      assert.equal(JSON.parse(sent[0].body).action, 'undo');
      module.namespace.disconnectSyncClient();
      assert.equal(adapter.active, false);
    } finally { globalThis.localStorage = originalStorage; }
  });
}

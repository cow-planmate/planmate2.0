import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import protobuf from 'protobufjs';
import { createProtoClient } from '../src/websocket/protoClient.js';

const text = await readFile(new URL('./fixtures/minimal-sync.proto', import.meta.url), 'utf8');
const root = protobuf.parse(text).root.resolveAll();
const ServerFrame = root.lookupType('qa.sync.ServerFrame');
const ClientFrame = root.lookupType('qa.sync.ClientFrame');

test('raw adapter authenticates, joins and edits using binary protobuf, then reconnects', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalWebSocket = globalThis.WebSocket;
  const sockets = [];
  const requests = [];
  class FakeWebSocket {
    static OPEN = 1;
    readyState = 1;
    frames = [];
    constructor(url, protocols) { this.url = url; this.protocols = protocols; sockets.push(this); }
    send(bytes) { assert(bytes instanceof Uint8Array); this.frames.push(ClientFrame.decode(bytes)); }
    close() { this.readyState = 3; this.onclose?.(); }
    receive(frame) { this.onmessage({ data: ServerFrame.encode(ServerFrame.fromObject(frame)).finish() }); }
  }
  globalThis.WebSocket = FakeWebSocket;
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response(text); };
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let connected = 0;
  let disconnected = 0;
  const client = createProtoClient({
    baseUrl: 'https://api.example.test', token: 'dummy-token', roomId: 'plan-123',
    onConnect: () => connected++, onDisconnect: () => disconnected++,
  });
  try {
    const deadline = Date.now() + 2000;
    while (!sockets.length && Date.now() < deadline) await new Promise(setImmediate);
    assert.equal(sockets.length, 1);
    const socket = sockets[0];
    assert.deepEqual(requests, [{ url: 'https://api.example.test/ws/schema.proto', options: { credentials: 'include' } }]);
    assert.equal(socket.url, 'wss://api.example.test/ws/v2');
    assert.deepEqual(socket.protocols, ['sharedsync.v1', 'bearer.dummy-token']);
    assert(!socket.url.includes('dummy-token'));
    socket.receive({ hello: { schemaHash: 'server-announced-hash' } });
    assert.equal(client.connected, true);
    assert.equal(connected, 1);
    assert.equal(socket.frames[0].join.roomId, 'plan-123');
    assert.equal(socket.frames[0].join.schemaHash, createHash('sha256').update(text).digest('hex').slice(0, 16));
    client.publish({ body: JSON.stringify({ entity: 'plan', action: 'update', eventId: 'event-1', planDtos: [{ planId: 'plan-123', planName: '부산' }] }) });
    assert.equal(socket.frames[1].sync.plans.items[0].planName, '부산');
    socket.close();
    assert.equal(client.connected, false);
    assert.equal(disconnected, 1);
    t.mock.timers.tick(3000);
    assert.equal(sockets.length, 2);
    assert.equal(sockets[1].url, 'wss://api.example.test/ws/v2');
  } finally {
    client.deactivate();
    t.mock.timers.reset();
    globalThis.fetch = originalFetch;
    globalThis.WebSocket = originalWebSocket;
  }
});

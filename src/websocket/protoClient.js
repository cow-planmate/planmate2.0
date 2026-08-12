import protobuf from "protobufjs";

/**
 * raw WebSocket + protobuf 전송 어댑터.
 *
 * STOMP Client 와 **같은 인터페이스**(connected / active / publish / deactivate)를 노출한다.
 * 그래서 호출부(Main.jsx, DaySelectorModal.jsx, ResizableScheduledItem.jsx …)는 한 줄도 바뀌지
 * 않는다 — 그쪽은 `getClient().publish({ destination, body })` 만 쓴다.
 *
 * 코드 생성(buf/protoc)을 하지 않는다. 서버가 `/ws/schema.proto` 로 스키마를 내려주므로 런타임에
 * 파싱한다. 빌드 파이프라인을 건드리지 않아도 되고, 스키마 스큐도 구조적으로 생기지 않는다
 * (서버가 준 그 스키마로 인코딩하니까).
 */

/** BigDecimal 은 wire 에서 문자열이다. 앱은 숫자를 기대하므로 되돌린다. */
const DECIMAL_FIELDS = new Set(["latitude", "longitude"]);

/** BlockCategory -> BLOCK_CATEGORY (proto enum 값 접두사 규칙) */
const enumPrefix = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();

export function createProtoClient({ baseUrl, token, roomId, onSync, onPresence, onConnect, onDisconnect }) {
  let ws = null;
  let schema = null;
  let disposed = false;
  let reconnectTimer = null;

  // STOMP Client 흉내. 호출부가 보는 표면은 이 세 가지뿐이다.
  const adapter = {
    connected: false,
    active: true,
    publish,
    deactivate,
  };

  start();
  return adapter;

  // ==========================================
  // 연결
  // ==========================================

  async function start() {
    try {
      if (!schema) {
        schema = await loadSchema(baseUrl);
      }
      connect();
    } catch (error) {
      console.error("❌ [proto] 스키마 로드 실패:", error);
      scheduleReconnect();
    }
  }

  function connect() {
    if (disposed) return;

    const url = `${baseUrl.replace(/^http/, "ws")}/ws/v2`;
    // 토큰을 쿼리스트링이 아니라 서브프로토콜로 보낸다. URL 은 액세스 로그에 그대로 남는다.
    ws = new WebSocket(url, ["sharedsync.v1", `bearer.${token}`]);
    ws.binaryType = "arraybuffer";

    ws.onmessage = (event) => handleFrame(new Uint8Array(event.data));

    ws.onclose = () => {
      adapter.connected = false;
      if (!disposed) {
        console.log("🔌 [proto] 연결 종료 — 재연결 예약");
        onDisconnect?.();
        scheduleReconnect();
      }
    };

    ws.onerror = (error) => console.error("❌ [proto] 소켓 오류:", error);
  }

  function scheduleReconnect() {
    if (disposed || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      start();
    }, 3000);
  }

  function deactivate() {
    disposed = true;
    adapter.active = false;
    adapter.connected = false;
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
    ws?.close();
  }

  // ==========================================
  // 수신
  // ==========================================

  function handleFrame(bytes) {
    const frame = schema.ServerFrame.decode(bytes);

    switch (frame.frame) {
      case "hello":
        // **내가 인코딩에 쓴 스키마의 해시**를 주장한다. 서버가 준 값을 그대로 되돌려주면
        // 검사가 항상 통과해 스키마 스큐 검사 자체가 무력해진다 — 캐시된 옛 스키마로 인코딩하는
        // 상황이 바로 그 검사가 막으려던 것이다.
        send({ join: { roomId, schemaHash: schema.hash } });
        adapter.connected = true;
        console.log("✅ [proto] 연결 완료 (client schema %s / server %s)", schema.hash, frame.hello.schemaHash);
        onConnect?.();
        break;

      case "sync":
        onSync?.(toSyncBody(frame.sync));
        break;

      case "presence":
        onPresence?.(schema.PresenceEvent.toObject(frame.presence, { enums: String, defaults: true }));
        break;

      case "error":
        // 재시도해도 되는 것과 아닌 것이 섞여 있다. docs/wire-protocol.md 참고.
        console.error(`❌ [proto] 서버 오류 ${frame.error.code}: ${frame.error.message}`);
        if (frame.error.code === "NOT_JOINED") {
          send({ join: { roomId, schemaHash: schema.hash } });
        } else if (frame.error.code === "SCHEMA_MISMATCH") {
          // 서버가 배포되며 스키마가 바뀌었다. 캐시를 버리고 다시 받아야 한다 —
          // 그대로 재연결하면 같은 이유로 계속 끊긴다.
          console.warn("⚠️ [proto] 서버 스키마가 바뀌었다. 스키마를 다시 받는다.");
          schema = null;
        }
        break;

      case "pong":
        break;
    }
  }

  /** SyncEvent -> 기존 핸들러가 받던 JSON 모양 그대로. */
  function toSyncBody(event) {
    const arm = event.payload; // oneof 로 설정된 필드명 (예: timeTablePlaceBlocks)
    const entity = schema.entityByArm[arm];
    const body = {
      eventId: event.eventId,
      action: stripActionPrefix(schema.SyncEvent.fields.action.resolvedType.valuesById[event.action]),
      isUndoRedo: event.isUndoRedo,
    };

    if (entity) {
      body.entity = entity.key;
      body[entity.dtoKey] = (event[arm]?.items ?? []).map((item) => decodeDto(entity.itemType, item));
    }
    return body;
  }

  // ==========================================
  // 송신
  // ==========================================

  /** STOMP 의 publish 와 같은 시그니처. body 는 기존 호출부가 만든 JSON 문자열이다. */
  function publish({ body }) {
    if (!adapter.connected) return;

    const message = typeof body === "string" ? JSON.parse(body) : body;
    const action = String(message.action ?? "").toLowerCase();

    const request = {
      eventId: message.eventId ?? "",
      action: `SYNC_ACTION_${action.toUpperCase()}`,
    };

    // undo/redo 는 페이로드 없이 action 만 보낸다.
    if (action !== "undo" && action !== "redo") {
      const entity = schema.entityByKey[String(message.entity ?? "").toLowerCase()];
      if (!entity) {
        console.warn("⚠️ [proto] 스키마에 없는 엔티티:", message.entity);
        return;
      }
      const dtos = message[entity.dtoKey] ?? [];
      request[entity.arm] = { items: dtos.map((dto) => encodeDto(entity.itemType, dto)) };
    }

    send({ sync: request });
  }

  function send(clientFrame) {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(schema.ClientFrame.encode(schema.ClientFrame.fromObject(clientFrame)).finish());
  }

  // ==========================================
  // DTO 변환
  // ==========================================

  /**
   * 앱 객체 -> proto 메시지.
   *
   * **설정하지 않은 필드는 서버에서 보존된다.** 그래서 undefined/null 은 넣지 않는다 —
   * 빈 문자열이나 0 을 넣으면 그 값으로 덮인다.
   */
  function encodeDto(type, dto) {
    const plain = {};
    for (const field of type.fieldsArray) {
      const value = dto[field.name];
      if (value === undefined || value === null) continue;

      if (field.resolvedType instanceof protobuf.Enum) {
        plain[field.name] = withEnumPrefix(field.resolvedType, value);
      } else if (DECIMAL_FIELDS.has(field.name)) {
        plain[field.name] = String(value);
      } else {
        plain[field.name] = value;
      }
    }
    return type.fromObject(plain);
  }

  /** proto 메시지 -> 앱 객체. 기존 JSON 페이로드와 같은 타입이 되도록 되돌린다. */
  function decodeDto(type, message) {
    // longs: Number — int64 를 그대로 두면 Long 객체가 되어 비교·연산이 전부 깨진다.
    const object = type.toObject(message, { enums: String, longs: Number, defaults: false });

    for (const field of type.fieldsArray) {
      const value = object[field.name];
      if (value === undefined) continue;

      if (field.resolvedType instanceof protobuf.Enum) {
        object[field.name] = stripEnumPrefix(field.resolvedType, value);
      } else if (DECIMAL_FIELDS.has(field.name)) {
        object[field.name] = Number(value);
      }
    }
    return object;
  }

  function withEnumPrefix(enumType, value) {
    const prefix = `${enumPrefix(enumType.name)}_`;
    const name = String(value).toUpperCase();
    return name.startsWith(prefix) ? name : prefix + name;
  }

  function stripEnumPrefix(enumType, value) {
    const prefix = `${enumPrefix(enumType.name)}_`;
    const name = String(value);
    const stripped = name.startsWith(prefix) ? name.slice(prefix.length) : name;
    return stripped === "UNSPECIFIED" ? null : stripped;
  }

  function stripActionPrefix(value) {
    const name = String(value).replace(/^SYNC_ACTION_/, "").toLowerCase();
    return name === "unspecified" ? "" : name;
  }
}

// ==========================================
// 스키마 로드
// ==========================================

/** 서버(ProtoSchemaGenerator)와 같은 규칙: SHA-256 의 앞 8바이트를 소문자 16진수로. */
async function sha256Prefix(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * 서버가 서빙하는 .proto 를 받아 런타임에 파싱한다.
 *
 * 엔티티 목록도 스키마에서 유도한다 — SyncRequest 의 payload oneof 에 있는 `<Entity>List` 들이
 * 그대로 엔티티 집합이다. 서버에 엔티티가 추가돼도 프론트 코드는 바뀌지 않는다.
 */
async function loadSchema(baseUrl) {
  const response = await fetch(`${baseUrl}/ws/schema.proto`);
  if (!response.ok) {
    throw new Error(`스키마 응답 ${response.status}`);
  }
  const text = await response.text();
  // 해시는 **직접 계산한다.** 응답 헤더(X-SharedSync-Schema-Hash)는 교차 출처에서 노출되지
  // 않아 브라우저에서는 null 이 되고, 그러면 빈 해시로 Join 해 SCHEMA_MISMATCH 가 난다.
  // 계약상으로도 "내가 인코딩에 쓴 바이트의 해시"를 주장하는 것이 맞다.
  const hash = await sha256Prefix(text);

  const parsed = protobuf.parse(text); // keepCase=false → 필드명이 camelCase 로 온다
  const root = parsed.root;
  // 이걸 빼면 field.resolvedType 이 전부 null 이라 enum·중첩 타입 처리가 통째로 죽는다.
  root.resolveAll();
  const pkg = parsed.package;
  const type = (name) => root.lookupType(`${pkg}.${name}`);

  const SyncRequest = type("SyncRequest");
  const entityByKey = {};
  const entityByArm = {};

  for (const field of SyncRequest.oneofsArray.find((o) => o.name === "payload").fieldsArray) {
    const listType = field.resolvedType ?? root.lookupType(`${pkg}.${field.type}`);
    const entityName = listType.name.replace(/List$/, ""); // TimeTablePlaceBlockList -> TimeTablePlaceBlock
    const camel = entityName.charAt(0).toLowerCase() + entityName.slice(1);
    const entry = {
      key: entityName.toLowerCase(), // 기존 wire 의 entity 문자열과 같다
      arm: field.name,
      dtoKey: `${camel}Dtos`, // 기존 wire 의 리스트 필드명과 같다
      itemType: listType.fields.items.resolvedType ?? type(entityName),
    };
    entityByKey[entry.key] = entry;
    entityByArm[entry.arm] = entry;
  }

  return {
    hash,
    ClientFrame: type("ClientFrame"),
    ServerFrame: type("ServerFrame"),
    SyncEvent: type("SyncEvent"),
    PresenceEvent: type("PresenceEvent"),
    entityByKey,
    entityByArm,
  };
}

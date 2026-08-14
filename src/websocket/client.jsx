import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import usePlanStore from "../store/Plan";
import useItemsStore from "../store/Schedules";
import useTimetableStore from "../store/Timetables";
import useUserStore from "../store/Users";
import useSocketStore from "../store/Socket";
import { convertBlock } from "../utils/createUtils";
import { createProtoClient } from "./protoClient";

let client;
let unsubscribePlanStore;
const checklistSyncListeners = new Set();

export const subscribeChecklistSync = (listener) => {
  checklistSyncListeners.add(listener);
  return () => {
    checklistSyncListeners.delete(listener);
  };
};

const planchecklistitem = (body) => {
  checklistSyncListeners.forEach((listener) => listener(body));
};

/**
 * 전송 계층 선택. 서버가 transport=both 로 두 경로를 동시에 서비스하므로, 문제가 생기면
 * 이 플래그만 되돌리면 된다(재배포 없이 .env 로).
 */
const USE_PROTO = import.meta.env.VITE_SYNC_TRANSPORT === "proto";

function isDifferentEventId(eventId) {
  const prevEventId = usePlanStore.getState().eventId;
  if (eventId != "" && prevEventId != "" && eventId !== prevEventId) {
    return true;
  }
  return false;
}

const plan = (body) => {
  const eventId = body.eventId;
  const data = body.planDtos || body.plans;
  if (!data) return;

  if (isDifferentEventId(eventId) || body.isUndoRedo) {
    usePlanStore.getState().setPlanAll(data[0]);
  }
}

const timetable = (body) => {
  const action = body.action;
  const data = body.timeTableDtos || body.timetables;
  if (!data) return;

  switch (action) {
    case "create":
      data.map((item) => {
        console.log(item)
        useTimetableStore.getState().setTimetableCreate(item);
      });
      break;
    case "update":
      data.map((item) => {
        useTimetableStore.getState().setTimetableUpdate(item);
      });
      break;
    case "delete":
      data.map((item) => {
        useTimetableStore.getState().setTimetableDelete(item.timeTableId);
      });
      break;
  }
}

const timetableplaceblock = (body) => {
  const eventId = body.eventId;
  const action = body.action;
  const data = body.timeTablePlaceBlockDtos || body.timetableplaceblocks;
  const isUndoRedo = body.isUndoRedo;

  // "create" 액션은 내가 보낸 것이라도 서버가 할당한 실제 ID를 받아와야 하므로 eventId 체크를 제외함
  if ((isDifferentEventId(eventId) || isUndoRedo || action === "create") && data) {
    switch (action) {
      case "create":
        data.map((item) => {
          const convert = convertBlock(item);
          if (convert) useItemsStore.getState().addItemFromWebsocket(convert);
        })
        break;
      case "update":
        data.map((item) => {
          const convert = convertBlock(item);
          if (convert) useItemsStore.getState().moveItemFromWebsocket(convert);
        })
        break;
      case "delete":
        data.map((item) => {
          const deleteId = item.blockId;
          useItemsStore.getState().deleteItem(deleteId, item.timeTableId);
        })
        break;
    }
  }
}

export const getClient = () => client;

export const sendUndo = (roomId) => {
  if (client && client.connected) {
    client.publish({
      destination: `/app/${roomId}`,
      body: JSON.stringify({ action: "undo" }),
    });
  }
};

export const sendRedo = (roomId) => {
  if (client && client.connected) {
    client.publish({
      destination: `/app/${roomId}`,
      body: JSON.stringify({ action: "redo" }),
    });
  }
};

export const disconnectStompClient = () => {
  unsubscribePlanStore?.();
  unsubscribePlanStore = undefined;

  if (client) {
    console.log("🔌 WebSocket 연결 종료 중...");
    client.deactivate();
    useSocketStore.getState().setDisconnected();
  }
};

export const initStompClient = (id) => {
  if (client && client.active) {
    console.log("⚠️ 이미 활성화된 WebSocket 클라이언트가 있습니다. 기존 연결을 종료합니다.");
    client.deactivate();
  }

  const token = localStorage.getItem('accessToken');
  const BASE_URL = import.meta.env.VITE_API_URL;

  // 편집/프레즌스 수신 처리는 두 전송이 공유한다 — 아래 핸들러들은 전송 방식을 모른다.
  const handleSync = (body) => {
    console.log("📩 [WebSocket] 수신 데이터 (Topic):", body);
    switch (String(body.entity ?? "").toLowerCase()) {
      case "plan":
        plan(body);
        break;
      case "timetable":
        timetable(body);
        break;
      case "timetableplaceblock":
        timetableplaceblock(body);
        break;
      case "planchecklistitem":
        planchecklistitem(body);
        break;
    }
  };

  const handlePresence = (body) => {
    console.log("👥 [WebSocket] 접속자 수신 데이터:", body);
    useUserStore.getState().setUserAll(body.users);
  };

  if (USE_PROTO) {
    // STOMP Client 와 같은 인터페이스를 노출하므로 아래 publish 호출부는 그대로다.
    client = createProtoClient({
      baseUrl: BASE_URL,
      token,
      roomId: id,
      onSync: handleSync,
      onPresence: handlePresence,
      onConnect: () => useSocketStore.getState().setConnected(),
      onDisconnect: () => useSocketStore.getState().setDisconnected(),
    });
    subscribePlanStore(id);
    return;
  }

  const SERVER_URL = `${BASE_URL}/ws?token=${encodeURIComponent(token)}`;
  console.log("🔄 WebSocket 연결 시도 중...", SERVER_URL);

  const socket = new SockJS(SERVER_URL);
  client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 3000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: (frame) => {
      console.log("✅ WebSocket 연결 완료:", frame);
      useSocketStore.getState().setConnected();

      client.subscribe(`/topic/${id}`, (message) => handleSync(JSON.parse(message.body)));
      client.subscribe(`/topic/plan-presence/${id}`, (message) => handlePresence(JSON.parse(message.body)));
    },

    onStompError: (frame) => {
      console.error("❌ STOMP 에러:", frame.headers["message"]);
      client.deactivate();
      useSocketStore.getState().setDisconnected();
    },

    // onWebSocketClose: () => {
    //   console.log("🔌 WebSocket 연결 종료");
    //   client.deactivate();
    // },
  });

  client.activate();
  subscribePlanStore(id);
}

/** 플랜 스토어 변경을 서버로 밀어 올린다. 전송 방식과 무관해 두 경로가 공유한다. */
function subscribePlanStore(id) {
  unsubscribePlanStore?.();
  unsubscribePlanStore = usePlanStore.subscribe((state, prevState) => {
    const payload = {
      planId: state.planId,
      planName: state.planName,
      destinationId: state.destinationId,
      adultCount: state.adultCount,
      childCount: state.childCount,
    };
    const prevPayload = {
      planId: prevState.planId,
      planName: prevState.planName,
      destinationId: prevState.destinationId,
      adultCount: prevState.adultCount,
      childCount: prevState.childCount,
    };

    if (JSON.stringify(payload) !== JSON.stringify(prevPayload)) {
      console.log(payload)
      if (client.connected && state.eventId) {
        const requestMsg = {
          "eventId": state.eventId,
          "action": "update",
          "entity": "plan",
          "planDtos": [{
            ...payload
          }]
        };
        console.log(requestMsg)
        client.publish({
          destination: `/app/${id}`,
          body: JSON.stringify(requestMsg),
        });
      }
    }
  });
}

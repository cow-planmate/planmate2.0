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

export const disconnectSyncClient = () => {
  unsubscribePlanStore?.();
  unsubscribePlanStore = undefined;

  if (client) {
    console.log("🔌 WebSocket 연결 종료 중...");
    client.deactivate();
    useSocketStore.getState().setDisconnected();
  }
};

export const initSyncClient = (id) => {
  if (client && client.active) {
    console.log("⚠️ 이미 활성화된 WebSocket 클라이언트가 있습니다. 기존 연결을 종료합니다.");
    client.deactivate();
  }

  const token = localStorage.getItem('accessToken');
  const BASE_URL = import.meta.env.VITE_API_URL;

  // raw WebSocket 프레임을 기존 편집/프레즌스 스토어에 반영한다.
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

  // 일정 편집과 AI 반영은 동일한 raw WebSocket 세션을 사용한다.
  // 환경변수가 누락되거나 예전 값이 남아 있어도 STOMP로 전환하지 않는다.
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
}

/** 플랜 스토어 변경을 서버로 밀어 올린다. raw WebSocket으로 전송한다. */
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

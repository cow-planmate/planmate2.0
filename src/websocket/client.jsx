import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import usePlanStore from "../store/Plan";
import useItemsStore from "../store/Schedules";
import useTimetableStore from "../store/Timetables";
import useUserStore from "../store/Users";
import useSocketStore from "../store/Socket";
import { convertBlock } from "../utils/createUtils";

let client;

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

      client.subscribe(`/topic/${id}`, (message) => {
        const body = JSON.parse(message.body);
        console.log("📩 [WebSocket] 수신 데이터 (Topic):", body);
        const entity = body.entity;

        switch (entity) {
          case "plan":
            plan(body);
            break;
          case "timetable":
            timetable(body);
            break;
          case "timetableplaceblock":
            timetableplaceblock(body);
            break;
        }
      });

      client.subscribe(`/topic/plan-presence/${id}`, (message) => {
        const body = JSON.parse(message.body);
        console.log("👥 [WebSocket] 접속자 수신 데이터:", body);
        useUserStore.getState().setUserAll(body.users);
      });
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

  usePlanStore.subscribe((state, prevState) => {
    if (JSON.stringify(state) !== JSON.stringify(prevState)) {
      const { eventId, setEventId, setPlanAll, setPlanField, ...payload } = state;
      console.log(payload)
      if (client.connected && eventId) {
        const requestMsg = {
          "eventId": eventId,
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
// 채팅 관련 전역 이벤트 버스
type ChatReadEventHandler = (roomId: number) => void;

class ChatEventBus {
  private chatReadHandlers: ChatReadEventHandler[] = [];

  // 채팅방 읽음 이벤트 구독
  subscribeToChatRead(handler: ChatReadEventHandler) {
    this.chatReadHandlers.push(handler);

    // 구독 해제 함수 반환
    return () => {
      const index = this.chatReadHandlers.indexOf(handler);
      if (index > -1) {
        this.chatReadHandlers.splice(index, 1);
      }
    };
  }

  // 채팅방 읽음 이벤트 발생
  emitChatRead(roomId: number) {
    this.chatReadHandlers.forEach((handler) => {
      try {
        handler(roomId);
      } catch (error) {
        console.error("ChatEventBus: 이벤트 핸들러 실행 중 에러:", error);
      }
    });
  }
}

// 싱글톤 인스턴스
export const chatEventBus = new ChatEventBus();

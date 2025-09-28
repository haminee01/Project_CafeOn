export interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  isMyMessage: boolean;
  senderId: string; // 새로 추가 (프로필 클릭을 위해)
}

export interface SendMessageDto {
  content: string;
}

export interface Conversation {
  id: number;
  doctorId?: number;
  doctorName?: string;
  doctorImage?: string;
  patientId?: string;
  patientName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  [key: string]: unknown;
}

export interface ChatMessage {
  id?: number;
  conversationId?: number;
  senderId?: string;
  senderType?: string; // 'Doctor' | 'Patient'
  content: string;
  sentAt?: string;
  isRead?: boolean;
  [key: string]: unknown;
}

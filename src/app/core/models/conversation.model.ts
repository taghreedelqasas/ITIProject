export interface SendMessageDto {
  content: string;
}

export interface AttachmentDto {
  contentType: string;
  contentDisposition: string;
  headers: { [key: string]: string[] };
  length: number;
  name: string;
  fileName: string;
  caption: string;
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
  senderUserId?: string;
  senderRole?: string;
  isMine?: boolean;
  content: string;
  createdAt?: string;
  isRead?: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  [key: string]: unknown;
}

export interface CreateReviewDto {
  doctorId: number;
  rating: number; // 1 - 5
  comment?: string | null;
}

export interface UpdateReviewDto {
  rating: number; // 1 - 5
  comment?: string | null;
}

export interface Review {
  id: number;
  doctorId?: number;
  patientId?: string;
  patientName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  [key: string]: unknown;
}

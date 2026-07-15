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
  reviewDate?: string;
  [key: string]: unknown;
}

export interface DoctorRatingDistribution {
  doctorId: number;
  doctorName: string;
  averageRating: number | null;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

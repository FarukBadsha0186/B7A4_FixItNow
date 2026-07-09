export interface IListQuery {
    page?: string;
    limit?: string;
    categoryId?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    status?: string;
}

export interface ICreateBooking {
    serviceId: string;
    scheduledAt: string; // ISO date string
    address: string;
    notes?: string;
}

export interface ICreateReview {
    bookingId: string;
    rating: number; // 1-5
    comment?: string;
}
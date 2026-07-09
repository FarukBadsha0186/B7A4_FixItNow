export interface IUpdateProfile {
    bio?: string;
    experience?: number;
    hourlyRate?: number;
    location?: string;
    isAvailable?: boolean;
}

export interface IAvailabilitySlot {
    dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
    startTime: string; // "09:00"
    endTime: string;   // "17:00"
}

export interface IUpdateAvailability {
    slots: IAvailabilitySlot[];
}

export interface ICreateService {
    title: string;
    description?: string;
    price: number;
    categoryId: string;
}

export interface IUpdateBookingStatus {
    status: "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED";
}

export interface IListQuery {
    page?: string;
    limit?: string;
    status?: string;
}
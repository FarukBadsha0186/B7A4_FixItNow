export interface ICreatePayment {
    bookingId: string;
}

export interface IConfirmPayment {
    sessionId: string;
}

export interface IListQuery {
    page?: string;
    limit?: string;
}
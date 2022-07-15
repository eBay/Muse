export const createRequest: (params?: {
    type: string;
    payload: any;
    options: string;
    author?: string;
    msg?: string;
}) => request;
export const completeRequest: ({ requestId, msg, author }: {
    requestId: string;
    author?: string;
    msg?: string;
}) => request;
export const deleteRequest: (params: {
    requestId: string;
    author?: string;
    msg?: string;
}) => request;
export const getRequest: (requestId: string) => Buffer;
export const getRequests: (params?: any) => any[];
export const updateRequest: (params: {
    requestId: string;
    changes: any;
    author?: string;
    msg?: string;
}) => request;
export const updateStatus: (params: {
    requestId: string;
    status: string; /** @member {function} updateStatus */
    author?: string;
    msg?: string;
}) => request;
export const deleteStatus: (params: {
    requestId: string;
    status: string;
    author?: string;
    msg?: string;
}) => request;

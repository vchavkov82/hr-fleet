export declare class ApiError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
    get isUnauthorized(): boolean;
    get isForbidden(): boolean;
    get isNotFound(): boolean;
    get isServerError(): boolean;
}
//# sourceMappingURL=errors.d.ts.map
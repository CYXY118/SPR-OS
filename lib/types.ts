export interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
    // Allow for other properties that might be present in the user object
    [key: string]: unknown;
}

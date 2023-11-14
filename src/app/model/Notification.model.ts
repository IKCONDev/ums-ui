import TimeAgo from "javascript-time-ago";

export interface Notification{
    id: number;
    message: string;
    emailId: string;
    notificationTo: string;
    moduleType: string;
    status: string;
    createdDateTime: string;
    timeAgoDateTime: TimeAgo;
    profilepic: Blob
}
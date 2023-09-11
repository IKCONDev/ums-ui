import { Meeting } from "./Meeting.model"
import { User } from "./User.model"

export interface Attendee{
    id:number
    type: string
    status: string
    email: string
    user: User
    event: Meeting
}
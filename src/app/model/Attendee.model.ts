import { User } from "./User.model"

export interface Attendee{
    id:number
    type: string
    status: string
    email: string
    user: User
}
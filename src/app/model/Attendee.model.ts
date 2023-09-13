import { Employee } from "./Employee.model"
import { Meeting } from "./Meeting.model"

export interface Attendee{
    id:number
    type: string
    status: string
    email: string
    user: Employee
    event: Meeting
}
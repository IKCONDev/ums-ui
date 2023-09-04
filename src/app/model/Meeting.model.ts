import { Attendee } from "./Attendee.model"
import { Transcript } from "./Transcript.model"
import { User } from "./User.model"

export interface Meeting{

    id: number
    subject: string
    organizerName: string
    startDateTime: string
    endDateTime: string
    attendees: Attendee[]
    actionItems: number
    user: User
    attendeeCount: number
    meetingTranscripts: Transcript[];
    transcriptData: string[];
    isTranscriptDisabled: boolean;

}
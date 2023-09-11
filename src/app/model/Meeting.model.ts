import { Attendee } from "./Attendee.model"
import { Transcript } from "./Transcript.model"
import { User } from "./User.model"

export interface Meeting{

    id: number
    subject: string
    organizerName: string
    organizerEmailId: string
    startDateTime: string
    endDateTime: string
    attendees: Attendee[]
    actionItems: number
    userId: number
    attendeeCount: number
    meetingTranscripts: Transcript[];
    transcriptData: string[];
    isTranscriptDisabled: boolean;

}
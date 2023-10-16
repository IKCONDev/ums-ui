import { Meeting } from "./Meeting.model";
import { ActionItems } from "./Actionitem.model";

export interface MOMObject{

    meeting : Meeting;
    actionItemList: ActionItems[];
    emailList : String[];


}
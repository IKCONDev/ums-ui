import { TaskCategory } from "./TaskCategory.model";

export interface Task{

    taskId:number;
    taskTitle:string;
    taskDescription:string;
    taskPriority:string;
    startDate:string;
    dueDate:string;
    plannedStartDate: string;
    plannedEndDate: string;
    taskOwner:string;
    organizer:string;
    status:string;
    actionItemId:number;
    actionTitle:string;
    emailId:string;
    departmentId: number;
    taskCategoryId: number;
    taskCategory: TaskCategory;
    createdBy: string;
    createdByEmailId: string;
    modifiedBy: string;
    modifiedByEmailId: string;
    actualDuration : string;
    plannedDuration : string;
    taskUpdatedFrom: string;
 }
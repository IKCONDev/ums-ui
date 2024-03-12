export interface BatchDetails{

     batchId:number;
     startDateTime:Date;
     endDateTime:Date;
     lastSuccessfullExecutionDateTime:Date;
     status:string;
     startDate: string;
     endDate: string;
     batchProcessFailureReason: string;
}
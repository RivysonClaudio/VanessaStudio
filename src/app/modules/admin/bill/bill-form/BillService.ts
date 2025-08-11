export interface BillService{
  id: string;
  date: string;
  serviceId: string;
  serviceCategory: string;
  serviceDescription: string;
  serviceValue: number;
  serviceRenew: number;
  workerId: string;
  workerName: string;
  billStatus: string;
}
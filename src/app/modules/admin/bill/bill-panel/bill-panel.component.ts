import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bill-panel',
  imports: [RouterLink, FormsModule],
  templateUrl: './bill-panel.component.html',
  styleUrl: './bill-panel.component.css'
})
export class BillPanelComponent {

  financialView: boolean = false;
  balance:string = "R$ ****";

  today: string = new Date().toISOString().split('T')[0];
  initialDateFilter: string = this.today.slice(0, 7) + '-01';
  finalDateFilter: string = this.today;

  scheduledBills: any = [];
  finished_Bills: any = [];
  canceled_Bills: any = [];

  viewScheduledBills: boolean = false;
  viewFinished_Bills: boolean = true;
  viewCanceled_Bills: boolean = false;

  constructor(){
    this.getBills()
    .then(response => {
      for(let bill of response){
        if(bill.statusComanda == 'AGENDADA'   ){this.scheduledBills.push(bill)}
        if(bill.statusComanda == 'FINALIZADA' ){this.finished_Bills.push(bill)}
        if(bill.statusComanda == 'CANCELADA'  ){this.canceled_Bills.push(bill)}
      }
    })
    .then(() => {
      let totalValue = 0;
      this.finished_Bills.forEach((bill: { valorTotal: number; }) => {
        totalValue += bill.valorTotal;
      });
    })
  }

  ngOnInit(): void{
  }

  getBills(): Promise<any[]>{
    return new Promise((resolve) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();

      xhr.open("GET", "http://localhost:8080/api/comandas/v2/search/date?direction=asc&startDate=" + this.initialDateFilter + "T00:00:00.000Z&endDate=" + this.finalDateFilter + "T23:59:59.007Z" , true);

      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onload = () => {
        if (xhr.status == 200){
          resolve(JSON.parse(xhr.response));
        }
      }

      xhr.send();
    })
  }

  handleBalance(){
    if(this.financialView){
      this.financialView = false;
      this.balance = "R$ ****";
    }
    else{
      const pass =  prompt("Senha de acesso: ");

      if(pass === "Admin123"){
        this.financialView = true;
        let totalValue = 0;
        this.finished_Bills.forEach((bill: { valorTotal: number; }) => {
          totalValue += bill.valorTotal;
        });
        this.balance = 'R$ ' + this.maskCurrency((totalValue * 100).toString());
        }
    }
  }

  viewBills(value: string): void{
    if(value == 'FINISHED'){
      if(this.viewFinished_Bills){
        this.viewFinished_Bills = false;
      }else{
        this.viewFinished_Bills = true;
      }
    }
    if(value == 'SCHEDULE'){
      if(this.viewScheduledBills){
        this.viewScheduledBills = false;
      }else{
        this.viewScheduledBills = true;
      }
    }
    if(value == 'CANCELED'){
      if(this.viewCanceled_Bills){
        this.viewCanceled_Bills = false;
      }else{
        this.viewCanceled_Bills = true;
      }
    }
  }

  filterByDate(): void{

    this.scheduledBills = [];
    this.finished_Bills = [];
    this.canceled_Bills = [];

    this.getBills()
    .then(response => {
      for(let bill of response){
        if(bill.statusComanda == 'INICIADA'   ){this.scheduledBills.push(bill)}
        if(bill.statusComanda == 'FINALIZADA' ){this.finished_Bills.push(bill)}
        if(bill.statusComanda == 'CANCELADA'  ){this.canceled_Bills.push(bill)}
      }
    })
    .then(() => {
      let totalValue = 0;
      this.finished_Bills.forEach((bill: { valorTotal: number; }) => {
        totalValue += bill.valorTotal;
      });
      this.balance = 'R$ ' + this.maskCurrency((totalValue * 100).toString());
    });
  }

  maskCurrency(value: string): string{
    const mask = "##.###.###.##0,00";

    let onlynumbers: string = value.replace(/\D/g, '');
    let valueLength = onlynumbers.length;
    let maskedValue = "";
    
    for(let i = mask.length; i > 0; i--){
        if(mask[i - 1] === "#" && valueLength === 0){
        break;
        }else if(mask[i - 1] === "#" && valueLength != 0){
        maskedValue = onlynumbers[--valueLength] + maskedValue;
        }else if(mask[i - 1] === "0" && valueLength != 0){
        maskedValue = onlynumbers[--valueLength] + maskedValue;
        }else{
        maskedValue = mask[i - 1] + maskedValue;
        }
    }
    
    if(isNaN(Number.parseInt(maskedValue[0]))){maskedValue = maskedValue.substring(1)}

    return maskedValue;
  }
}

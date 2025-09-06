import { Injectable } from '@angular/core';
import { ProcedureExpiringEntity } from './ProcedureExpiring';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  async init(): Promise<ProcedureExpiringEntity[]>{
    const procedures_expiring: ProcedureExpiringEntity[] = [];

    const response = await fetch("http://localhost:8080/api/comandas/v1/", {method: "GET", headers: {"Content-Type": "application/json"}});
    const data = await response.json();

    for(const invoice of data){

      for(const procedure of invoice.servicosComandas){
        if(procedure.statusServicosComanda != "FINALIZADA") continue;
        const procedureExpiringEntity = new ProcedureExpiringEntity({
          id: uuid(),
          client_id: invoice.clienteId,
          client_name: invoice.clienteNome,
          client_phone: invoice.clienteTelefone,
          invoice_id: invoice.id,
          invoice_number: invoice.numeroSerie,
          invoice_date: invoice.dataComanda,
          procedure_id: procedure.id,
          procedure_desc: procedure.descricaoServico,
          procedure_date: procedure.dataServicoComanda,
          procedure_expires: getExpiringDate(procedure.dataServicoComanda, procedure.renovacaoServico),
          procedure_ammount: procedure.valorServico,
          professional_id: procedure.profissionalId,
          professional_name: procedure.profissionalNome
        });

        procedures_expiring.push(procedureExpiringEntity);
      }
    }

    function uuid(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
    }

    function getExpiringDate(date: string, daysToRenew: number): string{
      const baseDate = new Date(date);
      baseDate.setDate(baseDate.getDate() + daysToRenew);
      return baseDate.toISOString();
    }

    console.log(procedures_expiring);

    return procedures_expiring;
  }
}

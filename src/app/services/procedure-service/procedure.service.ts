import { Injectable } from '@angular/core';
import { ProcedureEntity } from './ProcedureEntity';

@Injectable({
  providedIn: 'root'
})
export class ProcedureService {
  private endpoint_api = "http://localhost:8080/api/servicos/v1/";

  constructor() { }

  async get_all(): Promise<ProcedureEntity[]>{
    const procedures_list: ProcedureEntity[] = [];

    const response = await fetch(this.endpoint_api, {headers: {"Content-Type": "application/json"}});
    const data = await response.json();

    for(const item of data){
      const procedure = new ProcedureEntity({
        id: item.id,
        category: item.tipoServico,
        description: item.descricao,
        due_date: item.intervaloRenovacao,
        ammount: item.valorServico
      });

      procedures_list.push(procedure);
    }

    return procedures_list;
  }
}

import { Injectable } from '@angular/core';
import { ProfessionalEntity } from './ProfessionalEntity';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  private endpoint_api = "http://localhost:8080/api/profissionais/v1/";

  constructor() { }

  async get_all(): Promise<ProfessionalEntity[]>{
    const profissionals_list: ProfessionalEntity[] = [];

    const response = await fetch(this.endpoint_api, {headers: {"Content-Type": "application/json"}});
    const data = await response.json();

    for(const item of data){
      const profissional = new ProfessionalEntity({
        id: item.id,
        createdAt: item.dataCriacao,
        name: item.nome,
        phones: item.telefones,
        pass_through: item.porcentagemRepasse
      });

      profissionals_list.push(profissional);
    }

    return profissionals_list;
  }
}

import { Injectable } from '@angular/core';
import { ClientEntity } from './ClientEntity';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private endpoint_api = "http://localhost:8080/api/clientes/v1/";

  constructor() { }

  async get_all(): Promise<ClientEntity[]>{
    const clients_list: ClientEntity[] = [];

    const response = await fetch(this.endpoint_api, {headers: {"Content-Type": "application/json"}});
    const data = await response.json();
    
    for (const item of data){
      const client = new ClientEntity({
        id: item.id,
        name: item.nome,
        nickname: item.apelido,
        photo: item.fotoPath,
        birth: item.nascimento,
        phones: item.telefones,
        adress:{
            zip_code: item.endereco.cep,
            street: item.endereco.logradouro,
            complement: item.endereco.complemento,
            hood: item.endereco.bairro,
            city: item.endereco.localidade,
            state: item.endereco.uf,
        },
        createdAt: item.dataCriacao
      })

      clients_list.push(client);
    }

    return clients_list;
  }

}

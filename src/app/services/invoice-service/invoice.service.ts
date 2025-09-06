import { Injectable } from '@angular/core';
import { InvoiceEntity } from './InvoiceEntity';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private endpoint_api = "http://localhost:8080/api/comandas/v1/";
  private endpoint_api_procedures = "http://localhost:8080/api/servicosComanda/v1/";

  constructor() { }

  private invoice_factory(data: any): InvoiceEntity{
    const invoiceEntity = new InvoiceEntity({
      id: data.id,
      date: data.dataComanda,
      number: data.numeroSerie,
      status: data.statusComanda,
      ammount: data.valorTotal,
      client_id: data.clienteId,
      client_name: data.clienteNome,
      client_phone: data.clienteTelefone,
      more_info: data.observacaoProcedimento,
      procedures: []
    });

    for(const item of data.servicosComandas){
      const procedure = {
        id: item.id,
        date: item.dataServicoComanda,
        status: item.statusServicosComanda,
        category: item.categoriaServico,
        description: item.descricaoServico,
        ammount: item.valorServico,
        due_date: item.renovacaoServico,
        professional_id: item.profissionalId,
        professional_name: item.profissionalNome
      }

      invoiceEntity.procedures = procedure;
    }

    return invoiceEntity;
  }

  async get_all(): Promise<InvoiceEntity[]>{
    const invoices_list: InvoiceEntity[] = [];

    const response = await fetch(this.endpoint_api, {headers: {"Content-Type": "application/json"}});
    const data = await response.json();

    for(const item of data){
      const invoice = this.invoice_factory(item);
      invoices_list.push(invoice);
    }

    return invoices_list;
  }

  async get_by_number(number: number): Promise<InvoiceEntity | null>{
    const response = await fetch(this.endpoint_api + "search/serial?serialNumber=" + number, {headers: {"Content-Type": "application/json"}});
    const data = await response.json();
    if(data.status === 404) return null;
    return this.invoice_factory(data);
  }

  async save(invoice: InvoiceEntity): Promise<void>{
    const body: any = {};

    body.statusComanda          = invoice.status;
    body.valorTotal             = invoice.ammount;
    body.clienteId              = invoice.client_id;
    body.clienteNome            = invoice.client_name;
    body.clienteTelefone        = invoice.client_phone;
    body.observacaoProcedimento = invoice.more_info;
    body.servicosComandas       = [];

    for(const p of invoice.procedures){
      body.servicosComandas.push({
        statusServicosComanda : p.status,
        categoriaServico      : p.category,
        descricaoServico      : p.description,
        valorServico          : p.ammount,
        renovacaoServico      : p.due_date,
        profissionalId        : p.professional_id,
        profissionalNome      : p.professional_name
      })
    }

    await fetch(this.endpoint_api.replace('v1/', 'v1'), 
      {
        method: "POST",
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify(body)
      }
    );

    return;
  }

  async update(invoice: InvoiceEntity): Promise<void>{
    const body: any = {};

    body.id                     = invoice.id;
    body.dataComanda            = invoice.date;
    body.numeroSerie            = invoice.number;
    body.statusComanda          = invoice.status;
    body.valorTotal             = invoice.ammount;
    body.clienteId              = invoice.client_id;
    body.clienteNome            = invoice.client_name;
    body.clienteTelefone        = invoice.client_phone;
    body.observacaoProcedimento = invoice.more_info;
    body.servicosComandas       = [];

    for(const p of invoice.procedures){
      body.servicosComandas.push({
        id                    : p.id,
        statusServicosComanda : p.status,
        categoriaServico      : p.category,
        descricaoServico      : p.description,
        valorServico          : p.ammount,
        renovacaoServico      : p.due_date,
        profissionalId        : p.professional_id,
        profissionalNome      : p.professional_name
      })
    }

    await fetch(this.endpoint_api + invoice.id, 
      {
        method: "PUT",
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify(body)
      }
    );

    for(const procedure of body.servicosComandas){
      await fetch(this.endpoint_api_procedures + procedure.id, 
        {
          method: "PUT",
          headers: {"Content-Type": "application/json"}, 
          body: JSON.stringify(procedure)
        }
      );
    }

    return;
  }
}

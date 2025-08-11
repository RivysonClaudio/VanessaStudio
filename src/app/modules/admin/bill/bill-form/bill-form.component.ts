import { Component, NgModule } from '@angular/core';
import { AdminComponent } from '../../admin/admin.component';
import { BillService } from './BillService';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bill-form',
  imports: [RouterLink, NgClass, FormsModule],
  templateUrl: './bill-form.component.html',
  styleUrl: './bill-form.component.css'
})
export class BillFormComponent {

  routerType: string = 'register';

  billId: string = '';
  billStatus: string = "Selecione";
  billNumber:string | null = "0";
  billDate:string = new Date().toLocaleDateString();
  billClientId:string = "";
  billClientName:string = "Nome Completo";
  billClientPhone:string = "(81) 9XXXX-XXXX";
  billServices: BillService[] = [];
  billMoreInfo: string = "";
  billTotalValue: number = 0;
  billInfo: any = null;

  statusOptionsBox:   boolean  = false;
  clientsOptionsBox:  boolean  = false;
  servicesOptionsBox: boolean  = false;
  workersOptionsBox:  boolean  = false;

  newServiceView:boolean = true;
  newServiceViewClass: string = "";
  newService: {active: boolean, category: string, description: string, value: string, source: any} = {active: false, category: "", description: "", value: "", source: null};
  newWorker: {active: boolean, name: string, source: any} = {active: false, name: "", source: null};

  clientList:       any = [];
  servivesList:     any = [];
  workersList:      any = [];
  clientListAll:    any = [];
  servivesListAll:  any = [];
  workersListAll:   any = [];

  constructor(private admin: AdminComponent, private router: Router, private activeRoute: ActivatedRoute){
    admin.notify('Buscando informações do Banco de Dados...', 10000);
  }

  ngOnInit() : void{

    this.activeRoute.data.subscribe(data => {this.routerType = data['type']});

    const getClients  = this.fetchBillMandatoryInfos('http://localhost:8080/api/clientes/v1/',      (response) => this.clientList   = response);
    const getServices = this.fetchBillMandatoryInfos('http://localhost:8080/api/servicos/v1/',      (response) => this.servivesList = response);
    const getWorkers  = this.fetchBillMandatoryInfos('http://localhost:8080/api/profissionais/v1/', (response) => this.workersList  = response);

    Promise.all([getClients, getServices, getWorkers])
    .then(() => this.admin.desableNotification())
    .then(() => {
      this.clientListAll = this.clientList;
      this.servivesListAll = this.servivesList;
      this.workersListAll = this.workersList;
    })
    .catch(() => this.admin.notify('Ocorreu um erro na consulta do Banco de Dados', 3000));

    if(this.routerType == 'edit'){
      this.activeRoute.paramMap.subscribe(param => {
        if(param.get('id') != null){
          this.billNumber = param.get('id');
        }
        else{
          this.router.navigate(['/admin/comandas']);
        }
      });

      const xhr = new XMLHttpRequest();
  
      xhr.open("GET", "//localhost:8080/api/comandas/v1/search/serial?serialNumber=" + this.billNumber, false);

      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onload = () => {
        if( xhr.status == 200 ){
          const json = JSON.parse(xhr.response);

          this.billId = json.id;
          this.billStatus = json.statusComanda;
          const date = new Date(json.dataComanda);
          const dateAdjusted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
          this.billDate = dateAdjusted.toISOString().split('T')[0].split('-').reverse().join('/');

          this.billClientId = json.clienteId;
          this.billClientName = json.clienteNome;
          this.billClientPhone = this.maskPhoneNumber( json.clienteTelefone );

          json.servicosComandas.forEach((servico: { id: any; dataServicoComanda: any; categoriaServico: any; descricaoServico: any; valorServico: any; renovacaoServico: any; profissionalId: any; profissionalNome: any; statusServicosComanda: any; }) => {
            this.billServices.push({
              id: servico.id,
              date: servico.dataServicoComanda,
              serviceId: servico.id,
              serviceCategory: servico.categoriaServico,
              serviceDescription: servico.descricaoServico,
              serviceValue: servico.valorServico,
              serviceRenew: servico.renovacaoServico,
              workerId: servico.profissionalId,
              workerName: servico.profissionalNome,
              billStatus: servico.statusServicosComanda
            })
          })

          this.billMoreInfo = json.observacaoProcedimento;
          this.billTotalValue = json.valorTotal;

          this.billInfo = json;
        }
        else{
          this.router.navigate(["/comandas"])
        }
      }

      xhr.onerror = () => {
        this.router.navigate(["/comandas"])
      }

      xhr.send()
    }
  }

  saveNewBill(): void{
    const billServicesFiltered = this.billServices.map(
        (service: BillService) => ({
          ...(service.id !== "" && { 
            id: service.id, 
            dataServicoComanda: service.date 
          }),
          categoriaServico: service.serviceCategory,  
          descricaoServico: service.serviceDescription,  
          valorServico: service.serviceValue,  
          renovacaoServico: service.serviceRenew,  
          profissionalId: service.workerId,  
          profissionalNome: service.workerName,
          statusServicosComanda: service.billStatus
    }))

    const body = 
    {
      statusComanda: this.billStatus,  
      valorTotal: this.billTotalValue,  
      clienteId: this.billClientId,  
      clienteNome: this.billClientName,  
      clienteTelefone: this.billClientPhone,  
      observacaoProcedimento: this.billMoreInfo,  
      servicosComandas: billServicesFiltered
    }

    if(this.routerType != 'edit'){

      const xhr: XMLHttpRequest = new XMLHttpRequest();

      xhr.open('POST', 'http://localhost:8080/api/comandas/v1', false);
  
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onload = () => {
        if(xhr.status == 201){
          this.router.navigate(['/admin/comandas'])
        }
      }
  
      xhr.send(JSON.stringify(body));
    }else{
      const xhr: XMLHttpRequest = new XMLHttpRequest();

      xhr.open('PUT', 'http://localhost:8080/api/comandas/v1/' + this.billId, false);
  
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onload = () => {
        if(xhr.status == 200){
          this.router.navigate(['/admin/comandas'])
        }
      }
  
      xhr.send(JSON.stringify(body));
    }
  }

  handleOptionsBox(box: string) : void{
    if(box == 'status'){
      if(this.statusOptionsBox){
        this.statusOptionsBox = false;
      }
      else{
        this.statusOptionsBox = true;
        this.clientsOptionsBox = false;
        this.servicesOptionsBox = false;
        this.workersOptionsBox = false;
      }
    }

    if(box == 'client'){
      if(this.clientsOptionsBox){
        this.clientsOptionsBox = false;
      }
      else{
        this.clientsOptionsBox = true;
        this.statusOptionsBox = false;
        this.servicesOptionsBox = false;
        this.workersOptionsBox = false;
      }
    }

    if(box == 'service'){
      if(this.servicesOptionsBox){
        this.servicesOptionsBox = false;
      }
      else{
        this.servicesOptionsBox = true;
        this.clientsOptionsBox = false;
        this.statusOptionsBox = false;
      }

      this.newServiceViewClass = '';
      this.workersOptionsBox = false;
    }

    if(box == 'worker'){
      if(this.workersOptionsBox){
        this.workersOptionsBox = false;
        this.newServiceViewClass = '';
      }
      else{
        this.workersOptionsBox = true;
        this.newServiceViewClass = 'selectWorker';
        this.clientsOptionsBox = false;
        this.statusOptionsBox = false;
      }

      this.servicesOptionsBox = false;
    }
  }

  newServiceViewHandler(config: string): void{
    if(config == 'open'){
      this.newServiceView = false;
    }
    if(config == 'close'){
      this.newServiceView = true;
    }
  }

  setBillStatus(value:string) : void{
    this.billStatus = value;
    this.handleOptionsBox('status');
  }

  setBillClient({id, name, phone}: {id: string, name: string, phone: string}): void{
    this.billClientId = id;
    this.billClientName = name;
    this.billClientPhone = phone;
    this.handleOptionsBox('client');
  }

  setBillNewService(source: any): void{
    this.newService = {
      active: true,
      category: source.tipoServico,
      description: source.descricao,
      value: "R$ " + this.maskCurrency((source.valorServico * 100).toString()),
      source: source
    }
    this.handleOptionsBox('service');
  }

  setBillNewWorker(source: any): void{
    this.newWorker = {
      active: true,
      name: source.nome,
      source: source
    }
    this.handleOptionsBox('worker');
  }

  addBillNewBillService(): void{
    if(this.newService.active && this.newWorker.active){
      this.billServices.push({
        id: "",
        date: this.billDate,
        serviceId: this.newService.source.id,
        serviceCategory: this.newService.source.tipoServico,
        serviceDescription: this.newService.source.descricao,
        serviceValue: this.newService.source.valorServico,
        serviceRenew: this.newService.source.intervaloRenovacao,
        workerId: this.newWorker.source.id,
        workerName: this.newWorker.source.nome,
        billStatus: this.billStatus
      });

      this.billTotalValue += this.newService.source.valorServico;

      this.newService = {active: false, category: "", description: "", value: "", source: null};
      this.newWorker = {active: false, name: "", source: null};
      this.newServiceViewHandler('close');
    }
  }

  deleteServiceBill(id: string): void{
    for(let i = 0; i < this.billServices.length; i++){
      if(this.billServices[i].id == id){
        this.billTotalValue -= this.billServices[i].serviceValue;
        this.billServices.splice(i, 1);
        break;
      }
    }
  }

  setFilter(term: string, filter: string){
    if(filter == 'client'){
      this.clientList = [];
      for(const client of this.clientListAll){
          const search: string = `${client.nome}|${client.apelido}|${client.telefones[0].replace(/\D/g, '')}`;
          if(search.toUpperCase().includes(term.toUpperCase())){
            this.clientList.push(client);
          }
      }
    }
    if(filter == 'service'){
      this.servivesList = [];
      for(const service of this.servivesListAll){
          const search: string = `${service.tipoServico}|${service.descricao}|${"R$ " + this.maskCurrency((service.valorServico * 100).toString())}`;
          if(search.toUpperCase().includes(term.toUpperCase())){
            this.servivesList.push(service);
          }
      }
    }
    if(filter == 'worker'){
      this.workersList = [];
      for(const worker of this.workersListAll){
          const search: string = `${worker.nome}|${worker.telefones[0].replace(/\D/g, '')}`;
          if(search.toUpperCase().includes(term.toUpperCase())){
            this.workersList.push(worker);
          }
      }
    }
  }

  async fetchBillMandatoryInfos(apiURL: string, callback: (data: any) => void ): Promise<any>{
    const response = await fetch(apiURL, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    callback(await response.json());
  }

  maskPhoneNumber(value: string): string{
    const mask = "(##) #####-####";

    let onlynumbers: string = value.replace(/\D/g, '');
    let valueLength: number = 0;
    if(onlynumbers.length == 0){return ""}

    valueLength = onlynumbers.length;

    let maskedValue = "";
    
    for(let i = 0; i < mask.length; i++){
        if(valueLength === 0){break}

        if(mask[i] === "#"){
            maskedValue += onlynumbers[0];
            onlynumbers = onlynumbers.substring(1);
            valueLength--;
          }
        else{
            maskedValue += mask[i];
        }
    }

    return maskedValue;
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

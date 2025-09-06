import { Component, ElementRef, ViewChild } from '@angular/core';
import { AdminComponent } from '../../admin/admin.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClientService } from '../../../../services/client-service/client.service';
import { ClientEntity } from '../../../../services/client-service/ClientEntity';
import { InvoiceService } from '../../../../services/invoice-service/invoice.service';
import { IInvoiceProcedureProps, InvoiceEntity } from '../../../../services/invoice-service/InvoiceEntity';
import { ProcedureService } from '../../../../services/procedure-service/procedure.service';
import { ProcedureEntity } from '../../../../services/procedure-service/ProcedureEntity';
import { ProfissionalService } from '../../../../services/professional-service/professional.service';
import { ProfessionalEntity } from '../../../../services/professional-service/ProfessionalEntity';
import { Utils } from '../../../../Utils';

type ViewKey = "client_searchbox" | "procedure_form" | "procedure_select" | "professional_select";

@Component({
  selector: 'app-bill-form',
  imports: [RouterLink, FormsModule],
  templateUrl: './bill-form.component.html',
  styleUrl: './bill-form.component.css'
})
export class BillFormComponent {

  routerType: string = "register";

  invoice: InvoiceEntity;
  invoice_procedure_standing: IInvoiceProcedureProps;

  clients_list: ClientEntity[] = [];
  procedures_list: ProcedureEntity[] = [];
  professionals_list: ProfessionalEntity[] = [];
  list_aux: any[] = [];

  isOpen: Record<ViewKey, boolean> = {
    client_searchbox: false,
    procedure_form: true,
    procedure_select: false,
    professional_select: false
  };

  utils: Utils;
  invoice_modified: boolean = false;

  @ViewChild('invoice_client_ul') invoiceClientUl!: ElementRef<HTMLDivElement>;
  @ViewChild('invoice_procedure_ul') invoiceProcedureUl!: ElementRef<HTMLDivElement>;
  @ViewChild('invoice_professional_ul') invoiceProfessionalUl!: ElementRef<HTMLDivElement>;

  constructor(
    private admin: AdminComponent, 
    private router: Router, 
    private activeRoute: ActivatedRoute,
    private clientService: ClientService,
    private procedureService: ProcedureService,
    private professionalService: ProfissionalService,
    private invoiceService: InvoiceService
  ){
    this.utils = new Utils;

    const today = new Date().toISOString();

    this.invoice_procedure_standing = {
      id: null,
      date: null,
      status: "AGENDADA",
      category: "",
      description: "",
      due_date: 0,
      ammount: 0,
      professional_id: "",
      professional_name: ""
    }

    this.invoice = new InvoiceEntity({
      id: null,
      date: today.split('T')[0],
      number: 0,
      status: "AGENDADA",
      ammount: 0,
      client_id: "",
      client_name: "",
      client_phone: "",
      more_info: "",
      procedures: []
    });
  }

  async ngOnInit(): Promise<void> {

    this.activeRoute.data.subscribe(data => {this.routerType = data['type']});

    try{
      this.clients_list = await this.clientService.get_all();
      this.procedures_list = await this.procedureService.get_all();
      this.professionals_list = await this.professionalService.get_all();

      if(this.routerType === 'edit') {
        this.activeRoute.paramMap.subscribe(param => { this.invoice.number = Number(param.get('id')) || 0 });
        const invoice_response = await this.invoiceService.get_by_number(this.invoice.number);
        if(invoice_response) this.invoice = invoice_response;
        else this.router.navigate(['/admin/comandas']);
      }
      
    }
    catch(error){ console.error(error) }
  }

  toggleVisibility(view: ViewKey): void{
    this.isOpen[view] = !this.isOpen[view];
  }

  set_invoice_client(client: ClientEntity): void{
      this.invoice.client_id = client.id;
      this.invoice.client_name = client.name;
      this.invoice.client_phone = client.phones[0];

      this.toggleVisibility('client_searchbox');
      this.invoice_modified = true;
  }
  set_invoice_new_procedure_procedure(procedure: ProcedureEntity): void{
    this.invoice_procedure_standing.category = procedure.category;
    this.invoice_procedure_standing.description = procedure.description;
    this.invoice_procedure_standing.due_date = procedure.due_date;
    this.invoice_procedure_standing.ammount = procedure.ammount;

    this.toggleVisibility('procedure_select');
    this.invoice_modified = true;
  }
  set_invoice_new_procedure_professional(professional: ProfessionalEntity): void{
    this.invoice_procedure_standing.professional_id = professional.id;
    this.invoice_procedure_standing.professional_name = professional.name;

    this.toggleVisibility('professional_select');
    this.invoice_modified = true;
  }
  set_invoice_new_procedure(): void{
    if(this.invoice_procedure_standing.category === "") return this.admin.notify("Serviço não encontrado.", 1500);
    if(this.invoice_procedure_standing.professional_id === "") return this.admin.notify("Profissional não encontrado.", 1500);

    this.invoice_procedure_standing.id = this.utils.uuid();
    const procedureCopy = {...this.invoice_procedure_standing};
    this.invoice.procedures.push(procedureCopy);
    this.invoice.ammount += procedureCopy.ammount;
    this.toggleVisibility('procedure_form');

    this.invoice_procedure_standing.id = null;
    this.invoice_procedure_standing.category = "";
    this.invoice_procedure_standing.description = "";
    this.invoice_procedure_standing.due_date = 0;
    this.invoice_procedure_standing.ammount = 0;
    this.invoice_procedure_standing.professional_id = "";
    this.invoice_procedure_standing.professional_name = "";
    
    this.invoice_modified = true;
    this.invoice.update_status();
  }
  set_invoice_procedure_status(procedure_id: string | null, event: Event): void{
    if(procedure_id){
      const new_status = (event.target as HTMLSelectElement).value;
      this.invoice.update_procedure_status(procedure_id, new_status);
      this.invoice.update_status();
      this.invoice_modified = true;
    }
  }
  set_invoice_more_info(event: Event): void{
    const more_info = (event.target as HTMLTextAreaElement).value;
    this.invoice.more_info = more_info;
    this.invoice_modified = true;
  }

  remove_invoice_procedure(procedure: IInvoiceProcedureProps): void{
    if(procedure.id) this.invoice.delete_procedure(procedure.id);
    this.invoice_modified = true;
  }

  filter_box(box: string, event: Event): void{
    const search = (event.target as HTMLInputElement).value.toLowerCase();

    let liElements: any = [];

    if(box === 'clients') liElements = this.invoiceClientUl.nativeElement.querySelectorAll('li');
    if(box === 'procedures') liElements = this.invoiceProcedureUl.nativeElement.querySelectorAll('li');
    if(box === 'professionals') liElements = this.invoiceProfessionalUl.nativeElement.querySelectorAll('li');

    for(const li of liElements){
      if(li.textContent.toLowerCase().includes(search)){
        li.style.display = '';
      }else{
        li.style.display = 'none';
      }
    }
  }

  async submit_invoice(invoice: InvoiceEntity): Promise<void>{
    await this.invoiceService.save(invoice);
    this.invoice_modified = false;
    this.admin.notify("Comanda salva com sucesso!", 1500);
  }
  async update_invoice(invoice: InvoiceEntity): Promise<void>{
    await this.invoiceService.update(invoice);
    this.invoice_modified = false;
    this.admin.notify("Comanda atualizada com sucesso!", 1500);
  }
}

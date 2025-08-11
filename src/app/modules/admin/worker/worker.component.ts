import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-worker',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './worker.component.html',
  styleUrl: './worker.component.css'
})
export class WorkerComponent {
  editingView: boolean = false;
  profissionals: any = [];
  all_profissionals: any = [];
  @ViewChild('profissionalSearchbar') filter!: ElementRef;
  form: FormGroup;
  currentSelectedId: string = "";
  pecentage: number = 100;
  workerServicesList: any = [];
  totalValueBills: string = '0,00';
  percentageOfTotal: string = '0,00';

  financialView : boolean = false;

  today: string = new Date().toISOString().split('T')[0];
  initialDateFilter: string = this.today.slice(0, 7) + '-01';
  finalDateFilter: string = this.today;

  constructor(private admin : AdminComponent){
    this.requestAllProfissionals()
    .then(resolve => this.profissionals = resolve)
    .then(() => {
      for(let i = 0; i < this.profissionals.length; i++){
        const phones = this.profissionals[i].telefones;
        const date = new Date(this.profissionals[i].dataCriacao);
        const dateAdjusted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
        this.profissionals[i].dataCriacao = dateAdjusted.toISOString().split('T')[0].split('-').reverse().join('/');

        for(let j = 0; j < phones.length; j++){
          this.profissionals[i].telefones[j] = this.maskPhoneNumber(this.profissionals[i].telefones[j]);
        } 
      }
    })

    this.form = new FormGroup({
      workerName:     new FormControl(),
      workerMainPhone:new FormControl(),
      workerPhone2:   new FormControl(),
      workerPhone3:   new FormControl(),
      workerRate:     new FormControl(),
      workerRegister: new FormControl()
    });
  }

  ngOnInit(){
    [this.form.get('workerMainPhone'), this.form.get('workerPhone2'), this.form.get('workerPhone3')].forEach(input => {
      input?.valueChanges.subscribe(value => {
        input?.setValue(this.maskPhoneNumber(value), { emitEvent: false });
      });
    });

    this.form.get('workerRate')?.valueChanges.subscribe(value => {
      this.form.get('workerRate')?.setValue(value.replace(/\D/g, ''), { emitEvent: false });
    });
  }

  ngAfterViewInit() {
    const filter = this.filter.nativeElement as HTMLInputElement;

    filter.addEventListener('input', () => {
      if(this.all_profissionals < this.profissionals){
        this.all_profissionals = this.profissionals;
      }
      this.profissionals = []
      for(const profissional of this.all_profissionals){
          const term: string = `${profissional.nome} ${profissional.telefones[0].replace(/\D/g, '')}`;
          if(term.toUpperCase().includes(filter.value.toUpperCase())){
            this.profissionals.push(profissional);
          }
      }
    });
  }

  requestAllProfissionals(): Promise<JSON>{
    return new Promise((resolve, reject) => {
      const xhr : XMLHttpRequest = new XMLHttpRequest();

      xhr.open("GET", "http://localhost:8080/api/profissionais/v1/", false);

      xhr.setRequestHeader('Content-Type', 'application/json');
  
      xhr.onload = () => {
        if(xhr.status == 200){
          resolve(JSON.parse(xhr.response))
        }else{
          reject(JSON.parse(xhr.response))
        }
      }

      xhr.send();
    });
  }

  viewProfissional(id: string){
    this.profissionals.forEach((p: {id: string, nome: string, telefones: string[], porcentagemRepasse: number, dataCriacao: string}) => {
      if(p.id === id){
        this.form.get('workerName')?.setValue(p.nome);
        this.form.get('workerMainPhone')?.setValue(p.telefones[0]);
        this.form.get('workerPhone2')?.setValue(p.telefones[1] || "");
        this.form.get('workerPhone3')?.setValue(p.telefones[2] || "");
        this.form.get('workerRate')?.setValue(p.porcentagemRepasse.toString() + "%");
        this.form.get('workerRegister')?.setValue(p.dataCriacao.split('T')[0].split('-').reverse().join('/'));

        this.pecentage = p.porcentagemRepasse;
      }
    });

    this.editingView = true;
    this.currentSelectedId = id;

    this.filterProfissional();
  }

  onSubmit(){
    const body = {
      nome: this.form.get('workerName')?.value,
      telefones: [this.form.get('workerMainPhone')?.value.replace(/\D/g, '')],
      porcentagemRepasse: this.form.get('workerRate')?.value.replace(/\D/g, '')
    }

    if(this.form.get('workerPhone2')?.value){
      body.telefones.push(this.form.get('workerPhone2')?.value.replace(/\D/g, ''));
    }

    if(this.form.get('workerPhone3')?.value){
      body.telefones.push(this.form.get('workerPhone3')?.value.replace(/\D/g, ''));
    }

    const xhr : XMLHttpRequest = new XMLHttpRequest();

    xhr.open("POST", "http://localhost:8080/api/profissionais/v1", false);

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      if(xhr.status == 201){
        this.admin.notify("Novo profissional cadastrado com sucesso!", 3500);

        const profissional = JSON.parse(xhr.response);

        for(let i = 0; i < profissional.telefones.length; i++){
          profissional.telefones[i] = this.maskPhoneNumber(profissional.telefones[i]);
        } 

        console.log(profissional)

        this.profissionals.push(profissional);

        this.onClear();
      }
    }

    xhr.send(JSON.stringify(body));
  }

  onDelete(){
    this.admin.openModal(
      {
        title: "EXCLUIR PROFISSIONAL", 
        message: "Tem certeza disso? Essa ação não poderá ser desfeita."
      }, () => {
        const xhr : XMLHttpRequest = new XMLHttpRequest();

        xhr.open("DELETE", "http://localhost:8080/api/profissionais/v1/" + this.currentSelectedId, false);

        xhr.setRequestHeader('Content-Type', 'application/json');
    
        xhr.onload = () => {
          if(xhr.status == 204){
            this.admin.notify("Profissional removido!", 3500);
    
            this.profissionals = this.profissionals.filter(
              (profissional: any) => profissional.id !== this.currentSelectedId
            );

            this.all_profissionals = this.all_profissionals.filter(
              (profissional: any) => profissional.id !== this.currentSelectedId
            );

            this.currentSelectedId = "";
    
            this.onClear();
          }
        }
    
        xhr.send();
    })
  }

  onClear(){
    this.form.get('workerName')?.setValue("");
    this.form.get('workerMainPhone')?.setValue("");
    this.form.get('workerPhone2')?.setValue("");
    this.form.get('workerPhone3')?.setValue("");
    this.form.get('workerRate')?.setValue("");
    this.form.get('workerRegister')?.setValue("");

    this.editingView = false;
  }

  onEdit(){
    const body = {
      nome: this.form.get('workerName')?.value,
      telefones: [this.form.get('workerMainPhone')?.value.replace(/\D/g, '')],
      porcentagemRepasse: this.form.get('workerRate')?.value.replace(/\D/g, '')
    }

    if(this.form.get('workerPhone2')?.value){
      body.telefones.push(this.form.get('workerPhone2')?.value.replace(/\D/g, ''));
    }

    if(this.form.get('workerPhone3')?.value){
      body.telefones.push(this.form.get('workerPhone3')?.value.replace(/\D/g, ''));
    }

    const xhr : XMLHttpRequest = new XMLHttpRequest();

    xhr.open("PUT", "http://localhost:8080/api/profissionais/v1/" + this.currentSelectedId, false);

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      if(xhr.status == 200){
        for(let i = 0; i < this.profissionals.length; i++){
          if(this.profissionals[i].id === this.currentSelectedId){
            this.profissionals[i].nome = body.nome;
            this.profissionals[i].telefones = body.telefones;
            this.profissionals[i].porcentagemRepasse = body.porcentagemRepasse;

            for(let j = 0; j < this.profissionals[i].telefones.length; j++){
              this.profissionals[i].telefones[j] = this.maskPhoneNumber(this.profissionals[i].telefones[j]);
            }
    
            this.admin.notify("Alterações realizadas!", 3500);

            break;
          }
        }
      }
    }

    xhr.send(JSON.stringify(body));
  }

  requestAllBillsByProfessinalId(id: string): Promise<any>{
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:8080/api/servicosComanda/v1/search/professional?professionalId=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json()).then(data =>  resolve(data))
      .catch(error => reject(error));
    });
  }

  filterProfissional(){
    this.requestAllBillsByProfessinalId(this.currentSelectedId)
    .then(response => {

      const dataInicio = new Date(this.initialDateFilter);
      const dataFim = new Date(this.finalDateFilter);

      console.log(this.initialDateFilter);
      console.log(this.finalDateFilter);

      this.workerServicesList = response.filter((item: any) => {
        if (!item.dataServicoComanda) return false;

        const dataItem = new Date(item.dataServicoComanda);
        const dateAdjusted = new Date(dataItem.getTime() - 3 * 60 * 60 * 1000);
        const serviceDate = dateAdjusted.toISOString().split("T")[0];
        
        return serviceDate >= this.initialDateFilter && serviceDate <= this.finalDateFilter && item.statusServicosComanda === "FINALIZADA";
      });

      this.totalValueBills = '0';
      this.percentageOfTotal = '0';

      for(const service of this.workerServicesList){
        this.totalValueBills = (Number.parseFloat(this.totalValueBills) + service.valorServico).toString();
      }

      this.percentageOfTotal = this.maskCurrency(((Number.parseFloat(this.totalValueBills) * (this.pecentage / 100)) * 100).toString());
      this.totalValueBills = this.maskCurrency((Number.parseFloat(this.totalValueBills) * 100).toString());
    });
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

  showFinancialView(): void{

    if(!this.financialView){
      const pass =  prompt("Senha de acesso: ");

      if(pass == "Admin123") this.financialView = true;
      else this.financialView = false;
    }else{
      this.financialView = false;
    }
  }
}

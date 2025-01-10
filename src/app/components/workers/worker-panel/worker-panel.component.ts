import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'app-worker-panel',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './worker-panel.component.html',
  styleUrl: './worker-panel.component.css'
})

export class WorkerPanelComponent {
  editingView: boolean = false;
  profissionals: any = [];
  all_profissionals: any = [];
  @ViewChild('profissionalSearchbar') filter!: ElementRef;
  form: FormGroup;
  currentSelectedId: string = "";

  constructor(private app : AppComponent){
    this.requestAllProfissionals()
    .then(resolve => this.profissionals = resolve)
    .then(() => {
      for(let i = 0; i < this.profissionals.length; i++){
        const phones = this.profissionals[i].telefones;
        this.profissionals[i].dataCriacao = this.profissionals[i].dataCriacao.split('T')[0].split('-').reverse().join('/');
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
        this.form.get('workerPhone2')?.setValue(p.telefones[1]);
        this.form.get('workerPhone3')?.setValue(p.telefones[2]);
        this.form.get('workerRate')?.setValue(p.porcentagemRepasse.toString() + "%");
        this.form.get('workerRegister')?.setValue(p.dataCriacao.split('T')[0].split('-').reverse().join('/'));
      }
    });

    this.editingView = true;
    this.currentSelectedId = id;
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
        this.app.notify("Novo profissional cadastrado com sucesso!", 3500);

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
    this.app.openModal(
      {
        title: "EXCLUIR PROFISSIONAL", 
        message: "Tem certeza disso? Essa ação não poderá ser desfeita."
      }, () => {
        const xhr : XMLHttpRequest = new XMLHttpRequest();

        xhr.open("DELETE", "http://localhost:8080/api/profissionais/v1/" + this.currentSelectedId, false);

        xhr.setRequestHeader('Content-Type', 'application/json');
    
        xhr.onload = () => {
          if(xhr.status == 204){
            this.app.notify("Profissional removido!", 3500);
    
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
    
            this.app.notify("Alterações realizadas!", 3500);

            break;
          }
        }
      }
    }

    xhr.send(JSON.stringify(body));
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
}

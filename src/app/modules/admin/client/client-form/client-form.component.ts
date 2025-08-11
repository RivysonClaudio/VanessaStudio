import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminComponent } from '../../admin/admin.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-form',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent {
  routerType: string = 'register';
  title: string = "CADASTRAR NOVO CLIENTE";
  today: String = new Date().toLocaleDateString();
  form: FormGroup;
  standardPhoto: string = "images/standard-profile-picture.jpg";
  @ViewChild('photoInput') file!: ElementRef;
  imagePreviewSrc: string = this.standardPhoto;
  clientId: string | null = null;
  clientData: any;
  billsList: any = 0;
  professionalMode = "Sem informações";
  nearestRenew: string = 'Sem informações';
  serviceToBeRenewed: string = 'Sem informações';
  clientBillsTotalValue: string = '0';
  
  constructor(private admin: AdminComponent, private router: Router, private activeRoute: ActivatedRoute){
    this.form = new FormGroup({
      clientName:         new FormControl(),
      clientNick:         new FormControl(),
      clientPhone1:       new FormControl(),
      clientPhone2:       new FormControl(),
      clientPhone3:       new FormControl(),
      clientBirth:        new FormControl(),
      clientStreet:       new FormControl(),
      clientPostcode:     new FormControl(),
      clientNeighborhood: new FormControl(),
      clientCity:         new FormControl(),
      clientPhotoForm:    new FormControl()
    });
  }

  ngOnInit(){
    this.activeRoute.data.subscribe(data => {this.routerType = data['type']});
      if(this.routerType == 'edit'){
        this.title = "CONSULTA DE CLIENTE"
        this.activeRoute.paramMap.subscribe(param => {
          if(param.get('id') != null){
            this.clientId = param.get('id');

            const xhr = new XMLHttpRequest();

            xhr.open("GET", "http://localhost:8080/api/clientes/v1/" + this.clientId, false);

            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
              if(xhr.status == 200){
                this.clientData = JSON.parse(xhr.response)

                this.today = this.clientData.dataCriacao
                              .split('T')[0]
                              .split('-')
                              .reverse()
                              .join('/');

                this.validateImage(this.clientData.fotoPath)
                .then(() => {this.imagePreviewSrc = this.clientData.fotoPath})
                .catch(() => {this.imagePreviewSrc = this.standardPhoto})

                this.form.get('clientName')?.setValue(this.clientData.nome);
                this.form.get('clientNick')?.setValue(this.clientData.apelido);
                this.form.get('clientPhone1')?.setValue(this.maskPhoneNumber(this.clientData.telefones[0]));
                
                if(this.clientData.telefones[1] != undefined){
                  this.form.get('clientPhone2')?.setValue(this.maskPhoneNumber(this.clientData.telefones[1]));
                }
                if(this.clientData.telefones[2] != undefined){
                  this.form.get('clientPhone3')?.setValue(this.maskPhoneNumber(this.clientData.telefones[2]));
                }
                this.form.get('clientBirth')?.setValue(this.clientData.nascimento);
                this.form.get('clientStreet')?.setValue(this.clientData.endereco?.logradouro || '');
                this.form.get('clientNeighborhood')?.setValue(this.clientData.endereco?.bairro || '');
                this.form.get('clientCity')?.setValue(this.clientData.endereco?.localidade || '');
                this.form.get('clientPostcode')?.setValue(this.clientData.endereco?.cep || '');

              }else{
                this.router.navigate(["admin/clientes"])
              }
            }

            xhr.onerror = () => {
              this.router.navigate(["admin/clientes"])
            }

            xhr.send()
          }else{
            this.router.navigate(["admin/clientes"])
          }
      });
    }

    this.form.get('clientName')?.valueChanges.subscribe(value => {
      const firstName = value.split(' ')[0];
      this.form.get('clientNick')?.setValue(firstName);
    });

    [this.form.get('clientPhone1'), this.form.get('clientPhone2'), this.form.get('clientPhone3')].forEach(input => {
      input?.valueChanges.subscribe(value => {
        input?.setValue(this.maskPhoneNumber(value), {emitEvent: false});
      });
    });

    this.form.get('clientBirth')?.valueChanges.subscribe(value => {
      this.form.get('clientBirth')?.setValue(this.maskDateFormat(value), {emitEvent: false});
    });

    this.form.get('clientPostcode')?.valueChanges.subscribe(value => {
      this.form.get('clientPostcode')?.setValue(this.maskPostCode(value), {emitEvent: false});

      if(value.length === 10){
        this.tryToGetPostCodeInfos(value)
        .then(postCodeInfo => {
          this.form.get('clientStreet')       ?.setValue(postCodeInfo.logradouro);
          this.form.get('clientNeighborhood') ?.setValue(postCodeInfo.bairro);
          this.form.get('clientCity')         ?.setValue(postCodeInfo.localidade + " - " + postCodeInfo.uf);
        })
        .catch(erro => {console.error("Erro ao buscar informações do CEP:", erro);})
      }
    });

    this.getBills()
    .then(data => {
      this.billsList = data;
    })
    .then(() => {
      const contagem: Record<string, number> = {};
      const totalBills = this.billsList.length;
      const startIndex = Math.max(0, totalBills - 5);
      let maxFrequencia = 0;
      
      for (let i = totalBills - 1; i >= startIndex; i--) {
        const bill = this.billsList[i];
      
        if(!bill || bill.statusComanda !== "FINALIZADA") continue;
      
        bill.servicosComandas.forEach((service: any) => {
          if (service.profissionalNome) {
            contagem[service.profissionalNome] = (contagem[service.profissionalNome] || 0) + 1;

            if (contagem[service.profissionalNome] > maxFrequencia) {
              maxFrequencia = contagem[service.profissionalNome];
              this.professionalMode = service.profissionalNome;
            }
          }

          const nextRenew = new Date(service.dataServicoComanda.split('T')[0]);
          nextRenew.setDate(nextRenew.getDate() + service.renovacaoServico);

          if(nextRenew.toISOString().split('T')[0].replace(/-/g, '') > this.nearestRenew.replace(/-/g, '') || this.nearestRenew == 'Sem informações'){
            this.nearestRenew = nextRenew.toISOString().split('T')[0];
            this.serviceToBeRenewed = `[${service.categoriaServico}] : ${service.descricaoServico}`;
          }

        });

        this.clientBillsTotalValue = (Number.parseFloat(this.clientBillsTotalValue) + bill.valorTotal);
      }

      this.clientBillsTotalValue = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number.parseFloat(this.clientBillsTotalValue));
    })
  }

  onSubmit(): void{
    const formData = new FormData();

    const input = this.file.nativeElement as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null

    if(file != null){formData.append('file'      , file)}

    formData.append('nome'      , this.form.get('clientName')?.value);
    formData.append('apelido'   , this.form.get('clientNick')?.value);
    if(this.form.get('clientPhone1')?.value != null && this.form.get('clientPhone1')?.value != ''){
      formData.append('telefones' , this.form.get('clientPhone1')?.value.replace(/\D/g, ''));
    }
    if(this.form.get('clientPhone2')?.value != null && this.form.get('clientPhone2')?.value != ''){
      formData.append('telefones' , this.form.get('clientPhone2')?.value.replace(/\D/g, ''));
    }
    if(this.form.get('clientPhone3')?.value != null && this.form.get('clientPhone3')?.value != ''){
      formData.append('telefones' , this.form.get('clientPhone3')?.value.replace(/\D/g, ''));
    }

    formData.append('nascimento', this.form.get('clientBirth')?.value);

    if(this.form.get('clientStreet')?.value != null){
      formData.append('endereco.logradouro' , this.form.get('clientStreet')?.value);
    }
    if(this.form.get('clientPostcode')?.value != null){
      formData.append('endereco.cep' , this.form.get('clientPostcode')?.value);
    }
    if(this.form.get('clientNeighborhood')?.value != null){
      formData.append('endereco.bairro' , this.form.get('clientNeighborhood')?.value);
    }
    if(this.form.get('clientCity')?.value != null){
      formData.append('endereco.localidade' , this.form.get('clientCity')?.value);
    }

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "http://localhost:8080/api/clientes/v1", false);

    xhr.onload = () => {
      if (xhr.status == 201){
        this.router.navigate(["admin/clientes"]);
        this.admin.notify("Cliente cadastrado com sucesso!", 3000);
      }else{
        this.admin.notify("Ops!<br>Foram encontrados erros preenchimento dos dados.", 3000);
      }
    }

    xhr.send(formData);
  }

  onEdit(): void{
    const formData = new FormData();
    const input = this.file.nativeElement as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null

    if(file != null){
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.open("PUT", `http://localhost:8080/api/clientes/v1/${this.clientId}?urlFile=${this.clientData.fotoPath}`, false);
  
      xhr.onload = () => {
        if (xhr.status == 200){
          this.admin.notify("As alterações foram salvas.", 3000);
        }
      }
  
      xhr.send(formData);
    }

    if (this.imagePreviewSrc == this.standardPhoto && this.clientData.fotoPath != 'null'){
      const xhr = new XMLHttpRequest();

      xhr.open("DELETE", `http://localhost:8080/api/clientes/v1/${this.clientId}/file?urlFile=${this.clientData.fotoPath}`, false);

      xhr.setRequestHeader('Content-Type', 'application/json');
  
      xhr.onload = () => {
        if (xhr.status == 204){
          this.clientData.fotoPath = 'null';
          this.admin.notify("As alterações foram salvas.", 3000);
        }
      }

      xhr.onerror = () => {
        this.admin.notify("Não foi possível excluir a imagem.", 3000);
      }
  
      xhr.send();
    }

    formData.append('nome'      , this.form.get('clientName')?.value);
    formData.append('apelido'   , this.form.get('clientNick')?.value);
    formData.append('telefones' , this.form.get('clientPhone1')?.value.replace(/\D/g, ''));

    if(this.form.get('clientPhone2')?.value != null && this.form.get('clientPhone2')?.value != ''){
      formData.append('telefones' , this.form.get('clientPhone2')?.value.replace(/\D/g, ''));
    }
    if(this.form.get('clientPhone3')?.value != null && this.form.get('clientPhone3')?.value != ''){
      formData.append('telefones' , this.form.get('clientPhone3')?.value.replace(/\D/g, ''));
    }

    formData.append('nascimento', this.form.get('clientBirth')?.value);

    if(this.form.get('clientStreet')?.value != null){
      formData.append('endereco.logradouro' , this.form.get('clientStreet')?.value);
    }
    if(this.form.get('clientPostcode')?.value != null){
      formData.append('endereco.cep' , this.form.get('clientPostcode')?.value);
    }
    if(this.form.get('clientNeighborhood')?.value != null){
      formData.append('endereco.bairro' , this.form.get('clientNeighborhood')?.value);
    }
    if(this.form.get('clientCity')?.value != null){
      formData.append('endereco.localidade' , this.form.get('clientCity')?.value);
    }

    console.log(formData)

    const xhr = new XMLHttpRequest();

    xhr.open("PUT", `http://localhost:8080/api/clientes/v1/${this.clientId}`, false);

    xhr.onload = () => {
      if (xhr.status == 200){
        this.admin.notify("As alterações foram salvas.", 3000);
        this.router.navigate(['admin/clientes']);
      }
    }

    xhr.send(formData);
  }

  onDelete(): void{
    this.admin.openModal({
      title: "EXCLUIR CLIENTE",
      message: "Você tem certeza que desejsa excluir o cliente?<br>Uma vez confirmada está ação não poderá ser desfeita."},
      () => {
        const xhr = new XMLHttpRequest();

        xhr.open("DELETE", "http://localhost:8080/api/clientes/v1/" + this.clientId, false);

        xhr.setRequestHeader('Content-Type', 'application/json');
    
        xhr.onload = () => {
          if (xhr.status == 204){
            this.router.navigate(["admin/clientes"]);
            this.admin.notify("O cliente foi excluido.", 3000);
          }
        }
    
        xhr.send();
    });
  }

  onFileSelected(e: Event): void{
    const input = e.target as HTMLInputElement;

    if (input.files && input.files[0]){
      const file = input.files[0];

      if (file.type.startsWith('image/jpeg')){
        const reader = new FileReader();

        reader.onload = () => {
          this.imagePreviewSrc = reader.result as string;
        }

        reader.readAsDataURL(file);
      }else{
        this.imagePreviewSrc = "images/standard-profile-picture.jpg";
      }
    }
  }

  deleteImage(): void{
    if(this.routerType == 'register'){
      const input = this.file.nativeElement as HTMLInputElement;
      input.value = '';
      this.imagePreviewSrc = this.standardPhoto;
    }

    if (this.routerType == 'edit'){
      this.imagePreviewSrc = this.standardPhoto;
    }
  }

  tryToGetPostCodeInfos(value: string): Promise<any>{
    return new Promise((resolve, reject) => {
      const onlyNumber: string = value.replace(/\D/g, '');

      const xhr: XMLHttpRequest = new XMLHttpRequest();
  
      xhr.open("GET", "https://viacep.com.br/ws/" + onlyNumber + "/json/", true);

      xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE){
          if(xhr.status == 200){
            resolve(JSON.parse(xhr.response));
          }
        }
      }

      xhr.onerror = () => {
        reject(false);
      };

      xhr.send();
    });
  }

  maskPostCode(value: string): string{
    const mask = "##.###-###";

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

  maskDateFormat(value: string): string{
    const mask = "##/##/####";

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

  validateImage(url: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(true);
      img.onerror = () => reject(false);

      img.src = url;
    });
  }

  getBills(): Promise<any>{
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:8080/api/comandas/v1/search/customer?customerId=${this.clientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json()).then(data =>  resolve(data))
      .catch(error => reject(error));
    });
  }
}

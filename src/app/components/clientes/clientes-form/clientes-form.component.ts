import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-clientes-form',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './clientes-form.component.html',
  styleUrl: './clientes-form.component.css'
})
export class ClientesFormComponent {
  title: string = "CADASTRAR NOVO CLIENTE";

  today: String = new Date().toLocaleDateString();

  form: FormGroup;

  standardPhoto: string = "images/standard-profile-picture.jpg";
  @ViewChild('photoInput') file!: ElementRef;
  imagePreviewSrc: string = this.standardPhoto;

  clientId: string | null = null;
  clientData: any;

  constructor(private router: Router, private activeRoute: ActivatedRoute){
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
    this.activeRoute.data.subscribe(data => {
      if(data['type'] == 'edit'){
        this.title = "CONSULTA DE CLIENTE"
        this.activeRoute.paramMap.subscribe(param => {
          if(param.get('id') != null){
            this.clientId = param.get('id');

            const xhr = new XMLHttpRequest();

            xhr.open("GET", "http://localhost:8080/api/clientes/v1/" + this.clientId, false)

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
                this.form.get('clientPhone1')?.setValue(this.clientData.telefones[0]);
                this.form.get('clientBirth')?.setValue(this.clientData.nascimento);

              }else{
                this.router.navigate(["/clientes"])
              }
            }

            xhr.onerror = () => {
              this.router.navigate(["/clientes"])
            }

            xhr.send()
          }else{
            this.router.navigate(["/clientes"])
          }
      });
      }
    })
    
    this.form.get('clientName')?.valueChanges.subscribe(value => {
      const firstName = value.split(' ')[0];
      this.form.get('clientNick')?.setValue(firstName);
    });

    this.form.get('clientPostcode')?.valueChanges.subscribe(value => {
      this.form.get('clientPostcode')?.setValue(this.formatPostCode(value), {emitEvent: false});

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
  }

  onSubmit(): void{
    const formData = new FormData();

    const input = this.file.nativeElement as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null

    if(file != null){formData.append('file'      , file)}

    formData.append('nome'      , this.form.get('clientName')?.value);
    formData.append('apelido'   , this.form.get('clientNick')?.value);
    formData.append('telefone' , this.form.get('clientPhone1')?.value);

    if(this.form.get('clientPhone2')?.value != null){
      formData.append('telefone' , this.form.get('clientPhone2')?.value);
    }
    if(this.form.get('clientPhone3')?.value != null){
      formData.append('telefone' , this.form.get('clientPhone3')?.value);
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
        this.router.navigate(["/clientes"]);
      }
    }

    xhr.send(formData);
  }

  onFileSelected(e: Event){
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

  formatPostCode(value: string): string{
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

  validateImage(url: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(true);
      img.onerror = () => reject(false);

      img.src = url;
    });
  }
}

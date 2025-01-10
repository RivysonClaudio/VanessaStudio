import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'app-sevice-form',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './sevice-form.component.html',
  styleUrl: './sevice-form.component.css'
})

export class SeviceFormComponent {
  routerType: string = "";
  title: string = "REGISTRAR NOVO SERVIÇO";
  form: FormGroup;
  serviceId: string | null = null;

  constructor(private app: AppComponent, private router: Router, private activeRoute: ActivatedRoute){
    this.form = new FormGroup({
      serviceCategory:    new FormControl('0'),
      serviceDescription: new FormControl(),
      serviceValue:       new FormControl(),
      serviceInterval:    new FormControl()
    })
  }

  ngOnInit(): void{
    this.activeRoute.data.subscribe(data => {this.routerType = data['type']});

    if (this.routerType  == 'edit'){
      this.title = "CONSULTA DE SERVIÇO";

      this.activeRoute.paramMap.subscribe(param => {
        if(param.get('id') != null){
          this.serviceId = param.get('id');

          const xhr = new XMLHttpRequest();

          xhr.open("GET", "http://localhost:8080/api/servicos/v1/" + this.serviceId, false)

          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.onload = () => {
            if(xhr.status == 200){
              
              const service = JSON.parse(xhr.response);

              this.form.get('serviceCategory')?.setValue(service.tipoServico);
              this.form.get('serviceDescription')?.setValue(service.descricao);
              this.form.get('serviceValue')?.setValue(this.maskCurrency((service.valorServico * 100).toString()));
              this.form.get('serviceInterval')?.setValue(service.intervaloRenovacao);

            }else{
              this.router.navigate(["/servicos"])
            }
          }

          xhr.onerror = () => {
            this.router.navigate(["/servicos"])
          }

          xhr.send()
        }
      });
    }

    this.form.get('serviceValue')?.valueChanges.subscribe(value => {
      const formattedValue = this.maskCurrency(value);
      if (formattedValue !== value) {
        this.form.get('serviceValue')?.setValue(formattedValue, { emitEvent: false });
      }
    });

    this.form.get('serviceInterval')?.valueChanges.subscribe(value => {
      const formattedValue = value.replace(/\D/g, '');
      if (formattedValue !== value) {
        this.form.get('serviceInterval')?.setValue(formattedValue, { emitEvent: false });
      }
    });
  }

  onSubmit(): void{
    const body = {
      tipoServico:  this.form.get('serviceCategory')?.value,
      descricao:    this.form.get('serviceDescription')?.value,
      valorServico: parseFloat(this.form.get('serviceValue')?.value.replace(/\D/g, '')) / 100,
      intervaloRenovacao: Number.parseInt(this.form.get('serviceInterval')?.value)
    }

    const xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open("POST", "http://localhost:8080/api/servicos/v1", false);

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      if (xhr.status == 201){
        this.router.navigate(['/servicos'])
      }
    }

    xhr.send(JSON.stringify(body));
  }

  onEdit(){
    const body = {
      tipoServico:  this.form.get('serviceCategory')?.value,
      descricao:    this.form.get('serviceDescription')?.value,
      valorServico: parseFloat(this.form.get('serviceValue')?.value.replace(/\D/g, '')) / 100,
      intervaloRenovacao: Number.parseInt(this.form.get('serviceInterval')?.value)
    }

    const xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open("PUT", `http://localhost:8080/api/servicos/v1/update?id=${this.serviceId}`, false);

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      if (xhr.status == 200){
        this.app.notify("As alterações foram salvas!", 3500);
        this.router.navigate(['/servicos'])
      }else{
        this.app.notify("Ação não realizada", 3500);
      }
    }

    xhr.send(JSON.stringify(body));
  }

  onDelete(){
    this.app.openModal(
      {
        title: "EXCLUIR SERVIÇO",
        message: "Tem certeza disso? Essa ação não poderá ser desfeita."
      },
      () => {
        const xhr: XMLHttpRequest = new XMLHttpRequest();

        xhr.open("DELETE", `http://localhost:8080/api/servicos/v1/delete/${this.serviceId}`, false);

        xhr.setRequestHeader('Content-Type', 'application/json');
    
        xhr.onload = () => {
          if (xhr.status == 204){
            this.app.notify("Serviço excluido com sucesso!", 3500);
            this.router.navigate(['/servicos'])
          }else{
            this.app.notify("Ação não realizada", 3500);
          }
        }
    
        xhr.send();
      }
    )
  }

  maskCurrency(value: string): string{
    const mask = "##.###.###.##0,00";

    let onlynumbers: string = value.replace(/\D/g, '');

    if (!onlynumbers || isNaN(Number(onlynumbers))) {
      return "R$ 0,00";
    }

    onlynumbers = Number.parseInt(onlynumbers).toString();
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

    return "R$ " + maskedValue;
  }
}

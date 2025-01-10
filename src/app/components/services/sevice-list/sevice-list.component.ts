import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sevice-list',
  imports: [RouterLink],
  templateUrl: './sevice-list.component.html',
  styleUrl: './sevice-list.component.css'
})
export class SeviceListComponent {
  @ViewChild('servicesSearchbar') filter!: ElementRef;
  services: any[] = [];
  all_services: any[] = [];

  constructor(){
    this.getAllServices().then(resolve => {
      this.services = resolve;
      for(let i = 0; i < this.services.length; i++){
        this.services[i].valorServico = this.maskCurrency((this.services[i].valorServico * 100).toString())
      }
      this.all_services = this.services;
    })
  }

  ngAfterViewInit() {
    const filter = this.filter.nativeElement as HTMLInputElement;

    filter.addEventListener('input', () => {
      this.services = []
      for(const service of this.all_services){
          const term: string = `${service.tipoServico}: ${service.descricao}`;
          if(term.toUpperCase().includes(filter.value.toUpperCase())){
            this.services.push(service);
          }
      }
    });
  }

  getAllServices(): Promise<any>{
    return new Promise((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();

      xhr.open("GET", "http://localhost:8080/api/servicos/v1/", false);

      xhr.setRequestHeader('Content-Type', 'application/json')

      xhr.onload = () => {
        if (xhr.status == 200){
          resolve(JSON.parse(xhr.responseText))
        }else{
          reject(xhr.status)
        }
      }

      xhr.send();
    });
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

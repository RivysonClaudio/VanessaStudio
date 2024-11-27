import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteCartaoComponent } from './cliente-cartao/cliente-cartao.component';

@Component({
  selector: 'app-clientes-panel',
  imports: [RouterLink, ClienteCartaoComponent],
  templateUrl: './clientes-panel.component.html',
  styleUrl: './clientes-panel.component.css'
})
export class ClientesPanelComponent {
  api_url: string = "http://localhost:8080/api/clientes/v1/";
  clientes: any[] = [];

  constructor(){
    this.getClientsData().then((json: any) => {
      this.clientes = json;
    });
  }

  getClientsData(){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("GET", this.api_url, true);
  
      xhr.onload = function (){
        if (xhr.status === 200){
          resolve(JSON.parse(xhr.responseText));
        }
      }

      xhr.onerror = function (){
        reject(console.log("Erro ao buscar dados dos clientes"));
      }
  
      xhr.send()
    })
  }
}
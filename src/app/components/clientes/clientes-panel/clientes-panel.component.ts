import { Component, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('clientSearchbar') filter!: ElementRef;
  allClients: any[] = [];
  clientes: any[] = [];

  constructor(){
    this.getClientsData().then((json: any) => {
      this.clientes = json;
      this.allClients = json;
    });
  }

  ngAfterViewInit() {
    const filter = this.filter.nativeElement as HTMLInputElement;
    filter.addEventListener('input', () => {
      this.clientes = []
      for(const client of this.allClients){
          const term: string = `${client.nome}|${client.apelido}|${client.telefones[0].replace(/\D/g, '')}`;
          if(term.toUpperCase().includes(filter.value.toUpperCase())){
            this.clientes.push(client);
          }
      }
    });
  }

  getClientsData(){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("GET", this.api_url, true);

      xhr.setRequestHeader('Content-Type', 'application/json');
  
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
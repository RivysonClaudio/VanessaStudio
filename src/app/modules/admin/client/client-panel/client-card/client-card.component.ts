import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-card',
  imports: [RouterLink],
  templateUrl: './client-card.component.html',
  styleUrl: './client-card.component.css'
})
export class ClientCardComponent {
    @Input() dados: any;
    
    standardPhoto: string = "images/standard-profile-picture.jpg";
    photo: string = "";
    number: string = "";
  
    ngOnInit(){
      if(this.dados?.telefones[0]){
        this.number = this.maskPhoneNumber(this.dados.telefones[0]);
      }
    }
  
    ngOnChanges(){
      if(this.dados?.fotoPath){
        this.validateImage(this.dados.fotoPath)
        .then(() => {this.photo = this.dados.fotoPath})
        .catch(() => {this.photo = this.standardPhoto})
      }
    }
  
    validateImage(url: string): Promise<boolean>{
      return new Promise((resolve, reject) => {
        const img = new Image();
  
        img.onload = () => resolve(true);
        img.onerror = () => reject(false);
  
        img.src = url;
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
}

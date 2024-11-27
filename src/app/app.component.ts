import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'vanessa-studio-angular';

  static formatPhoneNumber(number: string): string{
    let numberFormated: string = "";

    numberFormated = number.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

    return numberFormated;
  }
}
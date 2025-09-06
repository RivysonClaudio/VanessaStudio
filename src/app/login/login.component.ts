import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { routes } from '../app.routes';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router: Router){}

  username: string = "";
  password: string = "";

  validation: boolean = true;

  set_username(event: Event): void{
    this.username = (event.target as HTMLInputElement).value;
  }
  set_password(event: Event): void{
    this.password = (event.target as HTMLInputElement).value;
  }

  login(): void{
    if(this.username == "vanes" && this.password === "vanes"){
      this.router.navigate(['/admin/home']);
    }else{
      this.validation = false;
    }
  }
}

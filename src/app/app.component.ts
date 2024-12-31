import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ModalComponent } from './components/modal/modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title: string = 'vanessa-studio-angular';
  showNotification: boolean = false;
  notificationMessage: string = "";
  isModalOpen = false;
  modalData = {title: '', message: ''};
  private callback?: () => void;

  notify(message: string, time: number): void{
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
      this.notificationMessage = "";
    }, time);
  }

  desableNotification(): void{
    this.showNotification = false;
  }

  confirmModal(): void{
    if(this.callback){this.callback()}
    this.closeModal();
  }

  openModal(data: {title: string, message: string}, callback: () => void) {
    this.modalData = data;
    this.callback = callback;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
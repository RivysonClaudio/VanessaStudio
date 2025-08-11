import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterLink, ModalComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent {
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

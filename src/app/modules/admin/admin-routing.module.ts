import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';
import { ClientPanelComponent } from './client/client-panel/client-panel.component';
import { ClientFormComponent } from './client/client-form/client-form.component';
import { ServiceListComponent } from './service/service-list/service-list.component';
import { ServiceFormComponent } from './service/service-form/service-form.component';
import { WorkerComponent } from './worker/worker.component';
import { BillPanelComponent } from './bill/bill-panel/bill-panel.component';
import { BillFormComponent } from './bill/bill-form/bill-form.component';


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
            {
            path: "home",
            component: HomeComponent
            },
            {
                path: "clientes",
                component: ClientPanelComponent,
            },
            {
                path: "clientes/registrar",
                component: ClientFormComponent,
                data: {type: 'register'}
            },
            {
                path: "clientes/consulta/:id",
                component: ClientFormComponent,
                data: {type: 'edit'}
            },
            {
                path: "servicos",
                component: ServiceListComponent
            },
            {
                path: "servicos/registrar",
                component: ServiceFormComponent,
                data: {type: 'register'}
            },
            {
                path: "servicos/consulta/:id",
                component: ServiceFormComponent,
                data: {type: 'edit'}
            },
            {
                path: "profissionais",
                component: WorkerComponent
            },
            {
                path: "comandas",
                component: BillPanelComponent
            },
            {
                path: "comandas/registrar",
                component: BillFormComponent,
                data: {type: 'register'}

            },
            {
                path: "comandas/consulta/:id",
                component: BillFormComponent,
                data: {type: 'edit'}

            }

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

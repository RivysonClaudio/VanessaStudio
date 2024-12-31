import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ClientesPanelComponent } from './components/clientes/clientes-panel/clientes-panel.component';
import { ClientesFormComponent } from './components/clientes/clientes-form/clientes-form.component';
import { SeviceListComponent } from './components/services/sevice-list/sevice-list.component';
import { SeviceFormComponent } from './components/services/sevice-form/sevice-form.component';
import { WorkerPanelComponent } from './components/workers/worker-panel/worker-panel.component';

export const routes: Routes = [
    {
        path: "home",
        component: HomeComponent
    },
    {
        path: "clientes",
        component: ClientesPanelComponent
    },
    {
        path: "clientes/registrar",
        component: ClientesFormComponent,
        data: {type: 'register'}
    },
    {
        path: "clientes/:id",
        component: ClientesFormComponent,
        data: {type: 'edit'}
    },
    {
        path: "servicos",
        component: SeviceListComponent
    },
    {
        path: "servicos/registrar",
        component: SeviceFormComponent,
        data: {type: 'register'}
    },
    {
        path: "servicos/consulta/:id",
        component: SeviceFormComponent,
        data: {type: 'edit'}
    },
    {
        path: "profissionais",
        component: WorkerPanelComponent
    }
];

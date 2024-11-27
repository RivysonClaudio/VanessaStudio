import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ClientesPanelComponent } from './components/clientes/clientes-panel/clientes-panel.component';
import { ClientesFormComponent } from './components/clientes/clientes-form/clientes-form.component';

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
    }
];

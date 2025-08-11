import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent,
    },
    {
        path: 'admin',
        loadChildren: () => import ('./modules/admin/admin.module').then((m) => m.AdminModule)
    },
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full"
    }
];

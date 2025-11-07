import { Routes } from '@angular/router';
import { GestionCursos } from './gestion-cursos/gestion-cursos';
import { Login } from './login/login';
import { Register } from './register/register';

export const routes: Routes = [
    {path: '', component:Login },
    {path : 'login', component:Login } ,
    {path: 'gestion-cursos', component: GestionCursos },
    {path: 'register', component: Register},
    {path : '**', redirectTo: '' }
];

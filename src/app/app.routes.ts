import { Routes } from '@angular/router';
import { EmployeesComponent } from './component/employees/employees.component';

export const routes: Routes = [
    { path: '', redirectTo: 'employees', pathMatch: 'full' },
    { path: 'employees', component: EmployeesComponent },
    { path: '**', redirectTo: 'employees' }
];

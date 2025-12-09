import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../service/employee.service';
import { Employee } from '../../models/employee.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './employees.component.html'
})
export class EmployeesComponent implements OnInit {

  employees: Employee[] = [];
  employeeForm!: FormGroup;
  isEditMode = false;
  selectedEmployeeId: number | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadEmployees();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      salary: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  loadEmployees(): void {
    this.isLoading = true;

    this.employeeService.getAll().subscribe({
      next: (res) => {
        this.employees = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 0) {
          Swal.fire(
            'API Not Available',
            'Backend service is not running. Please start the API.',
            'warning'
          );
        } else {
          Swal.fire('Error', 'Failed to load employees', 'error');
        }
      }
    });
  }


  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.selectedEmployeeId != null) {
      const updatedEmployee: Employee = {
        id: this.selectedEmployeeId!,
        ...this.employeeForm.value
      };


      this.isLoading = true;

      this.employeeService.update(this.selectedEmployeeId!, updatedEmployee)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            Swal.fire('Updated', 'Employee updated successfully', 'success');
            this.resetForm();
            setTimeout(() => this.loadEmployees(), 300);
          },
          error: () => {
            Swal.fire('Error', 'Update failed, please refresh', 'error');
          }
        });

    } else {
      // Add mode
      this.isLoading = true;

      this.employeeService.add(this.employeeForm.value)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            Swal.fire('Added', 'Employee added successfully', 'success');
            this.resetForm();
            setTimeout(() => this.loadEmployees(), 300); // ✅ delay
          },
          error: () => {
            Swal.fire('Error', 'Something went wrong, please refresh', 'error');
          }
        });

    }
  }

  onEdit(emp: Employee): void {
    this.isEditMode = true;
    this.selectedEmployeeId = emp.id;
    this.employeeForm.patchValue({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      salary: emp.salary
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDelete(emp: Employee): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete employee "${emp.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.isLoading = true;

        this.employeeService.delete(emp.id)
          .pipe(
            finalize(() => this.isLoading = false)
          )
          .subscribe({
            next: () => {
              Swal.fire('Deleted', 'Employee deleted successfully', 'success');
              setTimeout(() => this.loadEmployees(), 300);
            },
            error: () => {
              Swal.fire('Error', 'Delete failed, please refresh', 'error');
            }
          });

      }
    });
  }

  onView(emp: Employee): void {
    Swal.fire({
      title: 'Employee Details',
      html: `
      <div style="
        text-align:left;
        border-radius:10px;
        padding:15px;
        background:#f8f9fa;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">
        <p><strong>Id:</strong> ${emp.id}</p>
        <p><strong>Name:</strong> ${emp.name}</p>
        <p><strong>Email:</strong> ${emp.email}</p>
        <p><strong>Department:</strong> ${emp.department}</p>
        <p><strong>Salary:</strong> ₹ ${emp.salary}</p>
      </div>
    `,
      showCloseButton: true,
      confirmButtonText: 'Close',
      width: 450
    });
  }


  resetForm(): void {
    this.employeeForm.reset();
    this.isEditMode = false;
    this.selectedEmployeeId = null;
  }

  get f() {
    return this.employeeForm.controls;
  }
}

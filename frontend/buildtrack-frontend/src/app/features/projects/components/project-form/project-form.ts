import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css'
})
export class ProjectForm implements OnInit {
  @Input() title: string = 'Project Form';
  @Input() initialData: any = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  projectForm!: FormGroup;

  categories = [
    'Residential',
    'Commercial',
    'Industrial',
    'Infrastructure',
    'Government Projects'
  ];

  statuses = [
    'Planning',
    'Active',
    'Delayed',
    'Completed'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.projectForm = this.fb.group({
      name: [this.initialData?.name || '', Validators.required],
      category: [this.initialData?.category || '', Validators.required],
      client: [this.initialData?.client || '', Validators.required],
      manager: [this.initialData?.manager || '', Validators.required],
      startDate: [this.initialData?.startDate || '', Validators.required],
      endDate: [this.initialData?.endDate || '', Validators.required],
      budget: [this.initialData?.budget || null, [Validators.required, Validators.min(0.01)]],
      status: [this.initialData?.status || 'Planning', Validators.required],
      description: [this.initialData?.description || '']
    }, { validators: this.dateValidator });
  }

  dateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (start && end && new Date(end) < new Date(start)) {
      return { dateMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.save.emit(this.projectForm.value);
    } else {
      this.projectForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.projectForm.reset();
    this.cancel.emit();
  }
}

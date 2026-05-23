import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  @Input() placeholder = 'Search...';
  @Input() value = '';
  @Output() readonly searched = new EventEmitter<string>();

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.searched.emit(value ?? ''));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!('value' in changes)) return;
    const next = typeof this.value === 'string' ? this.value : '';
    if (this.searchControl.value === next) return;
    this.searchControl.setValue(next, { emitEvent: false });
  }
}

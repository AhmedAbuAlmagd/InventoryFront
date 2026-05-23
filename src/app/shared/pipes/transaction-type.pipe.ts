import { Pipe, PipeTransform } from '@angular/core';
import { TransactionType } from '../../core/models/inventory.model';

@Pipe({ name: 'transactionType', standalone: true, pure: true })
export class TransactionTypePipe implements PipeTransform {
  transform(value: TransactionType): string {
    return value === 'In' ? 'Stock In' : 'Stock Out';
  }
}


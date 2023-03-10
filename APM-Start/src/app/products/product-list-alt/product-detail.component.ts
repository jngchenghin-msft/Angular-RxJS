import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, EMPTY, map, Subject } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
    private errorMessageSubject = new Subject<string>();
    errorMessageSubject$ = this.errorMessageSubject.asObservable();

    constructor(private productService: ProductService) { }

    productDetail$ = this.productService.selectedProduct$.pipe(
        catchError(err => {
            this.errorMessageSubject.next(err);
            return EMPTY;
        }
        ));

    productSuppliers$ = this.productService.selectedProductSuppliers$.pipe(
        catchError(err => {
            this.errorMessageSubject.next(err);
            return EMPTY;
        }
        ));

    pageTitle$ = this.productDetail$.pipe(
        map(product => product ? `Product Detail for: ${product.productName}` : null)
    );
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, EMPTY, filter, map, Subject, combineLatest, tap } from 'rxjs';

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
    productSuppliersLoading$ = this.productService.suppliersLoadingSubject$;

    pageTitle$ = this.productDetail$.pipe(
        map(product => product ? `Product Detail for: ${product.productName}` : null)
    );

    vm$ = combineLatest([
        this.productDetail$,
        this.productSuppliers$,
        this.pageTitle$
    ]).pipe(
        filter(([product]) => Boolean(product)),
        map(([product, suppliers, pageTitle]) => ({ product, suppliers, pageTitle })),
    );
}

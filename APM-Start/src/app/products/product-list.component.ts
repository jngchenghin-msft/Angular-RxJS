import { ChangeDetectionStrategy, Component } from '@angular/core';

import { catchError, combineLatest, EMPTY, map, startWith, Subject } from 'rxjs';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { ProductService } from './product.service';

@Component({
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
    pageTitle = 'Product List';
    private errorMessageSubject = new Subject<string>();
    errorMessageSubject$ = this.errorMessageSubject.asObservable();

    private categorySelectedSubject = new Subject<number>();
    categorySelectedAction$ = this.categorySelectedSubject.asObservable();

    products$ = combineLatest([
        this.productService.updatedProducts$,
        this.categorySelectedAction$.pipe(startWith(0))
    ]).pipe(
        map(([products, categoryId]) => products.filter(product =>
            categoryId ? product.categoryId === categoryId : true
        )),
        catchError(err => { this.errorMessageSubject.next(err); return EMPTY; })
    );

    categories$ = this.productCategoryService.categories$.pipe(
        catchError(err => { this.errorMessageSubject.next(err); return EMPTY; })
    );


    constructor(private productService: ProductService, private productCategoryService: ProductCategoryService) {}

    onAdd(): void {
        this.productService.addNewProduct();
    }

    onDelete(productToDelete: number): void {
        this.productService.deleteProduct(productToDelete);
    }

    onEdit(productToEdit: number): void {
        this.productService.editProduct(productToEdit);
    }

    onSelected(categoryId: string): void {
        this.categorySelectedSubject.next(+categoryId);
    }
}

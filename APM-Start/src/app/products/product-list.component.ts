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
    errorMessage = '';

    private categorySelectedSubject = new Subject<number>();
    categorySelectedAction$ = this.categorySelectedSubject.asObservable();

    products$ = combineLatest([
        this.productService.productsWithCategory$,
        this.categorySelectedAction$.pipe(startWith(0))
    ]).pipe(
        map(([products, categoryId]) => products.filter(product =>
            categoryId ? product.categoryId === categoryId : true
        )),
        catchError(err => { this.errorMessage = err; return EMPTY; })
    );

    categories$ = this.productCategoryService.categories$.pipe(
        catchError(err => { this.errorMessage = err; return EMPTY; })
    );


    constructor(private productService: ProductService, private productCategoryService: ProductCategoryService) { }

    onAdd(): void {
        console.log('Not yet implemented');
    }

    onSelected(categoryId: string): void {
        this.categorySelectedSubject.next(+categoryId);
    }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, catchError, combineLatest, EMPTY, map } from 'rxjs';
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

    // using BehaviorSubject so that on page load all items are shown by default
    private categorySelectedSubject = new BehaviorSubject<number>(0);
    categorySelectedAction$ = this.categorySelectedSubject.asObservable();

    products$ = this.productService.productsWithCategory$.pipe(
        catchError(err => { this.errorMessage = err; return EMPTY; })
    );

    categories$ = this.productCategoryService.categories$.pipe(
        catchError(err => { this.errorMessage = err; return EMPTY; })
    );

    productsSimpleFilter$ = combineLatest([
        this.productService.productsWithCategory$,
        this.categorySelectedAction$
    ]).pipe(
        map(([products, categoryId]) => products.filter(product =>
            categoryId ? product.categoryId === categoryId : true
        )),
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

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, filter, forkJoin, map, merge, Observable, of, scan, shareReplay, Subject, switchMap, tap, throwError } from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from "../product-categories/product-category.service";
import { SupplierService } from '../suppliers/supplier.service';
import { Supplier } from '../suppliers/supplier';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private productsUrl = 'api/products';
    private suppliersUrl = 'api/suppliers';

    products$ = this.http.get<Product[]>(this.productsUrl)
        .pipe(
            tap(data => console.log('Products: ', JSON.stringify(data))),
            catchError(this.handleError)
        );

    productsWithCategory$ = combineLatest([
        this.products$,
        this.productCategoryService.categories$
    ]).pipe(
        map(([products, categories]) =>
            products.map(product => ({
                ...product,
                price: product.price ? product.price * 1.5 : 0,
                originalPrice: product.price || 0,
                category: categories.find(c => product.categoryId === c.id)?.name,
                searchKey: [product.productName]
            }) as Product)
        ),
        shareReplay(1)
    );

    private selectedProductSubject = new BehaviorSubject<number>(1);
    selectedProductAction$ = this.selectedProductSubject.asObservable();
    selectedProductChanged(selectedProductId: number): void {
        this.selectedProductSubject.next(selectedProductId);
    }

    selectedProduct$ = combineLatest([
        this.productsWithCategory$,
        this.selectedProductAction$
    ]).pipe(
        map(([products, selectedProductId]) => products.find(product => product.id === selectedProductId)),
        tap(product => console.log('selectedProduct', product)),
        shareReplay(1)
    );

    // selectedProductSuppliers$ = combineLatest([
    //     this.selectedProduct$,
    //     this.supplierService.suppliers$
    // ]).pipe(
    //     map(([selectedProduct, suppliers]) => suppliers.filter(supplier => selectedProduct?.supplierIds?.includes(supplier.id)))
    // )

    private suppliersLoadingSubject = new Subject<boolean>();
    suppliersLoadingSubject$ = this.suppliersLoadingSubject.asObservable();
    selectedProductSuppliers$ = this.selectedProduct$
        .pipe(
            tap(_ => this.suppliersLoadingSubject.next(true)),
            filter(selectedProduct => Boolean(selectedProduct)),
            switchMap(selectedProduct => {
                if (selectedProduct?.supplierIds) {
                    return forkJoin(selectedProduct.supplierIds.map(
                        supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)))
                } else {
                    return of([]);
                }
            }),
            tap(suppliers => {
                console.log('product suppliers', JSON.stringify(suppliers));
                this.suppliersLoadingSubject.next(false);
            }),
        )

    private addProductSubject = new Subject<Product>();
    addProductAction$ = this.addProductSubject.asObservable();
    addNewProduct(newProduct?: Product): void {
        this.addProductSubject.next(newProduct || this.fakeProduct());
    }

    private deleteProductSubject = new Subject<number>();
    deleteProductAction$ = this.deleteProductSubject.asObservable();
    deleteProduct(productToDelete: number): void {
        this.deleteProductSubject.next(productToDelete);
    }

    private updateProductSubject = new Subject<Product>();
    updateProductAction$ = this.updateProductSubject.asObservable();
    editProduct(productToEdit: number): void {
        const updatedProduct = {
            ...this.fakeProduct(),
            id: productToEdit,
        } as Product;
        this.updateProductSubject.next(updatedProduct);
    }

    updatedProducts$ = merge(this.productsWithCategory$, this.addProductAction$, this.deleteProductAction$, this.updateProductAction$).pipe(
        scan((acc, value) => {
            if (value instanceof Array) {
                return [...acc, ...value]; // in case we need to combine arrays together
            } else if (typeof value === 'number') {
                //delete
                return acc.filter(product => product.id !== value);
            } else {
                // update
                const productIndex = acc.findIndex(product => product.id === value.id);
                if (productIndex > -1) {
                    acc.splice(productIndex, 1, value);
                    return acc;
                } else {
                    // add
                    return [...acc, value]
                }
            }
        }, [] as Product[]),
        shareReplay(1)
    );

    constructor(private http: HttpClient, private productCategoryService: ProductCategoryService, private supplierService: SupplierService) { }

    private fakeProduct(): Product {
        return {
            id: 42,
            productName: 'Another One',
            productCode: 'TBX-0042',
            description: 'Our new product',
            price: 8.9,
            categoryId: 3,
            category: 'Toolbox',
            quantityInStock: 30
        };
    }

    private handleError(err: HttpErrorResponse): Observable<never> {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        let errorMessage: string;
        if (err.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            errorMessage = `Backend returned code ${err.status}: ${err.message}`;
        }
        console.error(err);
        return throwError(() => errorMessage);
    }

}

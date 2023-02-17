import { ChangeDetectionStrategy, Component } from '@angular/core';

import { catchError, combineLatest, EMPTY, map } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';

  constructor(private productService: ProductService) {}

  // Alternative solution by combining product and selected product streams
  // products$ = combineLatest([
  //   this.productService.productsWithCategory$,
  //   this.productService.selectedProduct$
  // ]).pipe(
  //   map(([products, selectedProduct]) =>
  //     products.map(product => ({
  //       ...product,
  //       selected: product.id === selectedProduct?.id
  //     }))
  //   ),
  //   catchError(err => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );

  // Original solution
  products$ = this.productService.productsWithCategory$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  selectedProduct$ = this.productService.selectedProduct$;

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}

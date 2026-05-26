export class CartProduct {
  constructor(
    public productName: string,
    public quantity: number,
  ) {}
}

export class Cart {
  constructor(
    public username: string,
    public products: CartProduct[] = [],
  ) {}
}

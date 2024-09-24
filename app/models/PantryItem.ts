// models/User.ts
export interface IPantryItem {
    productId: string;
    quantity: string;
  }
  
  export class PantryItem implements IPantryItem {
    constructor(
      public productId: string,
      public quantity: string,
    ) {}
  }
  
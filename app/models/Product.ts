// models/User.ts
export interface IProduct{
    id:string;
    name: string;
    category: string;
    unit:string;
    img_url:string |null;
  }
  
  export class Product implements IProduct {
    constructor(
      public id:string,
      public name: string,
      public category: string,
      public unit:string,
      public img_url:string|null
    ) {}
  }
  
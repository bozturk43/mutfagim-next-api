// models/User.ts
export interface IProduct{
    id:string;
    name: string;
    category: string;
    unit:string;
  }
  
  export class Product implements IProduct {
    constructor(
      public id:string,
      public name: string,
      public category: string,
      public unit:string
    ) {}
  }
  
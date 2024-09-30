// models/User.ts
export interface IFoodCategory{
    id:string;
    name: string;
  }
  
  export class FoodCategory implements IFoodCategory {
    constructor(
      public id:string,
      public name: string,
    ) {}
  }
  
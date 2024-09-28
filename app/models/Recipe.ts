import { Product } from "./Product";

export interface IRecipe{
    id:string;
    name: string;
    description: string;
    ingredients:Ingredients[];
  }
  export interface IIngredients{
    con_id:string;
    productId: string;
    quantity: number;
  }
  
  export class Recipe implements IRecipe {
    constructor(
      public id:string,
      public name: string,
      public description: string,
      public ingredients:Ingredients[],
    ) {}
  }

  export class Ingredients implements IIngredients {
    constructor(
      public con_id:string,
      public productId: string,
      public quantity: number,
    ) {}
  }
  
  
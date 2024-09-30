import { Product } from "./Product";

export interface IRecipe{
    id:string;
    name: string;
    description: string;
    categoryId:string;
    img_url:string;
    ingredients:Ingredients[];
    missingIngredients?:Ingredients[];
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
      public categoryId:string,
      public img_url:string,
      public ingredients:Ingredients[],
      public missingIngredients?:Ingredients[]
    ) {}
  }

  export class Ingredients implements IIngredients {
    constructor(
      public con_id:string,
      public productId: string,
      public quantity: number,
    ) {}
  }
  
  
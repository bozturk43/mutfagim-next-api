// models/User.ts
export interface ILov{
    id:string;
    name: string;
  }
  
  export class Lov implements ILov {
    constructor(
      public id:string,
      public name: string,
    ) {}
  }
  
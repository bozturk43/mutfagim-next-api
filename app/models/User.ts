// models/User.ts
export interface IUser {
    id: string;
    name: string;
    age:number;
    email: string;
  }
  
  export class User implements IUser {
    constructor(
      public id: string,
      public name: string,
      public age:number,
      public email: string,
    ) {}
  
    // Metotlar ekleyebilirsin
    // getDisplayName(): string {
    //   return `${this.name} <${this.email}>`;
    // }
  }
  
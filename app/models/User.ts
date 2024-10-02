// models/User.ts
export interface IUser {
    id: string;
    name: string;
    img_url:string;
    age:number;
    email: string;
  }
  
  export class User implements IUser {
    constructor(
      public id: string,
      public name: string,
      public img_url:string,
      public age:number,
      public email: string,
    ) {}
  
    // Metotlar ekleyebilirsin
    // getDisplayName(): string {
    //   return `${this.name} <${this.email}>`;
    // }
  }
  
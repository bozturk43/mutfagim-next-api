// models/User.ts
export interface IConversationName {
    id: string;
    name: string;
  }
  
  export class ConversationName implements IConversationName {
    constructor(
      public id: string,
      public name: string,
    ) {}
  }
  
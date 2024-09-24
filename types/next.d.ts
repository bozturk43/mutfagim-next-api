import { NextRequest as OriginalNextRequest } from 'next/server';

interface UserPayload {
  id: string;
  name: string;
  age: number;
  email: string;
}

declare module 'next/server' {
  interface NextRequest extends OriginalNextRequest {
    user?: UserPayload;
  }
}
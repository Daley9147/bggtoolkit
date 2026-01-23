import { NextResponse } from 'next/server';

export async function GET() {
  // We don't support custom fields in the local CRM yet
  return NextResponse.json([]); 
}
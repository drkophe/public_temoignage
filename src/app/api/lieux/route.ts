// src/app/api/lieux/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const lieux = await prisma.lieu.findMany({
      orderBy: {
        nom: 'asc',
      },
    });
    
    return NextResponse.json(lieux);
  } catch (error) {
    console.error('Erreur lors de la récupération des lieux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des lieux' },
      { status: 500 }
    );
  }
}
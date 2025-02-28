// src/app/api/personnes/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const personnes = await prisma.personne.findMany({
      orderBy: {
        prenom: 'asc',
      },
    });
    
    return NextResponse.json(personnes);
  } catch (error) {
    console.error('Erreur lors de la récupération des personnes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des personnes' },
      { status: 500 }
    );
  }
}
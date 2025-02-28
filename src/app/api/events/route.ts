// src/app/api/events/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay, parseISO, addMinutes } from 'date-fns';

// Récupérer tous les événements pour une date et un lieu spécifiques
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const lieuId = searchParams.get('lieuId');

    if (!dateParam || !lieuId) {
      return NextResponse.json(
        { error: 'Date et ID du lieu requis' },
        { status: 400 }
      );
    }

    const date = parseISO(dateParam);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        lieuId: Number(lieuId),
      },
      include: {
        personnes: true,
        lieu: true,
      },
      orderBy: {
        heureDebut: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

// Créer un nouvel événement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, heureDebut, duree, personnesIds, lieuId } = body;

    if (!date || !heureDebut || !duree || !personnesIds || !lieuId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (personnesIds.length > 2) {
      return NextResponse.json(
        { error: 'Maximum 2 personnes par événement' },
        { status: 400 }
      );
    }

    const dateObj = parseISO(date);
    const heureDebutObj = parseISO(heureDebut);
    const heureFinObj = addMinutes(heureDebutObj, parseInt(duree));

    // Vérifier si l'heure est entre 6h et 20h
    const heureDebutHeure = heureDebutObj.getHours();
    const heureFinHeure = heureFinObj.getHours();
    const heureFinMinutes = heureFinObj.getMinutes();

    if (heureDebutHeure < 6 || (heureFinHeure > 20 || (heureFinHeure === 20 && heureFinMinutes > 0))) {
      return NextResponse.json(
        { error: 'Les événements doivent être entre 6h et 20h' },
        { status: 400 }
      );
    }

    // Vérifier si l'heure est disponible
    const conflictEvents = await prisma.event.findMany({
      where: {
        date: dateObj,
        lieuId: Number(lieuId),
        OR: [
          {
            // Événement qui commence pendant un autre événement
            heureDebut: {
              gte: heureDebutObj,
              lt: heureFinObj,
            },
          },
          {
            // Événement qui se termine pendant un autre événement
            heureFin: {
              gt: heureDebutObj,
              lte: heureFinObj,
            },
          },
          {
            // Événement qui englobe un autre événement
            AND: [
              {
                heureDebut: {
                  lte: heureDebutObj,
                },
              },
              {
                heureFin: {
                  gte: heureFinObj,
                },
              },
            ],
          },
        ],
      },
    });

    if (conflictEvents.length > 0) {
      return NextResponse.json(
        { error: 'Cet horaire est déjà réservé pour ce lieu' },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité des personnes
    const personnesConflict = await prisma.event.findMany({
      where: {
        date: dateObj,
        personnes: {
          some: {
            id: {
              in: personnesIds.map(Number),
            },
          },
        },
        OR: [
          {
            heureDebut: {
              gte: heureDebutObj,
              lt: heureFinObj,
            },
          },
          {
            heureFin: {
              gt: heureDebutObj,
              lte: heureFinObj,
            },
          },
          {
            AND: [
              {
                heureDebut: {
                  lte: heureDebutObj,
                },
              },
              {
                heureFin: {
                  gte: heureFinObj,
                },
              },
            ],
          },
        ],
      },
      include: {
        personnes: true,
      },
    });

    if (personnesConflict.length > 0) {
      const personnesOccupees = personnesConflict.flatMap(e => e.personnes).map(p => p.prenom);
      return NextResponse.json(
        { 
          error: `Les personnes suivantes sont déjà occupées à cet horaire: ${[...new Set(personnesOccupees)].join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Créer l'événement
    const newEvent = await prisma.event.create({
      data: {
        date: dateObj,
        heureDebut: heureDebutObj,
        heureFin: heureFinObj,
        lieu: {
          connect: {
            id: Number(lieuId),
          },
        },
        personnes: {
          connect: personnesIds.map(id => ({ id: Number(id) })),
        },
      },
      include: {
        personnes: true,
        lieu: true,
      },
    });

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
}
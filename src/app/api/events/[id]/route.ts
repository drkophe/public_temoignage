// src/app/api/events/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Définition explicite des paramètres
interface Params {
  id: string;
}

// Fonction pour extraire les paramètres dans l'URL
function extractId(req: NextRequest, params: Params): number {
  return Number(params.id);
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Params }
) {
  try {
    const id = extractId(request, params);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID d\'événement invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'événement' },
      { status: 500 }
    );
  }
}

// src/app/api/events/[id]/route.ts
// import { prisma } from '@/lib/prisma';
// import { NextResponse } from 'next/server';
// import { NextRequest } from 'next/server';

// export async function DELETE(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     const id = Number(context.params.id);

//     if (isNaN(id)) {
//       return NextResponse.json(
//         { error: 'ID d\'événement invalide' },
//         { status: 400 }
//       );
//     }

//     // Vérifier si l'événement existe
//     const event = await prisma.event.findUnique({
//       where: { id },
//     });

//     if (!event) {
//       return NextResponse.json(
//         { error: 'Événement non trouvé' },
//         { status: 404 }
//       );
//     }

//     // Supprimer l'événement
//     await prisma.event.delete({
//       where: { id },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Erreur lors de la suppression de l\'événement:', error);
//     return NextResponse.json(
//       { error: 'Erreur lors de la suppression de l\'événement' },
//       { status: 500 }
//     );
//   }
// }
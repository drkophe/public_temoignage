// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer les lieux
  const lieux = [
    { nom: 'Melun Gare' },
    { nom: 'Place St Jean' },
    { nom: 'Centre Ville' },
    { nom: 'Bibliothèque' },
    { nom: 'Salle de Réunion A' },
  ];

  for (const lieu of lieux) {
    await prisma.lieu.upsert({
      where: { nom: lieu.nom },
      update: {},
      create: lieu,
    });
  }

  // Créer les personnes
  const personnes = [
    { prenom: 'Sophie' },
    { prenom: 'Thomas' },
    { prenom: 'Julie' },
    { prenom: 'Nicolas' },
    { prenom: 'Marie' },
    { prenom: 'Pierre' },
    { prenom: 'Camille' },
    { prenom: 'Lucas' },
  ];

  for (const personne of personnes) {
    await prisma.personne.upsert({
      where: { prenom: personne.prenom },
      update: {},
      create: personne,
    });
  }

  console.log('Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
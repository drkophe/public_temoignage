-- CreateTable
CREATE TABLE "Lieu" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Lieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personne" (
    "id" SERIAL NOT NULL,
    "prenom" TEXT NOT NULL,

    CONSTRAINT "Personne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureDebut" TIMESTAMP(3) NOT NULL,
    "heureFin" TIMESTAMP(3) NOT NULL,
    "lieuId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PersonneEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PersonneEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lieu_nom_key" ON "Lieu"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Personne_prenom_key" ON "Personne"("prenom");

-- CreateIndex
CREATE UNIQUE INDEX "Event_date_heureDebut_lieuId_key" ON "Event"("date", "heureDebut", "lieuId");

-- CreateIndex
CREATE INDEX "_PersonneEvents_B_index" ON "_PersonneEvents"("B");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "Lieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonneEvents" ADD CONSTRAINT "_PersonneEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonneEvents" ADD CONSTRAINT "_PersonneEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "Personne"("id") ON DELETE CASCADE ON UPDATE CASCADE;

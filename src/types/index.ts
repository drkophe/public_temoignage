// src/types/index.ts
export type Lieu = {
    id: number;
    nom: string;
  };
  
  export type Personne = {
    id: number;
    prenom: string;
  };
  
  export type Event = {
    id: number;
    date: Date;
    heureDebut: Date;
    heureFin: Date;
    personnes: Personne[];
    lieu: Lieu;
    lieuId: number;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type EventFormData = {
    date: string;
    heureDebut: string;
    duree: "30" | "60" | "120";
    personnesIds: number[];
    lieuId: number;
  };
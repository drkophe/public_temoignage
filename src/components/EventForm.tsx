// src/components/EventForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Lieu, Personne, EventFormData } from '@/types';
import { format, getDay, parseISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

interface EventFormProps {
  date: string;
  lieuId: number;
  onEventAdded: () => void;
}

export default function EventForm({ date, lieuId, onEventAdded }: EventFormProps) {
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // const localDateString = "2025-03-11T09:00:00"; // Heure exprimée en "Europe/Paris" par exemple
  const utcDate = fromZonedTime(new Date(`${date}T09:00`), 'Europe/Romania');
  console.log(utcDate.toISOString()); // Affiche l'heure UTC correspondante
  const initialHeureDebut = utcDate.toISOString();

  // Formulaire
  const [formData, setFormData] = useState<EventFormData>({
    date: date,
    heureDebut: initialHeureDebut,
    duree: '60',
    personnesIds: [],
    lieuId: lieuId,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les lieux
        const lieuxResponse = await fetch('/api/lieux');
        if (!lieuxResponse.ok) throw new Error('Erreur lors du chargement des lieux');
        const lieuxData = await lieuxResponse.json();
        setLieux(lieuxData);
        
        // Récupérer les personnes
        const personnesResponse = await fetch('/api/personnes');
        if (!personnesResponse.ok) throw new Error('Erreur lors du chargement des personnes');
        const personnesData = await personnesResponse.json();
        setPersonnes(personnesData);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Mettre à jour le formulaire quand la date ou le lieu change
    setFormData(prev => ({
      ...prev,
      date,
      lieuId,
    }));
  }, [date, lieuId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Réinitialiser les personnes sélectionnées quand le lieu change
    setFormData(prev => ({
      ...prev,
      personnesIds: [], // On vide la sélection
    }));
  }, [lieuId]); // Déclenchement dès que `lieuId` change
  

  const handlePersonneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
    setFormData(prev => ({
      ...prev,
      personnesIds: selectedOptions.slice(0, lieuId === 5 ? 4 : 2),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'événement');
      }

      // Réinitialiser le formulaire
      setFormData(prev => ({
        ...prev,
        // heureDebut: `${date}T09:00`,
        heureDebut: fromZonedTime(new Date(`${date}T09:00`), 'Europe/Romania').toISOString(),
        // heureDebut: formatInTimeZone(new Date(`${date}T09:00`), 'Europe/Paris', "yyyy-MM-dd'T'HH:mmxxx"),
        duree: '60',
        personnesIds: [],
      }));

      setSuccess('Événement créé avec succès !');
      onEventAdded(); // Notifier le parent
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: unknown) {
      console.error('Erreur:', error);


      // Vérifier si l'erreur est une instance de Error
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erreur lors de la création de l\'événement');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Chargement...</div>;
  }

  

  // Générer les options d'heures (de 6h à 20h, par tranches de 30 min)
  const heureOptions = [];
  for (let hour = 6; hour <= 19; hour++) {
    heureOptions.push(`${date}T${hour.toString().padStart(2, '0')}:00`);
    heureOptions.push(`${date}T${hour.toString().padStart(2, '0')}:30`);
  }
  heureOptions.push(`${date}T20:00`); // Ajouter 20h00


  // Montaigu
  const marcheMontaiguId = 5;
  const isReservationDisabled = lieuId === marcheMontaiguId && getDay(parseISO(date)) !== 4;

  

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Réserver un créneau</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lieu" className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <select
              id="lieu"
              name="lieuId"
              value={formData.lieuId}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6182B9] focus:border-[#6182B9]"
              required
            >
              {lieux.map((lieu) => (
                <option key={lieu.id} value={lieu.id}>
                  {lieu.nom}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="heureDebut" className="block text-sm font-medium text-gray-700 mb-1">
              Heure de début
            </label>
            <select
              id="heureDebut"
              name="heureDebut"
              value={formData.heureDebut}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6182B9] focus:border-[#6182B9]"
              required
            >
              {heureOptions.map((heure) => (
                <option key={heure} value={heure}>
                  {format(new Date(heure), 'HH:mm')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="duree" className="block text-sm font-medium text-gray-700 mb-1">
              Durée
            </label>
            <select
              id="duree"
              name="duree"
              value={formData.duree}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6182B9] focus:border-[#6182B9]"
              required
            >
              <option value="30">30 minutes</option>
              <option value="60">1 heure</option>
              <option value="120">2 heures</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="personnes" className="block text-sm font-medium text-gray-700 mb-1">
              {formData.lieuId === 5 ? 'Personnes (max 4)' : 'Personnes (max 2)'}
            </label>
            <select
              id="personnes"
              name="personnes"
              multiple
              // la valeur doit être réinitialiser chaque fois que le formulaire change de lieu
              value={formData.personnesIds.map(String)}
              onChange={handlePersonneChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6182B9] focus:border-[#6182B9]"
              size={4}
              required
            >
              {personnes.map((personne) => (
                <option key={personne.id} value={personne.id}>
                  {personne.prenom}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {formData.personnesIds.length === 0 ? 
                'Aucune personne sélectionnée' 
                : 
                formData.lieuId === 5 ? 
                  `Sélectionné: ${formData.personnesIds.length}/4` 
                  : 
                  `Sélectionné: ${formData.personnesIds.length}/2`
              }
            </p>
          </div>
        </div>
        
        <div className="mt-6">
        <button
          type="submit"
          disabled={submitting || isReservationDisabled}
          className="w-full bg-[#4A6DA7] text-white py-2 px-4 rounded-md shadow-sm 
                    hover:bg-[#395480] focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-[#6182B9] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Réservation en cours...' : 'Réserver le créneau'}
        </button>

        </div>
      </form>
    </div>
  );
}
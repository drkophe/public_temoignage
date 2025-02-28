// src/components/DateLieuSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Lieu } from '@/types';
import { addDays, format, subDays, isThursday} from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateLieuSelectorProps {
  onSelect: (date: string, lieuId: number) => void;
}

export default function DateLieuSelector({ onSelect }: DateLieuSelectorProps) {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [selectedLieuId, setSelectedLieuId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function fetchLieux() {
      try {
        const response = await fetch('/api/lieux');
        if (!response.ok) throw new Error('Erreur lors du chargement des lieux');
        const data = await response.json();
        
        // Trier les lieux par ID
        const triParId = [...data].sort((a, b) => a.id - b.id);
        
        setLieux(triParId);
  
        setSelectedLieuId((currentLieuId) =>
          currentLieuId !== null ? currentLieuId : triParId[0]?.id
        );
  
        if (!selectedLieuId && triParId.length > 0) {
          onSelect(date, triParId[0].id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setLoading(false);
      }
    }
  
    fetchLieux();
  }, [date, onSelect, selectedLieuId]);

  const handlePreviousDay = () => {
    const newDate = format(subDays(new Date(date), 1), 'yyyy-MM-dd');
    setDate(newDate);
    if (selectedLieuId) {
      onSelect(newDate, selectedLieuId);
    }
  };

  const handleNextDay = () => {
    const newDate = format(addDays(new Date(date), 1), 'yyyy-MM-dd');
    setDate(newDate);
    if (selectedLieuId) {
      onSelect(newDate, selectedLieuId);
    }
  };


  // const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   let newDate = e.target.value;
  
  //   // Vérifie si le lieu sélectionné est "Marché Montaigu"
  //   const isMarcheMontaigu = lieux.find((lieu) => lieu.id === selectedLieuId)?.nom === "Marché Montaigu";
  
  //   // Si le lieu est "Marché Montaigu", forcer la date à être un jeudi
  //   if (isMarcheMontaigu && !isThursday(new Date(newDate))) {
  //     newDate = format(nextThursday(new Date(newDate)), 'yyyy-MM-dd');
  //   }
  
  //   setDate(newDate);
  //   if (selectedLieuId) {
  //     onSelect(newDate, selectedLieuId);
  //   }
  // };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (selectedLieuId) {
      onSelect(newDate, selectedLieuId);
    }
  };

  const handleLieuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lieuId = Number(e.target.value);
    setSelectedLieuId(lieuId);
    onSelect(date, lieuId);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Chargement...</div>;
  }

  const formattedDate = format(new Date(date), 'eeee dd MMMM yyyy', { locale: fr });

  // Montaigu
  const isMarcheMontaigu = lieux.find((lieu) => lieu.id === selectedLieuId)?.nom === "Marché Montaigu";
  const isDateValid = isMarcheMontaigu ? isThursday(new Date(date)) : true;


  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow">
      <div className="w-full md:w-1/2">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={handleDateChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <div className='flex items-center justify-between space-x-2 w-72 my-2'>
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-gray-100 rounded"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <p className="mt-1 text-sm text-gray-500 capitalize">{formattedDate}</p>
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>

          </button>
        </div>
        
      </div>
      
      <div className="w-full md:w-1/2">
        <label htmlFor="lieu" className="block text-sm font-medium text-gray-700 mb-1">
          Lieu
        </label>
        <select
          id="lieu"
          name="lieu"
          value={selectedLieuId || ''}
          onChange={handleLieuChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {lieux.map((lieu) => (
            <option key={lieu.id} value={lieu.id}>
              {lieu.nom}
            </option>
          ))}
        </select>

        {isMarcheMontaigu && !isDateValid && (
          <p className="text-red-500 text-sm mt-2">
            🚫 Réservation indisponible pour le Marché Montaigu.  
            Vous pouvez réserver uniquement les <strong>jeudis</strong>.
          </p>
        )}

      </div>

    </div>
  );
}
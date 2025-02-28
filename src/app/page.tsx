// src/app/page.tsx
'use client';

import { useState } from 'react';
import DateLieuSelector from '@/components/DateLieuSelector';
import DailyCalendar from '@/components/DailyCalendar';
import EventForm from '@/components/EventForm';

export default function Home() {
  const [date, setDate] = useState<string>('');
  const [lieuId, setLieuId] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleDateLieuSelect = (selectedDate: string, selectedLieuId: number) => {
    setDate(selectedDate);
    setLieuId(selectedLieuId);
  };

  const handleEventChange = () => {
    // Forcer le rechargement du calendrier en modifiant la clé
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Assemblée de Melun</h1>
      
      <DateLieuSelector onSelect={handleDateLieuSelect} />
      
      {date && lieuId ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Planning journalier</h2>
            {/* <p>{format(new Date(date), 'eeee dd MMMM yyyy', { locale: fr })}</p> */}
            <DailyCalendar
              key={`calendar-${refreshKey}`}
              date={date}
              lieuId={lieuId}
              onEventDeleted={handleEventChange}
            />
          </div>
          
          <EventForm 
            date={date}
            lieuId={lieuId}
            onEventAdded={handleEventChange}
          />
        </>
      ) : (
        <div className="bg-yellow-100 p-4 rounded-lg">
          Veuillez sélectionner une date et un lieu pour afficher le planning.
        </div>
      )}
    </div>
  );
}
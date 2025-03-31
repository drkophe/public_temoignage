'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { differenceInMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface DailyCalendarProps {
  date: string;
  lieuId: number;
  onEventDeleted: () => void;
}

export default function DailyCalendar({ date, lieuId, onEventDeleted }: DailyCalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Heures de 6h à 20h
  const hours = Array.from({ length: 15 }, (_, i) => i + 6);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/events?date=${date}&lieuId=${lieuId}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des événements');
        }
        
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement des événements');
        setLoading(false);
      }
    }

    if (date && lieuId) {
      fetchEvents();
    }
  }, [date, lieuId]);

  useEffect(() => {
    console.log("Données reçues pour events:", events);
  }, [events]);
  

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'événement');
      }

      // Supprimer l'événement de l'état local
      setEvents(events.filter(event => event.id !== eventId));
      onEventDeleted(); // Notifier le parent
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de l\'événement');
    }
  };

  // Fonction pour calculer la position et la hauteur de l'événement
  const getEventStyle = (event: Event) => {
    const startHour = new Date(event.heureDebut).getHours();
    const startMinutes = new Date(event.heureDebut).getMinutes();
    const duration = differenceInMinutes(new Date(event.heureFin), new Date(event.heureDebut));
    
    // Calculer la position top (1 heure = 60px, 1 minute = 1px)
    const topPosition = (startHour - 6) * 60 + startMinutes;
    
    // Calculer la hauteur (1 minute = 1px)
    const height = duration;
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`,
    };
  };

  if (loading) {
    return <div className="flex justify-center p-4">Chargement...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
  }
  



  return (
    <div className="bg-white rounded-lg shadow overflow-hidden relative">
      {/* Lignes horizontales pour cacher la première et la dernière heure */}
      <div className='bg-white w-full h-2 absolute top-0 z-10'></div>
      <div className='bg-white w-full h-2 absolute bottom-0 z-10'></div>
      

      <div className="relative" style={{ height: '840px' }}> {/* 14 heures * 60px */}
        {/* Lignes des heures */}
        {hours.map(hour => (
          <div 
            key={hour} 
            className="absolute w-full border-t border-gray-200 flex"
            style={{ top: `${(hour - 6) * 60}px` }}
          >
            <div className="w-16 pr-2 text-right text-sm text-gray-500 -mt-3 bg-white/80">
              {hour}:00
            </div>
            <div className="flex-1"></div>
          </div>
        ))}
        
        {/* Événements */}
        {events.map(event => (
          <div
            key={event.id}
            className="absolute left-16 right-4 bg-[#E4ECF5] border-l-4 border-[#799FCC] rounded p-2 shadow-sm overflow-hidden z-20"
            style={getEventStyle(event)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className='flex items-center space-x-2'>
                  <p className="text-[8px] font-semibold text-[#799FCC]">
                    {formatInTimeZone(new Date(event.heureDebut), 'Europe/Paris', 'HH:mm')} - 
                    {formatInTimeZone(new Date(event.heureFin), 'Europe/Paris', 'HH:mm')}
                  </p>
                  <p className="text-[8px] text-gray-500">{event.lieu.nom}</p>
                </div>
                <p className="text-sm text-gray-800" style={event.personnes.length > 2 ? { fontSize: '10px' } : {}}>
                  {event.personnes.map(p => p.prenom).join(', ')}
                </p>
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
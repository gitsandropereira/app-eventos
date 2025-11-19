
import React, { useState } from 'react';
import type { Event } from '../types';

interface AgendaProps {
    events: Event[];
    onEventClick: (event: Event) => void;
}

const Agenda: React.FC<AgendaProps> = ({ events, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const eventsByDate: { [key: string]: Event[] } = events.reduce((acc, event) => {
        const dateKey = event.date.toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as { [key: string]: Event[] });

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const typeColors = {
      'DJ': 'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-500/80 dark:border-purple-400 dark:text-white hover:bg-purple-200 dark:hover:bg-purple-600',
      'Fotografia': 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-500/80 dark:border-blue-400 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-600',
      'Decoração': 'bg-pink-100 border-pink-200 text-pink-800 dark:bg-pink-500/80 dark:border-pink-400 dark:text-white hover:bg-pink-200 dark:hover:bg-pink-600',
      'Outros': 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Agenda Inteligente</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex-1 flex flex-col border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">&lt;</button>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
                    {days.map((d, i) => {
                        const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                        const isToday = d.toDateString() === new Date().toDateString();
                        const dailyEvents = eventsByDate[d.toDateString()] || [];
                        return (
                            <div key={i} className={`min-h-[80px] p-1 border rounded-md flex flex-col transition-colors ${isCurrentMonth ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-900/50 border-transparent text-gray-300 dark:text-gray-700'}`}>
                                <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs mb-1 ${isToday ? 'bg-indigo-600 text-white font-bold' : ''} ${isCurrentMonth && !isToday ? 'text-gray-700 dark:text-gray-300' : ''}`}>
                                    {d.getDate()}
                                </span>
                                <div className="space-y-1 overflow-y-auto flex-1 no-scrollbar">
                                {dailyEvents.map(e => (
                                    <div 
                                        key={e.id} 
                                        onClick={() => onEventClick(e)}
                                        className={`text-[10px] p-1 rounded-md border-l-2 truncate cursor-pointer transition-colors shadow-sm ${typeColors[e.type as keyof typeof typeColors] || typeColors['Outros']}`}
                                    >
                                        {e.title}
                                    </div>
                                ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Agenda;

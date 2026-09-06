import React from 'react';
import { X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { DaySchedule } from '../types';

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: DaySchedule[];
  isOpenNow: boolean;
  statusMessage: string;
}

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({
  isOpen,
  onClose,
  schedule,
  isOpenNow,
  statusMessage,
}) => {
  if (!isOpen) return null;

  const dayKeys: Array<DaySchedule['dayKey']> = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brDate = new Date(utc + 3600000 * -3);
  const currentDayKey = dayKeys[brDate.getDay()];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-stone-950 text-white border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800/50">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-['Playfair_Display']">Horário de Atendimento</h3>
              <p className="text-xs text-stone-400">Consultoria Boutique & Envios</p>
            </div>
          </div>
          <button
            id="close-hours-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current status pill */}
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <div className={`p-3 rounded-2xl flex items-center gap-3 ${
            isOpenNow ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}>
            {isOpenNow ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isOpenNow ? 'ATENDIMENTO ABERTO AGORA' : 'ATENDIMENTO OFFLINE NO MOMENTO'}
              </div>
              <div className="text-xs opacity-90">{statusMessage}</div>
            </div>
          </div>
        </div>

        {/* Week list */}
        <div className="p-4 divide-y divide-stone-100 max-h-[60vh] overflow-y-auto">
          {schedule.map((item) => {
            const isToday = item.dayKey === currentDayKey;
            return (
              <div
                key={item.dayKey}
                className={`py-2.5 px-3 flex items-center justify-between text-sm rounded-xl transition-colors ${
                  isToday ? 'bg-rose-50/80 font-semibold border border-rose-200' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-stone-800">{item.label}</span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-rose-900 text-white">
                      Hoje
                    </span>
                  )}
                </div>

                <div>
                  {item.isOpen ? (
                    <span className="text-stone-700 font-medium">
                      {item.openTime} às {item.closeTime}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold text-xs px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
                      Fechado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-950 text-white text-sm font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

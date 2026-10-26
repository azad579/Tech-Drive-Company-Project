import React from 'react';
import { useApp } from '../context/AppContext';

export const HistoryWidget: React.FC = () => {
  const { historyLogs, isHistoryOpen, setIsHistoryOpen } = useApp();

  // Group logs by date
  const groupedLogs: Record<string, typeof historyLogs> = {};
  historyLogs.forEach(log => {
    if (!groupedLogs[log.date]) {
      groupedLogs[log.date] = [];
    }
    groupedLogs[log.date].push(log);
  });

  if (!isHistoryOpen) {
    return (
      <div className="w-10 flex flex-col items-center pt-2">
        <button
          onClick={() => setIsHistoryOpen(true)}
          title="Expand History"
          className="w-8 h-8 rounded bg-[#0084bf] text-white hover:bg-[#0073a8] flex items-center justify-center shadow transition"
        >
          <i className="fa fa-bars text-sm"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 lg:w-88 flex-shrink-0 bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col self-start">
      {/* Header matching screenshot */}
      <div className="bg-[#0084bf] text-white px-4 py-2.5 flex items-center justify-between shadow-sm select-none">
        <h3 className="font-bold text-sm tracking-wider uppercase">HISTORY</h3>
        <button
          onClick={() => setIsHistoryOpen(prev => !prev)}
          title="Toggle History panel"
          className="text-white hover:text-sky-200 p-1 transition"
        >
          <i className="fa fa-bars text-sm"></i>
        </button>
      </div>

      {/* Body with timeline */}
      <div className="p-4 max-h-[calc(100vh-210px)] overflow-y-auto space-y-5 text-xs">
        {Object.keys(groupedLogs).length === 0 && (
          <div className="text-gray-400 text-center py-6">No history records yet</div>
        )}

        {Object.entries(groupedLogs).map(([date, logs]) => (
          <div key={date} className="relative">
            {/* Green Date Badge */}
            <div className="mb-3">
              <span className="inline-block bg-[#5cb85c] text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm shadow-xs">
                {date}
              </span>
            </div>

            {/* Timeline Items */}
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
              {logs.map(log => (
                <div key={log.id} className="relative group">
                  {/* Circle arrow node */}
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-gray-200 text-gray-500 group-hover:bg-[#0084bf] group-hover:text-white flex items-center justify-center text-[10px] shadow-xs transition-colors">
                    <i className="fa fa-chevron-right text-[8px]"></i>
                  </div>

                  {/* Log Content Card */}
                  <div className="bg-white border border-gray-100 rounded p-2 hover:border-sky-200 transition-colors shadow-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-gray-800 underline hover:text-[#0084bf] cursor-pointer">
                        {log.actor}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center space-x-1">
                        <i className="fa fa-clock-o text-[9px]"></i>
                        <span>{log.time}</span>
                      </span>
                    </div>

                    <div className="text-[#0084bf] font-medium text-[11px]">
                      {log.action}
                    </div>

                    {log.details && (
                      <div className="text-gray-600 text-[10px] mt-0.5">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

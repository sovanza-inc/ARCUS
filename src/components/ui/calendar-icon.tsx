interface CalendarIconProps {
  month: string;
  date: number;
  className?: string;
}

export function CalendarIcon({ month, date, className = "" }: CalendarIconProps) {
  return (
    <div className={`flex flex-col items-center w-16 h-20 bg-white rounded-lg border p-2 ${className}`}>
      <div className="text-sm font-medium text-orange-500 uppercase">{month}</div>
      <div className="text-3xl font-bold leading-none mt-1">{date}</div>
    </div>
  );
}

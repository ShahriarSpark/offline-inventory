import React, { useState } from 'react';
import { Calendar, Filter as FilterIcon, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export interface DateFilter {
  startDate: string;
  endDate: string;
  selectedMonth: string;
  selectedYear: string;
}

export type FilterType = 'all' | 'month' | 'custom';

interface FilterProps {
  title?: string;
  filterType: FilterType;
  dateFilter: DateFilter;
  displayItemsLength: number;
  onFilterTypeChange: (type: FilterType) => void;
  onDateFilterChange: (filter: DateFilter) => void;
  onResetFilters: () => void;
}

const Filter: React.FC<FilterProps> = ({
  title = "Filter",
  filterType,
  dateFilter,
  displayItemsLength,
  onFilterTypeChange,
  onDateFilterChange,
  onResetFilters
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getMonthOptions = () => {
    return [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const handleDateFilterUpdate = (updates: Partial<DateFilter>) => {
    onDateFilterChange({ ...dateFilter, ...updates });
  };

  return (
    <div>
      {/* Filter Header - Mobile Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-white">{title}</h2>
        <div className="flex items-center space-x-2">
          {/* Reset Button */}
          {filterType !== 'all' && (
            <button
              onClick={onResetFilters}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reset Filters</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}
          
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="sm:hidden flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/30 transition-all duration-300"
          >
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm">Filter</span>
            {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Controls - Hidden on mobile by default, always visible on desktop */}
      <div className={`${isFilterOpen ? 'block' : 'hidden'} sm:block transition-all duration-300`}>
        <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700/30">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
            <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <h3 className="text-base sm:text-lg font-semibold text-white">Filter Options</h3>
          </div>

          {/* Filter Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={() => onFilterTypeChange('all')}
              className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                filterType === 'all'
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <div className="text-center">
                <p className="font-medium text-sm sm:text-base">All Time</p>
                <p className="text-xs opacity-80">View all records</p>
              </div>
            </button>

            <button
              onClick={() => onFilterTypeChange('month')}
              className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                filterType === 'month'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <div className="text-center">
                <p className="font-medium text-sm sm:text-base">Monthly</p>
                <p className="text-xs opacity-80">Filter by month</p>
              </div>
            </button>

            <button
              onClick={() => onFilterTypeChange('custom')}
              className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                filterType === 'custom'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                  : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <div className="text-center">
                <p className="font-medium text-sm sm:text-base">Custom Range</p>
                <p className="text-xs opacity-80">Select date range</p>
              </div>
            </button>
          </div>

          {/* Month Filter Controls */}
          {filterType === 'month' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-slate-400 text-xs sm:text-sm mb-2">Select Month</label>
                <select
                  value={dateFilter.selectedMonth}
                  onChange={(e) => handleDateFilterUpdate({ selectedMonth: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 text-sm sm:text-base"
                >
                  <option value="">Select Month</option>
                  {getMonthOptions().map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs sm:text-sm mb-2">Select Year</label>
                <select
                  value={dateFilter.selectedYear}
                  onChange={(e) => handleDateFilterUpdate({ selectedYear: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 text-sm sm:text-base"
                >
                  {getYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Custom Date Range Controls */}
          {filterType === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-slate-400 text-xs sm:text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => handleDateFilterUpdate({ startDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs sm:text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => handleDateFilterUpdate({ endDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          {/* Filter Summary */}
          {filterType !== 'all' && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-900/30 rounded-lg border border-slate-600/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-slate-300 text-xs sm:text-sm">
                    {filterType === 'month' && dateFilter.selectedMonth && dateFilter.selectedYear
                      ? `${getMonthOptions().find(m => m.value === dateFilter.selectedMonth)?.label} ${dateFilter.selectedYear}`
                      : filterType === 'custom' && dateFilter.startDate && dateFilter.endDate
                      ? `${dateFilter.startDate} to ${dateFilter.endDate}`
                      : 'Select filter criteria'
                    }
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-slate-400 text-xs">Filtered Results</p>
                  <p className="text-white font-medium text-sm sm:text-base">{displayItemsLength} records</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Trash2, Settings, Layout, Plus, X, Edit2 } from 'lucide-react';

const TeacherPlanner = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [mode, setMode] = useState('setup');
  const [semesterStart, setSemesterStart] = useState(null);
  const [semesterEnd, setSemesterEnd] = useState(null);
  const [breakDays, setBreakDays] = useState({});
  const [daySchedule, setDaySchedule] = useState({});
  const [units, setUnits] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDayTypesModal, setShowDayTypesModal] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [unitColor, setUnitColor] = useState('#3b82f6');
  const [editingUnit, setEditingUnit] = useState(null);
  const [classes, setClasses] = useState(['Algebra', 'Geometry']);
  const [selectedClass, setSelectedClass] = useState('');
  const [visibleClasses, setVisibleClasses] = useState(new Set(['Algebra', 'Geometry']));
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [unitsCollapsed, setUnitsCollapsed] = useState(false);
  
  const [instructionalDays, setInstructionalDays] = useState([
    { id: 'red', label: 'Red Day', color: '#fca5a5', textColor: '#991b1b' },
    { id: 'black', label: 'Black Day', color: '#1f2937', textColor: '#ffffff' }
  ]);
  
  const [nonInstructionalDays, setNonInstructionalDays] = useState([
    { id: 'holiday', label: 'Holiday', color: '#fef3c7', textColor: '#92400e' },
    { id: 'teacher-day', label: 'Teacher Day', color: '#ddd6fe', textColor: '#5b21b6' },
    { id: 'finals', label: 'Finals', color: '#fed7aa', textColor: '#9a3412' }
  ]);

  const unitColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  const colorOptions = ['#fca5a5', '#fdba74', '#fcd34d', '#bef264', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4', '#fda4af', '#991b1b', '#9a3412', '#92400e', '#365314', '#065f46', '#164e63', '#1e3a8a', '#5b21b6', '#831843', '#881337', '#1f2937', '#374151', '#6b7280', '#d1d5db', '#f3f4f6'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const getAllWeekdaysBetween = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      if (isWeekday(current)) {
        dates.push(formatDate(current.getFullYear(), current.getMonth(), current.getDate()));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const recalculateSchedule = (start, end, breaks) => {
    if (!start || !end) return {};
    const allWeekdays = getAllWeekdaysBetween(start, end);
    const schedule = {};
    let dayIndex = 0;
    allWeekdays.forEach(dateStr => {
      if (breaks[dateStr]) {
        schedule[dateStr] = breaks[dateStr];
      } else {
        const currentDayType = instructionalDays[dayIndex % instructionalDays.length];
        schedule[dateStr] = currentDayType.id;
        dayIndex++;
      }
    });
    return schedule;
  };

  const handleSetupClick = (year, month, day) => {
    const clickedDate = new Date(year, month, day);
    const dateStr = formatDate(year, month, day);
    if (!isWeekday(clickedDate)) return;
    if (!semesterStart) {
      setSemesterStart(clickedDate);
      return;
    }
    if (!semesterEnd) {
      if (clickedDate < semesterStart) {
        setSemesterEnd(semesterStart);
        setSemesterStart(clickedDate);
      } else {
        setSemesterEnd(clickedDate);
      }
      return;
    }
    const newBreaks = { ...breakDays };
    const currentBreakType = newBreaks[dateStr];
    if (!currentBreakType) {
      newBreaks[dateStr] = nonInstructionalDays[0].id;
    } else {
      const currentIndex = nonInstructionalDays.findIndex(d => d.id === currentBreakType);
      if (currentIndex < nonInstructionalDays.length - 1) {
        newBreaks[dateStr] = nonInstructionalDays[currentIndex + 1].id;
      } else {
        delete newBreaks[dateStr];
      }
    }
    setBreakDays(newBreaks);
  };

  useEffect(() => {
    if (semesterStart && semesterEnd) {
      const newSchedule = recalculateSchedule(semesterStart, semesterEnd, breakDays);
      setDaySchedule(newSchedule);
    }
  }, [semesterStart, semesterEnd, breakDays, instructionalDays]);

  const resetSetup = () => {
    setSemesterStart(null);
    setSemesterEnd(null);
    setBreakDays({});
    setDaySchedule({});
  };

  const addInstructionalDay = () => {
    setInstructionalDays([...instructionalDays, { id: `day-${Date.now()}`, label: 'New Day', color: '#93c5fd', textColor: '#1e3a8a' }]);
  };

  const addNonInstructionalDay = () => {
    setNonInstructionalDays([...nonInstructionalDays, { id: `break-${Date.now()}`, label: 'New Break Type', color: '#fef3c7', textColor: '#92400e' }]);
  };

  const updateDayType = (type, id, updates) => {
    if (type === 'instructional') {
      setInstructionalDays(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    } else {
      setNonInstructionalDays(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    }
  };

  const removeDayType = (type, id) => {
    if (type === 'instructional') {
      if (instructionalDays.length <= 1) return;
      setInstructionalDays(prev => prev.filter(d => d.id !== id));
    } else {
      setNonInstructionalDays(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleUnitDragStart = (year, month, day) => {
    if (new Date(year, month, day).getDay() % 6 === 0) return;
    setIsDragging(true);
    setDragStart({ year, month, day });
    setDragEnd({ year, month, day });
  };

  const handleUnitDragEnter = (year, month, day) => {
    if (isDragging && new Date(year, month, day).getDay() % 6 !== 0) {
      setDragEnd({ year, month, day });
    }
  };

  const handleUnitDragEnd = () => {
    if (isDragging && dragStart && dragEnd) {
      setShowUnitModal(true);
    }
  };

  const getDatesBetween = (start, end) => {
    const dates = [];
    const startDate = new Date(start.year, start.month, start.day);
    const endDate = new Date(end.year, end.month, end.day);
    const current = new Date(Math.min(startDate, endDate));
    const last = new Date(Math.max(startDate, endDate));
    while (current <= last) {
      if (isWeekday(current)) {
        dates.push(formatDate(current.getFullYear(), current.getMonth(), current.getDate()));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const saveUnit = () => {
    if (!unitName.trim()) return;
    const dates = getDatesBetween(dragStart, dragEnd);
    if (editingUnit) {
      setUnits(prev => prev.map(u => u.id === editingUnit.id ? { ...u, name: unitName, color: unitColor, dates, class: selectedClass } : u));
      setEditingUnit(null);
    } else {
      setUnits(prev => [...prev, { id: Date.now(), name: unitName, color: unitColor, dates, class: selectedClass }]);
    }
    setUnitName('');
    setUnitColor(unitColors[0]);
    setSelectedClass('');
    setShowUnitModal(false);
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const editUnit = (unit) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setUnitColor(unit.color);
    setSelectedClass(unit.class || '');
    if (unit.dates.length > 0) {
      const firstDate = parseDate(unit.dates[0]);
      const lastDate = parseDate(unit.dates[unit.dates.length - 1]);
      setDragStart({ year: firstDate.getFullYear(), month: firstDate.getMonth(), day: firstDate.getDate() });
      setDragEnd({ year: lastDate.getFullYear(), month: lastDate.getMonth(), day: lastDate.getDate() });
    }
    setShowUnitModal(true);
    setMode('units');
  };

  const cancelUnit = () => {
    setShowUnitModal(false);
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setUnitName('');
    setSelectedClass('');
    setEditingUnit(null);
  };

  const deleteUnit = (unitId) => setUnits(prev => prev.filter(u => u.id !== unitId));

  const isInDragSelection = (year, month, day) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    return getDatesBetween(dragStart, dragEnd).includes(formatDate(year, month, day));
  };

  const getUnitForDate = (year, month, day) => {
    const dateStr = formatDate(year, month, day);
    return units.find(unit => unit.dates.includes(dateStr) && (!unit.class || visibleClasses.has(unit.class)));
  };

  const changeMonth = (delta) => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay(), year, month };
  };

  const exportSchedule = () => {
    const data = { version: '1.0', semesterStart: semesterStart?.toISOString(), semesterEnd: semesterEnd?.toISOString(), instructionalDays, nonInstructionalDays, breakDays, units, classes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teacher-schedule.json';
    a.click();
  };

  const importSchedule = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.semesterStart) setSemesterStart(new Date(data.semesterStart));
        if (data.semesterEnd) setSemesterEnd(new Date(data.semesterEnd));
        if (data.instructionalDays) setInstructionalDays(data.instructionalDays);
        if (data.nonInstructionalDays) setNonInstructionalDays(data.nonInstructionalDays);
        if (data.breakDays) setBreakDays(data.breakDays);
        if (data.units) setUnits(data.units);
        if (data.classes) {
          setClasses(data.classes);
          setVisibleClasses(new Set(data.classes));
        }
        alert('Schedule imported successfully!');
      } catch (error) {
        alert('Error importing schedule. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getDayTypeStyle = (dayTypeId) => {
    const allTypes = [...instructionalDays, ...nonInstructionalDays];
    const dayType = allTypes.find(d => d.id === dayTypeId);
    if (!dayType) return { backgroundColor: '#ffffff', color: '#000000', border: '2px solid #d1d5db' };
    return { backgroundColor: dayType.color, color: dayType.textColor, border: `2px solid ${dayType.textColor}` };
  };

  const toggleClassVisibility = (className) => {
    const newVisible = new Set(visibleClasses);
    if (newVisible.has(className)) {
      newVisible.delete(className);
    } else {
      newVisible.add(className);
    }
    setVisibleClasses(newVisible);
  };

  const addClass = () => {
    if (newClassName.trim() && !classes.includes(newClassName.trim())) {
      const updatedClasses = [...classes, newClassName.trim()];
      setClasses(updatedClasses);
      setVisibleClasses(new Set([...visibleClasses, newClassName.trim()]));
      setNewClassName('');
      setShowClassModal(false);
    }
  };

  const removeClass = (className) => {
    setClasses(prev => prev.filter(c => c !== className));
    const newVisible = new Set(visibleClasses);
    newVisible.delete(className);
    setVisibleClasses(newVisible);
    setUnits(prev => prev.map(u => u.class === className ? { ...u, class: '' } : u));
  };

  const { year, month } = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-orange-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
              <Calendar className="w-10 h-10 text-orange-600" />
              Teacher Planner
            </h1>
            <div className="flex gap-2">
              <input type="file" accept=".json" onChange={importSchedule} style={{ display: 'none' }} id="import-input" />
              <label htmlFor="import-input" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md cursor-pointer">
                <Download className="w-4 h-4 rotate-180" />
                Import
              </label>
              <button onClick={exportSchedule} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={() => setMode('setup')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition shadow-sm ${mode === 'setup' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
              <Settings className="w-4 h-4" />
              Setup Mode
            </button>
            <button onClick={() => setMode('units')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition shadow-sm ${mode === 'units' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
              <Layout className="w-4 h-4" />
              Unit Planning
            </button>
          </div>

          {mode === 'setup' && (
            <div className="mb-6 space-y-3">
              <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
                <div className="font-bold text-lg mb-2 text-orange-900">
                  {!semesterStart ? "📅 Click the FIRST day of your semester" : !semesterEnd ? "📅 Click the LAST day of your semester" : "✓ Semester set! Click days to cycle through break types"}
                </div>
                {semesterStart && semesterEnd && (
                  <div className="text-sm text-orange-700 font-medium">
                    Semester: {semesterStart.toLocaleDateString()} - {semesterEnd.toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {semesterStart && semesterEnd && (
                  <button onClick={resetSetup} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition text-sm font-semibold shadow-sm">
                    Reset Semester Setup
                  </button>
                )}
                <button onClick={() => setShowDayTypesModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition text-sm font-semibold shadow-md">
                  <Edit2 className="w-4 h-4" />
                  Customize Days
                </button>
              </div>
            </div>
          )}

          {mode === 'units' && (
            <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
              <strong className="text-purple-900">📚 Unit Planning Mode:</strong> <span className="text-purple-700">Click and drag across days to create learning units</span>
            </div>
          )}

          {mode === 'units' && units.length > 0 && (
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl p-6 mb-6 border-2 border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-orange-900">Learning Units</h2>
                  <button
                    onClick={() => setUnitsCollapsed(!unitsCollapsed)}
                    className="p-2 hover:bg-orange-100 rounded-lg transition text-orange-600"
                  >
                    <ChevronRight className={`w-5 h-5 transition-transform ${unitsCollapsed ? '' : 'rotate-90'}`} />
                  </button>
                </div>
                <button onClick={() => setShowClassModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition text-sm font-semibold shadow-md">
                  <Plus className="w-4 h-4" />
                  Add Class
                </button>
              </div>
              
              {!unitsCollapsed && (
                <>
                  {classes.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {classes.map(className => (
                        <button
                          key={className}
                          onClick={() => toggleClassVisibility(className)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
                            visibleClasses.has(className)
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {className}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    {units.filter(u => !u.class || visibleClasses.has(u.class)).map(unit => (
                      <div key={unit.id} className="flex items-center justify-between p-4 rounded-xl border-2 bg-white hover:shadow-md transition" style={{ borderColor: unit.color }}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-7 h-7 rounded-lg flex-shrink-0 shadow-sm" style={{ backgroundColor: unit.color }}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-800">{unit.name}</div>
                              {unit.class && (
                                <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                  {unit.class}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{unit.dates.length} class days • {unit.dates[0]} to {unit.dates[unit.dates.length - 1]}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => editUnit(unit)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteUnit(unit.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {mode === 'setup' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-sm">
              {instructionalDays.map(day => (
                <div key={day.id} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="w-6 h-6 rounded border-2 shadow-sm" style={{ backgroundColor: day.color, borderColor: day.textColor }}></div>
                  <span className="font-medium text-gray-700">{day.label}</span>
                </div>
              ))}
              {nonInstructionalDays.map(day => (
                <div key={day.id} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="w-6 h-6 rounded border-2 shadow-sm" style={{ backgroundColor: day.color, borderColor: day.textColor }}></div>
                  <span className="font-medium text-gray-700">{day.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <button onClick={() => changeMonth(-1)} className="p-2.5 hover:bg-orange-100 rounded-xl transition text-orange-600">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-orange-900">{monthNames[month]} {year}</h2>
            <button onClick={() => changeMonth(1)} className="p-2.5 hover:bg-orange-100 rounded-xl transition text-orange-600">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8">
            {[0, 1, 2].map(monthOffset => {
              const displayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
              const { daysInMonth: daysCount, startingDayOfWeek: startDay, year: displayYear, month: displayMonth } = getDaysInMonth(displayDate);

              return (
                <div key={monthOffset}>
                  {monthOffset > 0 && <h3 className="text-xl font-bold text-orange-800 mb-3">{monthNames[displayMonth]} {displayYear}</h3>}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {monthOffset === 0 && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-bold text-orange-700 text-sm">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2" onMouseUp={mode === 'units' ? handleUnitDragEnd : undefined}>
                    {[...Array(startDay)].map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
                    {[...Array(daysCount)].map((_, i) => {
                      const day = i + 1;
                      const dateStr = formatDate(displayYear, displayMonth, day);
                      const dayType = daySchedule[dateStr];
                      const unit = getUnitForDate(displayYear, displayMonth, day);
                      const isWeekend = new Date(displayYear, displayMonth, day).getDay() % 6 === 0;
                      const inSelection = mode === 'units' && isInDragSelection(displayYear, displayMonth, day);
                      const dayStyle = getDayTypeStyle(dayType);
                      const allTypes = [...instructionalDays, ...nonInstructionalDays];
                      const dayTypeLabel = allTypes.find(d => d.id === dayType)?.label;
                      
                      return (
                        <div
                          key={day}
                          onClick={() => mode === 'setup' && handleSetupClick(displayYear, displayMonth, day)}
                          onMouseDown={() => mode === 'units' && handleUnitDragStart(displayYear, displayMonth, day)}
                          onMouseEnter={() => mode === 'units' && handleUnitDragEnter(displayYear, displayMonth, day)}
                          className={`aspect-square rounded-xl p-2 transition relative ${isWeekend ? 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg border-2'} ${inSelection ? 'ring-2 ring-purple-400 shadow-lg' : ''}`}
                          style={!isWeekend && dayType ? dayStyle : !isWeekend ? { border: '2px solid #fed7aa' } : {}}
                        >
                          <div className="font-bold text-sm">{day}</div>
                          {mode === 'units' && dayTypeLabel && <div className="text-xs mt-0.5 opacity-75 truncate">{dayTypeLabel}</div>}
                          {unit && <div className="text-xs mt-1 px-1.5 py-0.5 rounded-lg text-white truncate font-medium shadow-sm" style={{ backgroundColor: unit.color }}>{unit.name}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Manage Classes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Add New Class</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="e.g., Physics, Calculus"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && addClass()}
                    />
                    <button
                      onClick={addClass}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {classes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Classes</label>
                    <div className="space-y-2">
                      {classes.map(className => (
                        <div key={className} className="flex items-center justify-between p-2 border rounded-lg">
                          <span>{className}</span>
                          <button
                            onClick={() => removeClass(className)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowClassModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {units.length > 0 && mode === 'setup' && (
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-orange-100">
            <h2 className="text-2xl font-bold mb-4 text-orange-900">Learning Units</h2>
            <div className="space-y-3">
              {units.map(unit => (
                <div key={unit.id} className="flex items-center justify-between p-4 rounded-xl border-2 bg-white hover:shadow-md transition" style={{ borderColor: unit.color }}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-7 h-7 rounded-lg flex-shrink-0 shadow-sm" style={{ backgroundColor: unit.color }}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-800">{unit.name}</div>
                        {unit.class && (
                          <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {unit.class}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{unit.dates.length} class days • {unit.dates[0]} to {unit.dates[unit.dates.length - 1]}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editUnit(unit)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteUnit(unit.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDayTypesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Customize Day Types</h3>
                <button onClick={() => setShowDayTypesModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Instructional Days (Rotating)</h4>
                  <button onClick={addInstructionalDay} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {instructionalDays.map(day => (
                    <div key={day.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input type="text" value={day.label} onChange={(e) => updateDayType('instructional', day.id, { label: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg" />
                      <div className="flex gap-2">
                        <div>
                          <label className="block text-xs mb-1">Background</label>
                          <select value={day.color} onChange={(e) => updateDayType('instructional', day.id, { color: e.target.value })} className="px-2 py-2 border rounded-lg" style={{ backgroundColor: day.color }}>
                            {colorOptions.map(color => <option key={color} value={color} style={{ backgroundColor: color }}>&nbsp;&nbsp;&nbsp;&nbsp;</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Text</label>
                          <select value={day.textColor} onChange={(e) => updateDayType('instructional', day.id, { textColor: e.target.value })} className="px-2 py-2 border rounded-lg" style={{ color: day.textColor }}>
                            {colorOptions.map(color => <option key={color} value={color} style={{ color: color }}>&nbsp;&nbsp;&nbsp;&nbsp;</option>)}
                          </select>
                        </div>
                      </div>
                      {instructionalDays.length > 1 && (
                        <button onClick={() => removeDayType('instructional', day.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Non-Instructional Days</h4>
                  <button onClick={addNonInstructionalDay} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {nonInstructionalDays.map(day => (
                    <div key={day.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input type="text" value={day.label} onChange={(e) => updateDayType('non-instructional', day.id, { label: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg" />
                      <div className="flex gap-2">
                        <div>
                          <label className="block text-xs mb-1">Background</label>
                          <select value={day.color} onChange={(e) => updateDayType('non-instructional', day.id, { color: e.target.value })} className="px-2 py-2 border rounded-lg" style={{ backgroundColor: day.color }}>
                            {colorOptions.map(color => <option key={color} value={color} style={{ backgroundColor: color }}>&nbsp;&nbsp;&nbsp;&nbsp;</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Text</label>
                          <select value={day.textColor} onChange={(e) => updateDayType('non-instructional', day.id, { textColor: e.target.value })} className="px-2 py-2 border rounded-lg" style={{ color: day.textColor }}>
                            {colorOptions.map(color => <option key={color} value={color} style={{ color: color }}>&nbsp;&nbsp;&nbsp;&nbsp;</option>)}
                          </select>
                        </div>
                      </div>
                      <button onClick={() => removeDayType('non-instructional', day.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowDayTypesModal(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Done</button>
              </div>
            </div>
          </div>
        )}

        {showUnitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">{editingUnit ? 'Edit Learning Unit' : 'Create Learning Unit'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Unit Name</label>
                  <input type="text" value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="e.g., Civil War, Algebra Fundamentals" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Class (Optional)</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No class assigned</option>
                    {classes.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {unitColors.map(color => (
                      <button key={color} onClick={() => setUnitColor(color)} className={`w-10 h-10 rounded-lg transition ${unitColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                {dragStart && dragEnd && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input 
                        type="date" 
                        value={formatDate(dragStart.year, dragStart.month, dragStart.day)}
                        onChange={(e) => {
                          const newDate = parseDate(e.target.value);
                          setDragStart({ year: newDate.getFullYear(), month: newDate.getMonth(), day: newDate.getDate() });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input 
                        type="date" 
                        value={formatDate(dragEnd.year, dragEnd.month, dragEnd.day)}
                        onChange={(e) => {
                          const newDate = parseDate(e.target.value);
                          setDragEnd({ year: newDate.getFullYear(), month: newDate.getMonth(), day: newDate.getDate() });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      You can also drag on the calendar to adjust dates
                    </div>
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <button onClick={cancelUnit} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={saveUnit} disabled={!unitName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">{editingUnit ? 'Update Unit' : 'Create Unit'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPlanner; 
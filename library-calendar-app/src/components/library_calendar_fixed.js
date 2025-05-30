import React, { useState, useCallback } from 'react';
import { Calendar, Upload, X, ChevronLeft, ChevronRight, BarChart3, TrendingUp, Clock, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

const LibraryCalendarApp = () => {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState({});
  const [fileDataMap, setFileDataMap] = useState({}); // Dosya bazında veri takibi
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [viewMode, setViewMode] = useState('year'); // year, month, day

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Yoğunluk renkleri ve aralıkları
  const intensityLevels = [
    { min: 0, max: 0, color: '#f3f4f6', label: 'Veri Yok' },
    { min: 1, max: 50, color: '#dcfce7', label: '1-50' },
    { min: 51, max: 100, color: '#bbf7d0', label: '51-100' },
    { min: 101, max: 200, color: '#86efac', label: '101-200' },
    { min: 201, max: 300, color: '#4ade80', label: '201-300' },
    { min: 301, max: 500, color: '#22c55e', label: '301-500' },
    { min: 501, max: 1000, color: '#16a34a', label: '501-1000' },
    { min: 1001, max: Infinity, color: '#15803d', label: '1000+' }
  ];

  const getIntensityColor = (count) => {
    const level = intensityLevels.find(l => count >= l.min && count <= l.max);
    return level ? level.color : '#f3f4f6';
  };

  const parseData = (csvData, fileName) => {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(/[,;]/).map(h => h.trim());
    
    // Tarih/Saat sütununu bul
    const dateColumnIndex = headers.findIndex(h => 
      h.toLowerCase().includes('tarih') || 
      h.toLowerCase().includes('saat') ||
      h.toLowerCase().includes('date') ||
      h.toLowerCase().includes('time')
    );

    if (dateColumnIndex === -1) {
      throw new Error('Tarih/Saat sütunu bulunamadı');
    }

    const processedData = {};

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/[,;]/);
      if (row.length > dateColumnIndex) {
        const dateTimeStr = row[dateColumnIndex].trim();
        
        // Tarihi parse et (DD.MM.YYYY HH.MM formatında)
        const dateMatch = dateTimeStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2})\.(\d{2})/);
        if (dateMatch) {
          const [, day, month, year, hour, minute] = dateMatch;
          const monthPadded = month.padStart(2, '0');
          const dayPadded = day.padStart(2, '0');
          const hourPadded = hour.padStart(2, '0');
          
          if (!processedData[year]) processedData[year] = {};
          if (!processedData[year][monthPadded]) processedData[year][monthPadded] = {};
          if (!processedData[year][monthPadded][dayPadded]) processedData[year][monthPadded][dayPadded] = {};
          if (!processedData[year][monthPadded][dayPadded][hourPadded]) processedData[year][monthPadded][dayPadded][hourPadded] = 0;
          
          processedData[year][monthPadded][dayPadded][hourPadded]++;
        }
      }
    }

    return processedData;
  };

  const handleFileUpload = useCallback(async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    for (const file of uploadedFiles) {
      const fileName = file.name;
      const fileId = Date.now() + Math.random();
      let csvData;

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        csvData = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        csvData = await file.text();
      }

      try {
        const newData = parseData(csvData, fileName);
        
        // Dosya bilgilerini kaydet
        setFileDataMap(prev => ({
          ...prev,
          [fileId]: newData
        }));
        
        // Mevcut veriyle birleştir
        setData(prevData => {
          const mergedData = { ...prevData };
          
          Object.keys(newData).forEach(year => {
            if (!mergedData[year]) mergedData[year] = {};
            Object.keys(newData[year]).forEach(month => {
              if (!mergedData[year][month]) mergedData[year][month] = {};
              Object.keys(newData[year][month]).forEach(day => {
                if (!mergedData[year][month][day]) mergedData[year][month][day] = {};
                Object.keys(newData[year][month][day]).forEach(hour => {
                  if (!mergedData[year][month][day][hour]) mergedData[year][month][day][hour] = 0;
                  mergedData[year][month][day][hour] += newData[year][month][day][hour];
                });
              });
            });
          });
          
          return mergedData;
        });

        setFiles(prev => [...prev, { name: fileName, id: fileId }]);
      } catch (error) {
        alert(`Dosya işlenirken hata: ${error.message}`);
      }
    }
    
    event.target.value = '';
  }, []);

  const removeFile = (fileId) => {
    const fileData = fileDataMap[fileId];
    
    if (fileData) {
      // Dosyanın verisini toplam veriден çıkar
      setData(prevData => {
        const updatedData = { ...prevData };
        
        Object.keys(fileData).forEach(year => {
          if (updatedData[year]) {
            Object.keys(fileData[year]).forEach(month => {
              if (updatedData[year][month]) {
                Object.keys(fileData[year][month]).forEach(day => {
                  if (updatedData[year][month][day]) {
                    Object.keys(fileData[year][month][day]).forEach(hour => {
                      if (updatedData[year][month][day][hour]) {
                        updatedData[year][month][day][hour] -= fileData[year][month][day][hour];
                        if (updatedData[year][month][day][hour] <= 0) {
                          delete updatedData[year][month][day][hour];
                        }
                      }
                    });
                    if (Object.keys(updatedData[year][month][day]).length === 0) {
                      delete updatedData[year][month][day];
                    }
                  }
                });
                if (Object.keys(updatedData[year][month]).length === 0) {
                  delete updatedData[year][month];
                }
              }
            });
            if (Object.keys(updatedData[year]).length === 0) {
              delete updatedData[year];
            }
          }
        });
        
        return updatedData;
      });
      
      // Dosya verisini haritadan kaldır
      setFileDataMap(prev => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getYearStats = (year) => {
    if (!data[year]) return { total: 0, days: 0, avgPerDay: 0 };
    
    let total = 0;
    let days = 0;
    
    Object.values(data[year]).forEach(monthData => {
      Object.values(monthData).forEach(dayData => {
        days++;
        Object.values(dayData).forEach(hourCount => {
          total += hourCount;
        });
      });
    });
    
    return { total, days, avgPerDay: days > 0 ? Math.round(total / days) : 0 };
  };

  const getMonthStats = (year, month) => {
    const monthPadded = month.toString().padStart(2, '0');
    if (!data[year] || !data[year][monthPadded]) return { total: 0, days: 0, avgPerDay: 0, peak: 0 };
    
    let total = 0;
    let days = 0;
    let peak = 0;
    
    Object.values(data[year][monthPadded]).forEach(dayData => {
      days++;
      let dayTotal = 0;
      Object.values(dayData).forEach(hourCount => {
        dayTotal += hourCount;
        total += hourCount;
      });
      peak = Math.max(peak, dayTotal);
    });
    
    return { total, days, avgPerDay: days > 0 ? Math.round(total / days) : 0, peak };
  };

  const getDayStats = (year, month, day) => {
    const monthPadded = month.toString().padStart(2, '0');
    const dayPadded = day.toString().padStart(2, '0');
    if (!data[year] || !data[year][monthPadded] || !data[year][monthPadded][dayPadded]) return { total: 0, peak: 0, peakHour: '' };
    
    let total = 0;
    let peak = 0;
    let peakHour = '';
    
    Object.entries(data[year][monthPadded][dayPadded]).forEach(([hour, count]) => {
      total += count;
      if (count > peak) {
        peak = count;
        peakHour = `${hour}:00`;
      }
    });
    
    return { total, peak, peakHour };
  };

  const getDayTotal = (year, month, day) => {
    const monthPadded = month.toString().padStart(2, '0');
    const dayPadded = day.toString().padStart(2, '0');
    if (!data[year] || !data[year][monthPadded] || !data[year][monthPadded][dayPadded]) return 0;
    return Object.values(data[year][monthPadded][dayPadded]).reduce((sum, count) => sum + count, 0);
  };

  const hasDataForMonth = (year, month) => {
    const monthPadded = month.toString().padStart(2, '0');
    return data[year] && data[year][monthPadded] && Object.keys(data[year][monthPadded]).length > 0;
  };

  const renderYearView = () => {
    const stats = getYearStats(currentYear);
    const availableYears = Object.keys(data).map(Number).sort((a, b) => a - b);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentYear(prev => prev - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">{currentYear}</h2>
            <button
              onClick={() => setCurrentYear(prev => prev + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mevcut Yıllar:</span>
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => setCurrentYear(year)}
                  className={`px-3 py-1 rounded text-sm ${
                    year === currentYear 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Toplam: {stats.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Günlük Ort: {stats.avgPerDay}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {monthNames.map((monthName, monthIndex) => {
            const month = (monthIndex + 1).toString().padStart(2, '0');
            const hasData = hasDataForMonth(currentYear, month);
            
            return (
              <div key={month} className="border rounded-lg p-4">
                <button
                  onClick={() => hasData ? (setCurrentMonth(month), setViewMode('month')) : null}
                  className={`w-full text-left ${hasData ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  disabled={!hasData}
                >
                  <h3 className="font-semibold mb-3">{monthName}</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 42 }, (_, i) => {
                      const date = new Date(currentYear, monthIndex, i - 6);
                      const day = date.getDate();
                      const isCurrentMonth = date.getMonth() === monthIndex;
                      const dayTotal = isCurrentMonth ? getDayTotal(currentYear, month, day) : 0;
                      
                      return (
                        <div
                          key={i}
                          className="w-6 h-6 text-xs flex items-center justify-center rounded"
                          style={{
                            backgroundColor: isCurrentMonth && dayTotal > 0 ? getIntensityColor(dayTotal) : '#f9fafb',
                            color: isCurrentMonth ? '#374151' : '#d1d5db'
                          }}
                        >
                          {isCurrentMonth ? day : ''}
                        </div>
                      );
                    })}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const stats = getMonthStats(currentYear, currentMonth);
    const firstDay = new Date(currentYear, parseInt(currentMonth) - 1, 1);
    const lastDay = new Date(currentYear, parseInt(currentMonth), 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('year')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">{monthNames[parseInt(currentMonth) - 1]} {currentYear}</h2>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Toplam: {stats.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>En Yoğun: {stats.peak}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Günlük Ort: {stats.avgPerDay}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold p-2 text-gray-600">
              {day}
            </div>
          ))}
          
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === parseInt(currentMonth) - 1;
            const dayTotal = isCurrentMonth ? getDayTotal(currentYear, currentMonth, date.getDate()) : 0;
            const hasData = dayTotal > 0;
            
            return (
              <button
                key={index}
                onClick={() => hasData ? (setCurrentDay(date.getDate().toString().padStart(2, '0')), setViewMode('day')) : null}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  isCurrentMonth 
                    ? hasData 
                      ? 'hover:ring-2 hover:ring-blue-300 cursor-pointer' 
                      : 'cursor-not-allowed opacity-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isCurrentMonth && hasData ? getIntensityColor(dayTotal) : '#f9fafb'
                }}
                disabled={!hasData}
              >
                <div className="font-semibold">{date.getDate()}</div>
                {isCurrentMonth && hasData && (
                  <div className="text-xs mt-1">{dayTotal}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const stats = getDayStats(currentYear, currentMonth, currentDay);
    const monthPadded = currentMonth.toString().padStart(2, '0');
    const dayPadded = currentDay.toString().padStart(2, '0');
    const hourData = data[currentYear]?.[monthPadded]?.[dayPadded] || {};
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('month')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">
              {parseInt(currentDay)} {monthNames[parseInt(currentMonth) - 1]} {currentYear}
            </h2>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Toplam: {stats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>En Yoğun: {stats.peak}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Zirve Saati: {stats.peakHour}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 24 }, (_, hour) => {
            const hourPadded = hour.toString().padStart(2, '0');
            const count = hourData[hourPadded] || 0;
            
            return (
              <button
                key={hour}
                onClick={() => setSelectedHour(selectedHour === hour ? null : hour)}
                className={`p-4 text-center border rounded-lg transition-all ${
                  selectedHour === hour ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                style={{ backgroundColor: count > 0 ? getIntensityColor(count) : '#f9fafb' }}
              >
                <div className="font-semibold">{hourPadded}:00</div>
                <div className="text-lg mt-1">{count}</div>
              </button>
            );
          })}
        </div>

        {/* Seçilen Saat Detayı */}
        {selectedHour !== null && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">
              {selectedHour.toString().padStart(2, '0')}:00 - {(selectedHour + 1).toString().padStart(2, '0')}:00 Saat Dilimi Detayı
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Giriş Sayısı</div>
                <div className="text-2xl font-bold text-blue-600">{hourData[selectedHour.toString().padStart(2, '0')] || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Günlük Toplam İçindeki Payı</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round(((hourData[selectedHour.toString().padStart(2, '0')] || 0) / stats.total) * 100) : 0}%
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Saat Dilimi Sıralaması</div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.entries(hourData)
                    .sort(([,a], [,b]) => b - a)
                    .findIndex(([hour]) => parseInt(hour) === selectedHour) + 1}
                  /{Object.keys(hourData).length}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Yoğunluk Seviyesi</div>
                <div className="text-xl font-bold text-orange-600">
                  {intensityLevels.find(l => {
                    const count = hourData[selectedHour.toString().padStart(2, '0')] || 0;
                    return count >= l.min && count <= l.max;
                  })?.label || 'Bilinmiyor'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLegend = () => (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-3">Yoğunluk Skalası</h3>
      <div className="flex flex-wrap gap-2">
        {intensityLevels.map((level, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-sm">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Bilkent Kütüphanesi Turnike Geçiş Takvimi</h1>
        </div>

        {/* Dosya Yükleme */}
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <Upload className="w-6 h-6 text-gray-500" />
            <div>
              <label htmlFor="fileInput" className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600">
                Dosya Seç (CSV/XLSX)
              </label>
              <input
                id="fileInput"
                type="file"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Yüklenen Dosyalar:</h4>
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        {Object.keys(data).length > 0 && renderLegend()}
      </div>

      {/* Ana İçerik */}
      {Object.keys(data).length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {viewMode === 'year' && renderYearView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'day' && renderDayView()}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Veri Bekleniyor</h3>
          <p className="text-gray-500">Lütfen turnike geçiş verilerini içeren CSV veya XLSX dosyalarını yükleyin.</p>
        </div>
      )}
    </div>
  );
};

export default LibraryCalendarApp;
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { getNutritionLogs, getNutritionTargets, getWaterIntake, getReviewSession } from '@/lib/api';
import { getCurrentUser, getUserProfile } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { FaStar } from 'react-icons/fa';
import { useNutritionData } from '@/lib/NutritionDataContext';
import { LineChart, Line } from 'recharts';
import { useAuth } from '@/lib/auth-context';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('workout');
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [macroBarData, setMacroBarData] = useState<any[]>([]);
  const [waterBarData, setWaterBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [waterForSelected, setWaterForSelected] = useState({ actual: 0, target: 0 });
  const [loading, setLoading] = useState(false);
  const [minSelectableDate, setMinSelectableDate] = useState<string>('');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [range, setRange] = useState({
    startDate: parseISO(fromDate),
    endDate: parseISO(toDate),
    key: 'selection',
  });
  const [consistencyReport, setConsistencyReport] = useState<any[]>([]);
  const { nutritionDataVersion } = useNutritionData();
  const [reviewRows, setReviewRows] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState('');
  const { user, loading: userLoading } = useAuth();
  
  // Mock analytics data
  const workoutAnalytics = {
    totalWorkouts: 12,
    totalVolume: 24600,
    avgDuration: 48,
    prCount: 5,
    volumeByDay: [
      { date: '2023-01-01', volume: 2100 },
      { date: '2023-01-02', volume: 0 },
      { date: '2023-01-03', volume: 2350 },
      { date: '2023-01-04', volume: 0 },
      { date: '2023-01-05', volume: 2500 },
      { date: '2023-01-06', volume: 0 },
      { date: '2023-01-07', volume: 2300 }
    ]
  };
  
  // Helper to clamp date range to max 7 days
  const clampDates = (from: string, to: string) => {
    const fromD = parseISO(from);
    const toD = parseISO(to);
    if (isAfter(fromD, toD)) return [to, to];
    const diff = (toD.getTime() - fromD.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 6) return [format(subDays(toD, 6), 'yyyy-MM-dd'), to];
    return [from, to];
  };

  useEffect(() => {
    if (userLoading || !user) return;
    if (activeTab !== 'nutrition' && activeTab !== 'workout') return;
    let isMounted = true;
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (!user) {
          setMacroBarData([]);
          setWaterBarData([]);
          setPieData([]);
          setWaterForSelected({ actual: 0, target: 0 });
          setConsistencyReport([]);
          setReviewRows([]);
          setReviewSummary('No review data available.');
          setLoading(false);
          return;
        }
        // Clamp dates
        const [from, to] = clampDates(fromDate, toDate);
        const fromD = parseISO(from);
        const toD = parseISO(to);
        const days = Math.round((toD.getTime() - fromD.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dates: string[] = [];
        for (let i = 0; i < days; i++) {
          const d = new Date(fromD);
          d.setDate(fromD.getDate() + i);
          dates.push(format(d, 'yyyy-MM-dd'));
        }
        // Fetch logs, targets, water for each day
        const logsByDay = await Promise.all(dates.map(date => getNutritionLogs(date)));
        const targetsByDay = await Promise.all(dates.map(date => getNutritionTargets(user.id, date)));
        const waterByDay = await Promise.all(dates.map(date => getWaterIntake(user.id, date)));
        // Macro bar data
        const macroBar = dates.map((date, i) => {
          const logs = logsByDay[i] as any[];
          const target = targetsByDay[i] || { targetProtein: 100, targetCarbs: 200, targetFat: 60, targetCalories: 2000 };
          let protein = 0, carbs = 0, fat = 0, calories = 0;
          if (logs && logs.length > 0) {
            logs.forEach(log => {
              protein += log.protein_g ?? log.protein ?? 0;
              carbs += log.carbs_g ?? log.carbs ?? 0;
              fat += log.fat_g ?? log.fats ?? 0;
              calories += log.calories || 0;
            });
          }
          // Debug log for May 11
          if (date === '2024-05-11') {
            console.log('[ANALYTICS DEBUG] May 11 logs:', logs);
            console.log('[ANALYTICS DEBUG] May 11 totals:', { calories, protein, carbs, fat });
          }
          return {
            date: format(parseISO(date), 'MMM d'),
            rawDate: date,
            calories,
            targetCalories: target.targetCalories || (target.targetProtein * 4 + target.targetCarbs * 4 + target.targetFat * 9),
            protein,
            carbs,
            fat,
            targetProtein: target.targetProtein,
            targetCarbs: target.targetCarbs,
            targetFat: target.targetFat,
          };
        });
        setMacroBarData(macroBar);
        // Water bar data
        const waterBar = dates.map((date, i) => {
          const target = targetsByDay[i] || { targetWater: 3000 };
          return {
            date: format(parseISO(date), 'MMM d'),
            rawDate: date,
            water: waterByDay[i],
            targetWater: target.targetWater || 3000,
          };
        });
        setWaterBarData(waterBar);
        // Pie data for selected day
        const selIdx = dates.findIndex(d => d === selectedDay);
        const logs = selIdx >= 0 ? logsByDay[selIdx] as any[] : [];
        let protein = 0, carbs = 0, fat = 0;
        if (logs && logs.length > 0) {
          logs.forEach(log => {
            protein += log.protein_g ?? log.protein ?? 0;
            carbs += log.carbs_g ?? log.carbs ?? 0;
            fat += log.fat_g ?? log.fats ?? 0;
          });
        }
        setPieData([
          { name: 'Protein', value: protein },
          { name: 'Carbs', value: carbs },
          { name: 'Fat', value: fat },
        ]);
        // Water for selected day
        const water = selIdx >= 0 ? waterByDay[selIdx] : 0;
        const targetWater = selIdx >= 0 && targetsByDay[selIdx] ? targetsByDay[selIdx].targetWater || 3000 : 3000;
        setWaterForSelected({ actual: water, target: targetWater });
        // Consistency report for current month
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysInMonth = Math.round((today.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const monthDates: string[] = [];
        for (let i = 0; i < daysInMonth; i++) {
          const d = new Date(firstOfMonth);
          d.setDate(firstOfMonth.getDate() + i);
          monthDates.push(format(d, 'yyyy-MM-dd'));
        }
        const monthLogsByDay = await Promise.all(monthDates.map(date => getNutritionLogs(date)));
        const monthTargetsByDay = await Promise.all(monthDates.map(date => getNutritionTargets(user.id, date)));
        const monthWaterByDay = await Promise.all(monthDates.map(date => getWaterIntake(user.id, date)));
        const report: any[] = [];
        for (let i = 0; i < monthDates.length; i++) {
          const logs = monthLogsByDay[i] as any[];
          const target = monthTargetsByDay[i] || { targetProtein: 100, targetCarbs: 200, targetFat: 60, targetCalories: 2000, targetWater: 3000 };
          let calories = 0, protein = 0, carbs = 0, fat = 0;
          if (logs && logs.length > 0) {
            logs.forEach(log => {
              calories += log.calories || 0;
              protein += log.protein_g ?? log.protein ?? 0;
              carbs += log.carbs_g ?? log.carbs ?? 0;
              fat += log.fat_g ?? log.fats ?? 0;
            });
          }
          const water = monthWaterByDay[i];
          const calOk = target.targetCalories && Math.abs(calories - target.targetCalories) / target.targetCalories <= 0.05;
          const waterOk = target.targetWater && Math.abs(water - target.targetWater) / target.targetWater <= 0.05;
          if (calOk && waterOk) {
            report.push({
              date: monthDates[i],
              calories,
              targetCalories: target.targetCalories,
              water,
              targetWater: target.targetWater,
            });
          }
        }
        setConsistencyReport(report);
        // Fetch review data
        const review = await getReviewSession(user.id);
        if (review && review.rows && Array.isArray(review.rows)) {
          setReviewRows(review.rows);
          // Calculate summary: hit = actualWeight within 0.2kg of expectedWeight
          let hit = 0, total = 0;
          review.rows.forEach((row: any, idx: number) => {
            if (idx === 0) return; // skip first row
            if (row.actualWeight != null && Math.abs(row.actualWeight - row.expectedWeight) <= 0.2) hit++;
            if (row.actualWeight != null) total++;
          });
          setReviewSummary(`You hit your target ${hit} out of ${total} times.`);
        } else {
          setReviewRows([]);
          setReviewSummary('No review data available.');
        }
      } catch (e) {
        setMacroBarData([]);
        setWaterBarData([]);
        setPieData([]);
        setWaterForSelected({ actual: 0, target: 0 });
        setConsistencyReport([]);
        setReviewRows([]);
        setReviewSummary('No review data available.');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
    return () => { isMounted = false; };
  }, [activeTab, fromDate, toDate, selectedDay, nutritionDataVersion, userLoading, user]);
  
  useEffect(() => {
    async function fetchMinDate() {
      const user = await getCurrentUser();
      if (user) {
        const { data: profile } = await getUserProfile(user.id);
        if (profile && profile.created_at) {
          setMinSelectableDate(profile.created_at.slice(0, 10));
        }
      }
    }
    fetchMinDate();
  }, []);
  
  useEffect(() => {
    setRange({
      startDate: parseISO(fromDate),
      endDate: parseISO(toDate),
      key: 'selection',
    });
  }, [fromDate, toDate]);
  
  // Colors for pie
  const pieColors = ['#22d3ee', '#818cf8', '#facc15'];

  if (userLoading || !user) {
    return <div className="flex justify-center py-10">Loading user...</div>;
  }

  return (
    <Layout title="ANALYTICS">
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 pb-2 text-center ${
              activeTab === 'workout' ? 'text-accent border-b-2 border-accent font-medium' : 'text-text-light'
            }`}
            onClick={() => setActiveTab('workout')}
          >
            WORKOUT
          </button>
          <button
            className={`flex-1 pb-2 text-center ${
              activeTab === 'nutrition' ? 'text-accent border-b-2 border-accent font-medium' : 'text-text-light'
            }`}
            onClick={() => setActiveTab('nutrition')}
          >
            NUTRITION
          </button>
        </div>
      </div>
      
      {activeTab === 'nutrition' && (
        <div className="space-y-8">
          {/* Macro Bar Chart */}
          <div className="card p-4">
            <div className="relative flex items-center mb-2" style={{ minHeight: 40 }}>
              <div className="relative flex gap-4 items-end z-10">
                <div>
                  <label className="block text-xs text-text-light mb-1">Date Range</label>
                  <button
                    className="p-2 rounded bg-background text-white border border-gray-700 min-w-[240px] text-left"
                    onClick={() => setShowRangePicker(v => !v)}
                  >
                    {format(parseISO(fromDate), 'MMM d, yyyy')} - {format(parseISO(toDate), 'MMM d, yyyy')}
                  </button>
                  {showRangePicker && (
                    <div className="absolute z-50 mt-2" style={{ left: 0 }}>
                      <DateRange
                        editableDateInputs={false}
                        showDateDisplay={false}
                        months={1}
                        onChange={(rangesByKey: RangeKeyDict) => {
                          const sel = rangesByKey.selection;
                          const startDate = sel.startDate ? new Date(sel.startDate) : new Date();
                          const endDate = sel.endDate ? new Date(sel.endDate) : new Date();
                          // If only startDate is picked, restrict maxDate for endDate
                          let today = new Date();
                          let minStart = minSelectableDate ? parseISO(minSelectableDate) : new Date('2000-01-01');
                          let newStart = startDate < minStart ? minStart : startDate;
                          let newEnd = endDate > today ? today : endDate;
                          // If user is picking endDate, clamp to 7 days from start
                          let maxEnd = new Date(newStart);
                          maxEnd.setDate(newStart.getDate() + 6);
                          if (maxEnd > today) maxEnd = today;
                          if (newEnd > maxEnd) newEnd = maxEnd;
                          // If only startDate is picked, keep endDate = startDate
                          if (!sel.endDate || !sel.startDate || (sel.startDate.getTime() === sel.endDate.getTime())) {
                            setRange({ startDate: newStart, endDate: newStart, key: 'selection' });
                          } else {
                            setRange({ startDate: newStart, endDate: newEnd, key: 'selection' });
                            setFromDate(format(newStart, 'yyyy-MM-dd'));
                            setToDate(format(newEnd, 'yyyy-MM-dd'));
                            setShowRangePicker(false);
                          }
                        }}
                        moveRangeOnFirstSelection={false}
                        ranges={[range]}
                        maxDate={range.startDate ? (() => {
                          let maxEnd = new Date(range.startDate);
                          maxEnd.setDate(maxEnd.getDate() + 6);
                          let today = new Date();
                          return maxEnd > today ? today : maxEnd;
                        })() : new Date()}
                        minDate={minSelectableDate ? parseISO(minSelectableDate) : new Date('2000-01-01')}
                        rangeColors={["#22c55e"]}
                      />
                    </div>
                  )}
                </div>
              </div>
              <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-center w-max">Calories: Actual vs Target (Bar Chart)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={macroBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <div className="font-bold mb-2 text-lg">{label}</div>
                      <div className="mb-1"><span className="font-semibold text-green-400">Actual Calories:</span> {d.calories} kcal</div>
                      <div className="mb-2"><span className="font-semibold text-orange-400">Target Calories:</span> {d.targetCalories} kcal</div>
                      <div className="mt-2 text-xs text-text-light">Macros (actual/target):</div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div><span style={{color:'#ec4899'}}>Protein:</span> {d.protein}/{d.targetProtein}g <span className="text-xs">({d.protein * 4}/{d.targetProtein * 4} kcal)</span></div>
                        <div><span style={{color:'#a3a635'}}>Carbs:</span> {d.carbs}/{d.targetCarbs}g <span className="text-xs">({d.carbs * 4}/{d.targetCarbs * 4} kcal)</span></div>
                        <div><span style={{color:'#facc15'}}>Fat:</span> {d.fat}/{d.targetFat}g <span className="text-xs">({d.fat * 9}/{d.targetFat * 9} kcal)</span></div>
                      </div>
                    </div>
                  );
                }} />
                <Legend />
                <Bar dataKey="calories" fill="#22c55e" name="Actual Calories" radius={[6, 6, 0, 0]} activeBar={{ fill: 'rgba(34,197,94,0.7)' }} />
                <Bar dataKey="targetCalories" fill="#f59e42" name="Target Calories" radius={[6, 6, 0, 0]} activeBar={{ fill: 'rgba(245,158,66,0.7)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Water Bar Chart */}
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4 text-center">Water Intake: Actual vs Target (Bar Chart)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={waterBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="custom-tooltip" style={{ border: '1px solid #2563eb' }}>
                      <div className="font-bold mb-2 text-lg">{label}</div>
                      <div className="mb-1"><span className="font-semibold text-blue-400">Water:</span> {d.water} / {d.targetWater} ml</div>
                    </div>
                  );
                }} />
                <Legend />
                <Bar dataKey="water" fill="#2563eb" name="Water (Actual)" radius={[6, 6, 0, 0]} activeBar={{ fill: 'rgba(37,99,235,0.7)' }} />
                <Bar dataKey="targetWater" fill="#38bdf8" name="Water (Target)" radius={[6, 6, 0, 0]} activeBar={{ fill: 'rgba(56,189,248,0.7)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart + Water Bottle */}
          <div className="card p-4 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 flex flex-row items-center gap-8">
              <div className="flex flex-col items-start justify-center" style={{ minWidth: 180 }}>
                <label className="block text-xs text-text-light mb-1">Select Day</label>
                <input
                  type="date"
                  value={selectedDay}
                  min={minSelectableDate || fromDate}
                  max={toDate}
                  onChange={e => setSelectedDay(e.target.value)}
                  className="p-2 rounded bg-background text-white border border-gray-700"
                  style={{width: 160}}
                />
              </div>
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}g`}
                  >
                    <Cell key="protein" fill="#ec4899" />
                    <Cell key="carbs" fill="#a3a635" />
                    <Cell key="fat" fill="#facc15" />
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    let kcal = 0;
                    if (d.name === 'Protein') kcal = d.value * 4;
                    else if (d.name === 'Carbs') kcal = d.value * 4;
                    else if (d.name === 'Fat') kcal = d.value * 9;
                    return (
                      <div style={{ background: 'rgba(24,28,35,0.85)', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px #0008', color: '#fff', minWidth: 120, border: '1px solid #ec4899', backdropFilter: 'blur(2px)' }}>
                        <div className="font-bold mb-2 text-lg">{d.name}</div>
                        <div className="mb-1">{d.value}g <span className="text-xs">({kcal} kcal)</span></div>
                      </div>
                    );
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4 flex flex-col items-center justify-center" style={{ minWidth: 260 }}>
              <h3 className="text-lg font-bold mb-4 text-center">Water (ml)</h3>
              <div className="flex flex-col items-center justify-center h-full" style={{ height: 380, width: 160 }}>
                <div className="relative flex flex-col items-center" style={{ height: 340, width: 100 }}>
                  <svg width="100" height="340" viewBox="0 0 100 340">
                    <defs>
                      <linearGradient id="waterGradientWideTall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    {/* Target value above the bottle cap */}
                    <text x="50" y="18" textAnchor="middle" fill="#2563eb" fontSize="15" fontWeight="bold">{waterForSelected.target} ml</text>
                    {/* Bottle outline */}
                    <rect x="10" y="40" width="80" height="260" rx="40" fill="#fff" stroke="#2563eb" strokeWidth="5" />
                    {/* Water fill */}
                    <rect x="10" y={300 - (260 * Math.min(1, waterForSelected.actual / (waterForSelected.target || 1)))} width="80" height={260 * Math.min(1, waterForSelected.actual / (waterForSelected.target || 1))} rx="40" fill="url(#waterGradientWideTall)" />
                    {/* Bottle neck */}
                    <rect x="35" y="10" width="30" height="40" rx="15" fill="none" stroke="#2563eb" strokeWidth="5" />
                    {/* Actual value below the bottle */}
                    <text x="50" y="330" textAnchor="middle" fill="#2563eb" fontSize="15" fontWeight="bold">{waterForSelected.actual} ml</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Weight Progression Line Chart */}
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4 text-center">Weight Progression: Expected vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reviewRows} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expectedWeight" stroke="#2563eb" name="Target (Expected)" strokeWidth={3} />
                <Line type="monotone" dataKey="actualWeight" stroke="#ef4444" name="Actual" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-text-light">{reviewSummary}</div>
          </div>
          {/* Consistency Report (4th card) */}
          <div className="card p-4 mt-8">
            <h3 className="text-lg font-bold mb-4 text-center">Consistency Report (±5% of Target, This Month)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Calories (Actual/Target)</th>
                    <th className="px-4 py-2">Water (Actual/Target)</th>
                    <th className="px-4 py-2">Star</th>
                  </tr>
                </thead>
                <tbody>
                  {consistencyReport.length > 0 ? (
                    consistencyReport.map((row, idx) => (
                      <tr key={row.date} className="border-b border-gray-800">
                        <td className="px-4 py-2">{format(parseISO(row.date), 'MMM d, yyyy')}</td>
                        <td className="px-4 py-2">{row.calories} / {row.targetCalories}</td>
                        <td className="px-4 py-2">{row.water} / {row.targetWater} ml</td>
                        <td className="px-4 py-2 text-yellow-400"><FaStar /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-text-light py-4">No consistent days found this month.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'nutrition' && loading && (
        <div className="flex justify-center py-10">Loading analytics...</div>
      )}
      
      {activeTab === 'workout' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">Total Workouts</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.totalWorkouts}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">Volume Lifted</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.totalVolume} kg</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">Avg Duration</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.avgDuration} min</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">New PRs</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.prCount}</div>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4">Workout Volume Trend</h3>
            <div className="h-48 flex items-end space-x-2">
              {workoutAnalytics.volumeByDay.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-text-light mb-1">{day.volume > 0 ? day.volume : ''}</div>
                  <div 
                    className={`w-full ${day.volume > 0 ? 'bg-accent' : 'bg-gray-700'} rounded-t-sm`} 
                    style={{ height: `${day.volume > 0 ? (day.volume / 3000 * 100) : 5}%` }}
                  ></div>
                  <div className="text-xs text-text-light mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4">Recent Personal Records</h3>
            <div className="space-y-4">
              <div className="flex justify-between p-2 border-b border-gray-700">
                <div>
                  <div className="font-medium">Bench Press - Dumbbell</div>
                  <div className="text-text-light">40kg × 10 reps</div>
                </div>
                <div className="flex items-center">
                  <span className="text-accent">+2.5kg</span>
                </div>
              </div>
              <div className="flex justify-between p-2 border-b border-gray-700">
                <div>
                  <div className="font-medium">Back Squat - Barbell</div>
                  <div className="text-text-light">100kg × 8 reps</div>
                </div>
                <div className="flex items-center">
                  <span className="text-accent">+5kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .recharts-tooltip-wrapper, .recharts-default-tooltip {
          background: transparent !important;
          box-shadow: none !important;
        }
        .custom-tooltip {
          background: rgba(24,28,35,0.85) !important;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px #0008;
          color: #fff;
          border: 1px solid #22c55e;
          backdrop-filter: blur(2px);
        }
      `}</style>
    </Layout>
  );
}

function getWavePath(actual: number, target: number, width: number, height: number) {
  // Calculate fill percent
  const percent = Math.max(0, Math.min(1, actual / (target || 1)));
  const fillHeight = height * percent;
  // Simple wave path (could be animated for more effect)
  const waveY = height - fillHeight + 20;
  return `M10,${waveY} Q20,${waveY - 10} 30,${waveY} T50,${waveY} V280 H10Z`;
} 
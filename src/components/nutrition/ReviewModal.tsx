import React, { useState, useEffect } from 'react';

interface ReviewRow {
  date: string;
  expectedWeight: number;
  actualWeight: number | null;
  editable: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCurrentWeight?: number;
  initialGoalWeight?: number;
  initialWeeks?: number;
  initialRows?: ReviewRow[];
  onSave: (data: {
    currentWeight: number;
    goalWeight: number;
    weeks: number;
    rows: ReviewRow[];
  }) => void;
}

const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const generateRows = (
  currentWeight: number,
  goalWeight: number,
  weeks: number,
  startDate: string,
  existingRows?: ReviewRow[]
): ReviewRow[] => {
  const rows: ReviewRow[] = [];
  const weeklyChange = (goalWeight - currentWeight) / weeks;
  const today = new Date(startDate);
  for (let i = 0; i <= weeks; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i * 7);
    const dateStr = date.toISOString().split('T')[0];
    const expectedWeight = +(currentWeight + weeklyChange * i).toFixed(1);
    let actualWeight = null;
    if (existingRows && existingRows[i] && existingRows[i].actualWeight != null) {
      actualWeight = existingRows[i].actualWeight;
    } else if (i === 0) {
      actualWeight = currentWeight;
    }
    const editable = i === 0 || new Date(dateStr) <= new Date(getToday());
    rows.push({ date: dateStr, expectedWeight, actualWeight, editable });
  }
  return rows;
};

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  initialCurrentWeight,
  initialGoalWeight,
  initialWeeks,
  initialRows,
  onSave,
}) => {
  const [currentWeight, setCurrentWeight] = useState(initialCurrentWeight || 0);
  const [goalWeight, setGoalWeight] = useState(initialGoalWeight || 0);
  const [weeks, setWeeks] = useState(initialWeeks || 4);
  const [rows, setRows] = useState<ReviewRow[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCurrentWeight(initialCurrentWeight || 0);
      setGoalWeight(initialGoalWeight || 0);
      setWeeks(initialWeeks || 4);
      setRows(
        generateRows(
          initialCurrentWeight || 0,
          initialGoalWeight || 0,
          initialWeeks || 4,
          getToday(),
          initialRows
        )
      );
    }
  }, [isOpen, initialCurrentWeight, initialGoalWeight, initialWeeks, initialRows]);

  useEffect(() => {
    setRows(generateRows(currentWeight, goalWeight, weeks, getToday(), rows));
    // eslint-disable-next-line
  }, [currentWeight, goalWeight, weeks]);

  const handleActualWeightChange = (idx: number, value: string) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, actualWeight: value === '' ? null : +value } : row
      )
    );
  };

  const handleSave = () => {
    onSave({ currentWeight, goalWeight, weeks, rows });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#252A2D] rounded-lg p-6 w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Review Progress</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-text-light mb-1">Current Weight</label>
            <input
              type="number"
              value={currentWeight === 0 ? '' : currentWeight}
              onChange={(e) => setCurrentWeight(+e.target.value)}
              className="w-full p-3 bg-background rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-text-light mb-1">Goal Weight</label>
            <input
              type="number"
              value={goalWeight === 0 ? '' : goalWeight}
              onChange={(e) => setGoalWeight(+e.target.value)}
              className="w-full p-3 bg-background rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-text-light mb-1">Time to Achieve (weeks)</label>
            <input
              type="number"
              value={weeks === 0 ? '' : weeks}
              min={1}
              onChange={(e) => setWeeks(Math.max(1, +e.target.value))}
              className="w-full p-3 bg-background rounded-lg text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-white">
            <thead>
              <tr>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Expected Weight</th>
                <th className="py-2 px-4">Actual Weight</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.date}>
                  <td className="py-2 px-4">{row.date}</td>
                  <td className="py-2 px-4">{row.expectedWeight}</td>
                  <td className="py-2 px-4">
                    {idx === 0 ? (
                      <span>{currentWeight}</span>
                    ) : row.editable ? (
                      <input
                        type="number"
                        value={row.actualWeight ?? ''}
                        onChange={(e) => handleActualWeightChange(idx, e.target.value)}
                        className="w-24 p-2 bg-background rounded-lg text-white"
                      />
                    ) : (
                      row.actualWeight !== null ? row.actualWeight : ''
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-accent text-white font-bold hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal; 
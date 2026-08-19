import React, { useState } from 'react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const sortByWeekday = (availability = []) => {
  return [...availability].sort(
    (a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day)
  );
};

export default function DoctorSlotsDrawer({ doctor, isOpen, onClose, onSave }) {
  const [sessions, setSessions] = useState(() =>
    sortByWeekday(doctor?.availability || []).map((s, i) => ({
      ...s,
      _key: `${doctor?._id || doctor?.id}_${i}_${Date.now()}`,
    }))
  );

  const [formData, setFormData] = useState({
    day: 'Monday',
    start: '09:00 AM',
    end: '12:00 PM',
    totalSlots: 10,
    bookedSlots: 0,
  });

  if (!isOpen || !doctor) return null;

  const handleAddSession = (e) => {
    e.preventDefault();
    const newSession = {
      ...formData,
      totalSlots: Number(formData.totalSlots) || 1,
      bookedSlots: Number(formData.bookedSlots) || 0,
      _key: `${doctor._id || doctor.id}_${sessions.length}_${Date.now()}`,
    };

    setSessions((prev) => sortByWeekday([...prev, newSession]));
  };

  const handleRemoveSession = (key) => {
    setSessions((prev) => prev.filter((s) => s._key !== key));
  };

  const handleSave = () => {
    const clean = sessions.map(({ _key, ...rest }) => rest);
    onSave(doctor._id || doctor.id, clean);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">Manage Slots: {doctor.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Add Session Form */}
          <form onSubmit={handleAddSession} className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700">Add New Session</h3>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Day</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full border rounded p-2 text-sm"
              >
                {WEEKDAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                <input
                  type="text"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full border rounded p-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Time</label>
                <input
                  type="text"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  placeholder="12:00 PM"
                  className="w-full border rounded p-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Total Slots</label>
              <input
                type="number"
                min="1"
                value={formData.totalSlots}
                onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                className="w-full border rounded p-2 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            >
              Add Session
            </button>
          </form>

          {/* Active Sessions List */}
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Configured Sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No sessions added yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session._key}
                  className="p-3 border rounded-lg flex items-center justify-between bg-white shadow-sm"
                >
                  <div>
                    <span className="font-semibold text-sm">{session.day}</span>
                    <p className="text-xs text-gray-600">
                      {session.start} - {session.end}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      Slots: {session.bookedSlots || 0} / {session.totalSlots}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSession(session._key)}
                    className="text-red-500 text-xs hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t pt-4 mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          >
            Save All Sessions
          </button>
        </div>
      </div>
    </div>
  );
}
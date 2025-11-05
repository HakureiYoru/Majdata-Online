import React, { useState, useEffect } from 'react';
import { getAllEvents } from '../utils/eventsData';

const Timeline = ({ selectedDate, onDateSelect }) => {
  const [events, setEvents] = useState([]);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  // 加载所有事件
  useEffect(() => {
    const allEvents = getAllEvents();
    setEvents(allEvents);

    // 计算最小和最大日期
    if (allEvents.length > 0) {
      const dates = allEvents.map(event => new Date(event.createDate));
      setMinDate(new Date(Math.min(...dates)));
      setMaxDate(new Date(Math.max(...dates)));
    }
  }, []);

  // 处理日期变化
  const handleDateChange = (e) => {
    onDateSelect(new Date(e.target.value));
  };

  return (
    <div className="timeline-container">
      <h2>时间轴</h2>
      <input
        type="range"
        min={minDate ? minDate.getTime() : 0}
        max={maxDate ? maxDate.getTime() : 0}
        value={selectedDate ? selectedDate.getTime() : 0}
        onChange={handleDateChange}
        style={{ width: '100%' }}
      />
      <div className="date-display">
        {selectedDate ? selectedDate.toLocaleDateString() : '选择日期'}
      </div>
    </div>
  );
};

export default Timeline;
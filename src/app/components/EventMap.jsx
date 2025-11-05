import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAllEvents } from '../utils/eventsData';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 设置Mapbox访问令牌
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const EventMap = ({ selectedDate, onEventSelect }) => {
  const [map, setMap] = useState(null);
  const [events, setEvents] = useState([]);
  const [markers, setMarkers] = useState([]);

  // 加载所有事件
  useEffect(() => {
    const allEvents = getAllEvents();
    setEvents(allEvents);
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!map) return;

    // 清除所有标记
    markers.forEach(marker => marker.remove());

    // 过滤事件：仅显示有位置信息的事件
    const filteredEvents = events.filter(event => {
      if (!event.location) return false;
      if (!selectedDate) return true;
      const eventDate = new Date(event.createDate);
      return eventDate.toDateString() === selectedDate.toDateString();
    });

    // 添加标记
    const newMarkers = filteredEvents.map(event => {
      // 创建弹出窗口
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true
      })
      .setHTML(`
        <div class="event-popup">
          <h3>${event.title}</h3>
          <p class="event-category">${event.category}</p>
          <p class="event-date">
            开始时间: ${dayjs(event.createDate).tz(event.timezone || 'Asia/Shanghai').format('YYYY-MM-DD HH:mm')}
          </p>
          <p class="event-date">
            结束时间: ${dayjs(event.endDate).tz(event.timezone || 'Asia/Shanghai').format('YYYY-MM-DD HH:mm')}
          </p>
          <p class="event-timezone">时区: ${event.timezone || 'Asia/Shanghai'}</p>
          <a href="${event.href}" target="_blank" rel="noopener noreferrer">查看详情</a>
        </div>
      `);

      const marker = new mapboxgl.Marker()
        .setLngLat(getCoordinates(event.location))
        .setPopup(popup)
        .addTo(map);

      // 添加点击事件
      marker.getElement().addEventListener('click', () => {
        onEventSelect(event);
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, events, selectedDate, onEventSelect]);

  // 获取城市坐标
  const getCoordinates = (city) => {
    // 这里需要根据城市名称获取坐标
    // 可以使用Mapbox Geocoding API或其他地理编码服务
    // 以下是一些示例坐标
    const coordinates = {
      '北京': [116.4074, 39.9042],
      '上海': [121.4737, 31.2304],
      '广州': [113.2644, 23.1291],
      '深圳': [114.0579, 22.5431],
      // 可以添加更多城市
    };

    return coordinates[city] || [0, 0];
  };

  return (
    <div
      ref={el => {
        if (el && !map) {
          const newMap = new mapboxgl.Map({
            container: el,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [116.4074, 39.9042], // 默认中心北京
            zoom: 3
          });

          setMap(newMap);
        }
      }}
      style={{ width: '100%', height: '500px' }}
    />
  );
};

export default EventMap;
import { useEffect, useState } from "react";
import { DAY_MS } from "@/constants/time";
import { getTimes } from "@/utils/astronomy/solarLunar";

const isValidDate = (value: Date | null): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

const getSunsetForDate = (
  date: Date,
  latitude: number,
  longitude: number,
): Date | null => {
  const sunTimes = getTimes(date, latitude, longitude);
  const sunset = sunTimes.sunset;
  return sunset instanceof Date && isValidDate(sunset) ? sunset : null;
};

const findNextSunset = (
  reference: Date,
  latitude: number,
  longitude: number,
): Date | null => {
  const todaySunset = getSunsetForDate(reference, latitude, longitude);
  if (todaySunset && todaySunset.getTime() > reference.getTime()) {
    return todaySunset;
  }

  const tomorrow = new Date(reference.getTime() + DAY_MS);
  return getSunsetForDate(tomorrow, latitude, longitude);
};

export const useSunsetCalculations = (
  initialSunsetIso: string,
  latitude: number,
  longitude: number,
  now: Date,
) => {
  const parseSunsetIso = (value: string): Date | null => {
    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed : null;
  };

  const [sunsetTime, setSunsetTime] = useState<Date | null>(() =>
    parseSunsetIso(initialSunsetIso),
  );

  useEffect(() => {
    setSunsetTime(parseSunsetIso(initialSunsetIso));
  }, [initialSunsetIso]);

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    if (sunsetTime && sunsetTime.getTime() > now.getTime()) {
      return;
    }

    const upcomingSunset = findNextSunset(now, latitude, longitude);
    if (
      upcomingSunset &&
      (!sunsetTime || upcomingSunset.getTime() !== sunsetTime.getTime())
    ) {
      setSunsetTime(upcomingSunset);
    }
  }, [latitude, longitude, now, sunsetTime]);

  return sunsetTime;
};

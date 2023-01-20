import { useState, useEffect } from 'react';
import { Textarea, NativeSelect } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import {
  IconClock,
  IconTemperature,
  IconCloud,
  IconWind,
  IconCompass
} from '@tabler/icons';
import SpeciesInput from './SpeciesInput';
import './stationForm.css';

const StationForm = ({ stationNum, surveyData, setSurveyData, pastSurveySpecies, dbStationTimeBegan }) => {

  const [surveyTime, setSurveyTime] = useState(null);
  const [temperature, setTemperature] = useState('');
  const [sky, setSky] = useState(' ');
  const [windSpeed, setWindSpeed] = useState(' ');
  const [windDirection, setWindDirection] = useState('');

  useEffect(() => {
    // check if survey time values have been fetched from the database, otherwise default time to midnight.
    if (dbStationTimeBegan.length) { // if loading surveyTime from a past survey (from the database)
      setSurveyTime(dbStationTimeBegan[stationNum - 1]);
    } else if (!surveyTime) { // else if no surveyTime value given, default time to midnight (only applies to brand new surveys)
      setSurveyTime(new Date().setHours(0, 0, 0, 0))
    }

    setTemperature(surveyData.stationData[stationNum - 1] ? surveyData.stationData[stationNum - 1].Temperature : '')
    setSky(surveyData.stationData[stationNum - 1] ? surveyData.stationData[stationNum - 1].Sky : null)
    setWindSpeed(surveyData.stationData[stationNum - 1] ? surveyData.stationData[stationNum - 1].WindSpeed : '')
    setWindDirection(surveyData.stationData[stationNum - 1] ? surveyData.stationData[stationNum - 1].WindDirection : '')
  }, [surveyData, dbStationTimeBegan]);

  const handleTime = (e) => {
    setSurveyTime(e);

    const copy = surveyData;
    const toIso = new Date(e).toISOString();

    // toTimeString converts ISO string ('2022-11-21T08:10:45.000Z') to this --> 08:10:00
    const toTimeString = new Date(toIso).toTimeString().split(' ')[0].slice(0, 5) + ':00';

    copy.stationData[stationNum - 1].SurveyTime = toTimeString;
    setSurveyData(copy);
  }

  // only allows numbers to be input as temperature values
  const handleTemperature = (e) => {
    const value = e.target.value;
    const re = /^[0-9\b]+$/;

    if (value === '' || re.test(value)) {
      setTemperature(value);

      const copy = surveyData;
      copy.stationData[stationNum - 1].Temperature = value;
      setSurveyData(copy);
    }
  }

  const handleSky = (e) => {
    const value = e.target.value;
    setSky(value);

    const copy = surveyData;
    copy.stationData[stationNum - 1].Sky = value;
    setSurveyData(copy);
  }

  const handleWindSpeed = (e) => {
    const value = e.target.value;
    setWindSpeed(value);

    const copy = surveyData;
    copy.stationData[stationNum - 1].WindSpeed = value;
    setSurveyData(copy);
  }

  const handleWindDirection = (e) => {
    const value = e.target.value;
    setWindDirection(value);

    const copy = surveyData;
    copy.stationData[stationNum - 1].WindDirection = value;
    setSurveyData(copy);
  }

  return (
    <div>
      <div className='stationForm'>
        <TimeInput
          label="Time Began"
          placeholder="Point Count Began"
          value={new Date(surveyTime)}
          format='12'
          icon={<IconClock size={16} />}
          onChange={(e) => handleTime(e)}
        />
        <Textarea
          label="Temperature"
          placeholder="Degrees Fahrenheit"
          value={temperature}
          icon={<IconTemperature size={16} />}
          onChange={handleTemperature}
          autosize
          maxRows={1}
        />
        <NativeSelect
          label='Cloud Cover'
          data={[' ','Clear', 'Mostly Sunny', 'Partly Cloudy', 'Mostly Cloudy', 'Overcast']}
          placeholder=" "
          value={sky ? sky : ' '}
          icon={<IconCloud
            size={16}
          />}
          onChange={handleSky}
        />
        <NativeSelect
          data={[' ','Calm', '0 - 5 mph', '5 - 10 mph', '10 - 15 mph', '15 - 20 mph', ' 20+ mph']}
          placeholder=" "
          value={windSpeed}
          label="Wind Speed"
          icon={<IconWind
            size={16}
          />}
          onChange={handleWindSpeed}
        />
        <NativeSelect
          data={[' ','SE', 'S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'N/A']}
          placeholder=" "
          value={windDirection}
          label="Wind Direction"
          icon={<IconCompass
            size={16}
          />}
          onChange={handleWindDirection}
        />
        <br />
        <SpeciesInput
          stationNum={stationNum}
          surveyData={surveyData}
          setSurveyData={setSurveyData}
          pastSurveySpecies={pastSurveySpecies} />
      </div>
    </div>
  )
}

export default StationForm
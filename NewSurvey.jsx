import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientContext } from '../clientContext';
import { TextInput, Indicator, Loader } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconUser, IconCalendar, IconUsers } from '@tabler/icons';
import StationToggle from './StationToggle';
import { fetchUrl } from '../../fetchUrl';
import './newSurvey.css';

function NewSurvey() {

  // date formating for Mantine DatePicker UI component
  const day = new Date().getDate()
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear()
  const dateForDatePicker = `${year}-${month}-${day}`;

  const { client } = useContext(ClientContext);
  const [pastSurveyId, setPastSurveyId] = useState(null);
  const [newSurveyId, setNewSurveyId] = useState(null);
  const [stations, setStations] = useState([]);
  const [surveyData, setSurveyData] = useState({
    "clientId": client.ClientId,
    "propertyId": client.PropertyId,
    "property": client.PropertyName,
    "client": client.Name[0],
    "county": client.Name[1],
    "acreage": client.Acreage,
    "birder": '',
    "surveyDate": new Date(`${new Date(`${dateForDatePicker}`).toISOString()}`.slice(0, -8)),
    "observers": null,
    "stationData": []
  });
  const [birder, setBirder] = useState('');
  const [observers, setObservers] = useState('');
  const [surveyDate, setSurveyDate] = useState(`${dateForDatePicker}`);
  const [speciesFromPreviousSurveyFromDatabase, setSpeciesFromPreviousSurveyFromDatabase] = useState([])
  const [pastSurveySpecies, setPastSurveySpecies] = useState([]);
  const [dbStationTimeBegan, setDbStationTimeBegan] = useState([]);
  const [submittingData, setSubmittingData] = useState(false);
  const navigate = useNavigate();
  const surveyId = pastSurveyId ? pastSurveyId : newSurveyId;

  // populate all survey components with backend data depending on if brand new survey or editing a past survey
  useEffect(() => {
    const editingPastSurvey = localStorage.getItem('editingPastSurvey'); // either true or does not exist

    fetch(`${fetchUrl}/stations`, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        PropertyId: client.PropertyId,
      })
    })
      .then(res => res.json())
      .then(data => {
        setStations(data);

        // create an array to hold data for individual stations
        const stationDataArray = [];
        for (let i = 0; i < data.length; i++) {
          // create a new object to hold values for each station (time began, temperature, bird species...)
          stationDataArray.push({
            StationId: data[i].StationId,
            SurveyTime: new Date(),
            Temperature: '',
            Sky: '',
            WindSpeed: '',
            WindDirection: ''
          });
          // make sure each station has a Species property
          stationDataArray[i].Species = [];
        }
        const copySurveyData = surveyData;
        surveyData.stationData = stationDataArray;
        setSurveyData(copySurveyData);
      });

    if (editingPastSurvey) {
      const storedSurveyId = localStorage.getItem('pastSurveyId');
      setPastSurveyId(storedSurveyId);
      localStorage.setItem('editingPastSurvey', false)

      // if (pastSurveyId) { // if retrieving data from a past survey
      setNewSurveyId(null);
      fetch(`${fetchUrl}/gatherReportData`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          surveyId: pastSurveyId
        })
      })
        .then(res => res.json())
        .then(data => {
          setSpeciesFromPreviousSurveyFromDatabase(data.birdsInfo[0]);
          setSurveyData({
            "clientId": client.ClientId,
            "propertyId": client.PropertyId,
            "property": data.surveyInfo[0][0].PropertyName,
            "client": data.surveyInfo[0][0].Name[0],
            "county": data.surveyInfo[0][0].Name[1],
            "acreage": data.surveyInfo[0][0].Acreage,
            "birder": data.surveyInfo[0][0].Birder,
            "surveyDate": new Date(data.stationsInfo[0][0].SurveyDate),
            "dateCreated": new Date(),
            "observers": data.surveyInfo[0][0].Observers,
            "transport": 'value not provided',
            "generatedId": 0,
            "stationData": data.stationsInfo[0]
          });
          setBirder(data.surveyInfo[0][0].Birder)

          setSurveyDate(new Date(data.stationsInfo[0][0].SurveyDate).toLocaleString('en-US', { timeZone: 'Atlantic/Canary' }))

          // the following is a work-around for Mantine's TimeInput component, which does not convert date objects to local time/time zone correctly when passed a date object. This code preemptively adjusts the times so they actually display correctly to the user in the DOM.
          // dbStationTimeBegan is passed down to StationForm.jsx where its values are actually consumed.
          const arrayOfDbStationTimes = [];
          for (let i = 0; i < data.stationsInfo[0].length; i++) {
            const surveyTime = new Date(data.stationsInfo[0][i].SurveyTime).toLocaleString('en-US', { timeZone: 'Atlantic/Canary' })
            arrayOfDbStationTimes.push(surveyTime)
          }
          setDbStationTimeBegan(arrayOfDbStationTimes);
        })
    } else { // else if beginning a new survey

      fetch(`${fetchUrl}/generateNewReportId`)
        .then(res => res.json())
        .then(data => setNewSurveyId(data))
    };
  }, [pastSurveyId])

  // if editing a past survey, format all species observations into an array of objects
  useEffect(() => {
    if (speciesFromPreviousSurveyFromDatabase.length) { // if species exist from a previous survey
      const birdSpeciesByStation = []; // array to hold all individual stations

      surveyData.stationData.map((station) => { // at each survey station
        const stationSpeciesArray = []; // array to hold all individual species observations for that specific station
        for (let i = 0; i < speciesFromPreviousSurveyFromDatabase.length; i++) { // at each observation, check StationId
          if (speciesFromPreviousSurveyFromDatabase[i].StationId == station.StationId) {

            stationSpeciesArray.push(speciesFromPreviousSurveyFromDatabase[i])
          }
        }
        birdSpeciesByStation.push(stationSpeciesArray);
      })
      setPastSurveySpecies(birdSpeciesByStation);
    }
  }, [speciesFromPreviousSurveyFromDatabase]);

  const handleBirder = (e) => {
    const name = e.target.value;
    setBirder(name);

    const copy = surveyData;
    copy.birder = name;
    setSurveyData(copy);
  };

  const handleDate = (e) => {
    if (e) {
      const month = e.toLocaleString('default', { month: 'long' });
      const day = e.getDate();
      const year = e.getFullYear();
      const fullDate = `${month} ${day}, ${year}`;

      const dataCopy = surveyData;
      dataCopy.surveyDate = fullDate;
      setSurveyData(dataCopy);

      setSurveyDate(fullDate);
    }
  };

  const handleObservers = (e) => {
    const name = e.target.value;
    setObservers(name);

    const copy = surveyData;
    copy.observers = name;
    setSurveyData(copy);
  };

  const checkDataBeforeSubmission = () => {
    // false indicates not ready for submission
    // true indicates all data fields are complete, ready for submission

    // check Biologist's Name field
    if (birder.length === 0) {
      alert(`Incomplete Data: Check 'Biologist's Name' field`)
      return false
    }

    // check values within each station
    for (let i = 0; i < surveyData.stationData.length; i++) {
      if (surveyData.stationData[i].Temperature === "") {
        alert(`Incomplete Data: Check Station ${i+1} Temperature`)
        return false
      }
      if (surveyData.stationData[i].Sky === "") {
        alert(`Incomplete Data: Check Station ${i+1} Cloud Cover`)
        return false
      }
      if (surveyData.stationData[i].WindSpeed === "") {
        alert(`Incomplete Data: Check Station ${i+1} Wind Speed`)
        return false
      }
      if (surveyData.stationData[i].WindDirection === "") {
        alert(`Incomplete Data: Check Station ${i+1} Wind Direction`)
        return false
      }
    }
    return true
  }

  const submitData = () => {
    if (checkDataBeforeSubmission()) {
      setSubmittingData(true)

      fetch(`${fetchUrl}/submitBirdSurvey`, {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pastSurveyId: pastSurveyId, // pastSurveyId either null or a number
          surveyData: surveyData
        })
      })
        .then(
          setTimeout(function () {
            navigate("/past-surveys");
          }, 1000)
        )
    }
  }

  // this if statement forces components to wait to load until data is fetched from the server and ready to be loaded/displayed
  if (pastSurveyId === null || pastSurveyId && pastSurveySpecies.length) {
    return (
      <div className='clientName'>
        <h1>New Survey</h1>
        <h2>{client ? client.Name[0] : ''}</h2>
        <div className='nameDateInput'>
          <div className='biologistName'>
            <TextInput
              placeholder="Biologist's Name"
              value={surveyData.birder ? surveyData.birder : birder}
              icon={<IconUser size={20} />}
              onChange={(e) => handleBirder(e)}
              autosize
            />
          </div>
          <div className="dateAndObservers">

            <div className="datePicker">
              <DatePicker
                placeholder="Select Date"
                value={new Date(`${new Date(surveyDate).toISOString()}`.slice(0, -8))}
                icon={<IconCalendar size={18} />}
                firstDayOfWeek="sunday"
                onChange={(e) => handleDate(e)}
                renderDay={(date) => {
                  const d = new Date();
                  const day = date.getDate();
                  const currentDateOfMonth = d.getDate();
                  const month = date.getMonth();
                  const currentMonthNum = d.getMonth();
                  return (
                    <Indicator size={6}
                      color="green"
                      offset={8}
                      disabled={day != currentDateOfMonth || month != currentMonthNum}
                    >
                      <div>{day}</div>
                    </Indicator>
                  );
                }}
              />
            </div>
            <div className="observers">
              <TextInput
                placeholder="Observers"
                value={surveyData.observers ? surveyData.observers : observers}
                icon={<IconUsers size={20} />}
                onChange={(e) => handleObservers(e)}
                autosize
              />
            </div>
          </div>
        </div>
        <StationToggle
          stations={stations}
          surveyData={surveyData}
          pastSurveySpecies={pastSurveySpecies}
          setSurveyData={setSurveyData}
          pastSurveyId={pastSurveyId}
          setPastSurveyId={setPastSurveyId}
          dbStationTimeBegan={dbStationTimeBegan}
        />
        <button
          className='generateReportButton'
          onClick={() => submitData()}>
          {submittingData ? <Loader size='sm' color='white' /> : 'Submit Report'}
        </button>
        {/* <button onClick={() => console.log('survey data: ', surveyData, 'pastSurveyId: ', pastSurveyId, 'newSurveyId: ', newSurveyId)}>log survey data</button> */}
      </div>
    )
  } else return (
    <Loader
      size='lg'
      color='#2d862f'
      id='editSurveyLoader' />
  )
}

export default NewSurvey;
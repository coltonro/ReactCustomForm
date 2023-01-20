import ToggleButton from './ToggleButton';
import './stationToggle.css';

// this component returns the correct number of buttons to toggle/show an input form for each survey station

function StationToggle({ stations, surveyData, setSurveyData, surveyId, setSurveyId, pastSurveySpecies, setBirdSpeciesList, setNewlyGeneratedSurveyId, dbStationTimeBegan }) {

  const produceStationToggles = stations.map((station, i) => {
      return (
        <ToggleButton
          num={i + 1}
          key={`toggleButton-${i}`}
          surveyData={surveyData}
          setSurveyData={setSurveyData}
          surveyId={surveyId}
          pastSurveySpecies={pastSurveySpecies}
          setSurveyId={setSurveyId}
          setBirdSpeciesList={setBirdSpeciesList}
          setNewlyGeneratedSurveyId={setNewlyGeneratedSurveyId}
          dbStationTimeBegan={dbStationTimeBegan}
        />
      )
    })

  return (
    <div className='surveyStationToggle'>
      {produceStationToggles}
    </div>
  );
}


export default StationToggle
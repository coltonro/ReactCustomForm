import { useEffect, useState } from 'react'
import { Textarea } from '@mantine/core';
import { IconPlus } from '@tabler/icons';
import './speciesInput.css';

const IndividualSpecies = ({ bird, i, stationNum, removeSpecies, species, setSpecies, surveyData, setSurveyData }) => {
  const [speciesCount, setSpeciesCount] = useState(species[i].Number)

  const allowedCharacters = [
    '',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    null // null allows the backspace key to be included
  ];

  const speciesNumberHandler = (e, i) => {

    // validate that input is an allowed character (a number)
    if (allowedCharacters.includes(e.nativeEvent.data)) {

      // update value to be shown on frontend
      const speciesCopy = species;
      const input = e.target.value;
      setSpeciesCount(input)
      
      // parse user's input to an integer, or default to 0
      const value = (typeof input === 'string') ? parseInt(input) || 0 : value;
      speciesCopy[i].Number = value
      setSpecies(speciesCopy);

      // update the surveyData object (to be submitted to the database)
      const surveyDatacopy = surveyData;
      surveyDatacopy.stationData[stationNum - 1].Species = species;
      setSurveyData(surveyDatacopy);
    }
  }

  const increaseCountByOne = (i) => {
    
    const speciesCopy = species;
    speciesCopy[i].Number = speciesCopy[i].Number + 1;
    setSpecies(speciesCopy);

    const increasedCount = speciesCopy[i].Number
    setSpeciesCount(increasedCount)

    const surveyDatacopy = surveyData;
    surveyDatacopy.stationData[stationNum - 1].Species = species;
    setSurveyData(surveyDatacopy);
  }

  return (
    <li className='printedSpeciesList' key={i}>
      <div className='commonName' style={{ color: 'grey'}}>
        <div>{bird.CommonName}</div>
      </div>
      <div>
        <div style={{ width: '50px'}}>{bird.Code}</div>
      </div>
      <Textarea
        className='speciesCount'
        id='speciesCountText'
        value={species[i].Number}
        onChange={e => speciesNumberHandler(e, i, bird)}
        autosize="true"
        maxRows={1}
      />
      <button className='incrementCount' onClick={() => increaseCountByOne(i)}>{<IconPlus size={20} stroke={1.5} />}</button>
      <button className='removeSpecies' onClick={() => removeSpecies(i)}>x</button>
    </li>
  )
}

export default IndividualSpecies
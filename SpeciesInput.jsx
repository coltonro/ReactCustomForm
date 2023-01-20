import { useState, useEffect, forwardRef } from 'react';
import { Autocomplete, Group, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import { fullSpeciesList } from '../../fullSpeciesList';
import IndividualSpecies from './IndividualSpecies';
import './speciesInput.css';

const SpeciesInput = ({ stationNum, surveyData, setSurveyData, pastSurveySpecies }) => {
  const [searchText, setSearchText] = useState('');
  const [species, setSpecies] = useState([]);

  useEffect(() => {
    // if observations exist from a previous/past survey
    if (surveyData.stationData[stationNum - 1]) {
      setSpecies(pastSurveySpecies[stationNum - 1]);

      const copySurveyData = surveyData;
      copySurveyData.stationData[stationNum - 1].Species = pastSurveySpecies[stationNum - 1];
      setSurveyData(copySurveyData);
    }
  }, [pastSurveySpecies]);

  const makeSpeciesList = (input) => {
    if (input.length >= 4) { // prevent searchText from being reset if banding code is incomplete (less than 4 characters)
      const upperCaseBandingCode = input.toUpperCase();
      const newBirdObject = {
        BirdId: null,
        CommonName: '',
        Code: '',
        Number: null
      }

      // if inputted bird species exists, create a new object and add it to that station's species array
      const checkIfCodeExists = (fullSpeciesList, upperCaseBandingCode) => {
        for (let i = 0; i < fullSpeciesList.length; i++) {
          if (fullSpeciesList[i].Code === upperCaseBandingCode) {
            newBirdObject.BirdId = fullSpeciesList[i].BirdId
            newBirdObject.CommonName = fullSpeciesList[i].CommonName
            newBirdObject.Code = fullSpeciesList[i].Code
            newBirdObject.Number = 1
            newBirdObject.StationId = surveyData.stationData[stationNum - 1].StationId
            newBirdObject.FederalStatus = fullSpeciesList[i].FederalStatus
            return true
          }
        }
        return false;
      }

      if (checkIfCodeExists(fullSpeciesList, upperCaseBandingCode)) {
        // check if species has already been entered / prevent duplicates
        if (!species.some(speciesObject => speciesObject.Code === upperCaseBandingCode)) {
          setSpecies(species.length ? [...species, newBirdObject] : [newBirdObject]);

          const surveyDatacopy = surveyData;
          surveyDatacopy.stationData[stationNum - 1].Species = species.length ? [...species, newBirdObject] : [newBirdObject];
          setSurveyData({...surveyDatacopy});
        } else { alert('Species is already entered!') }
      }

      setSearchText('');
    }
  }

  const removeSpecies = (i) => {
    // remove element at i from species array
    const copySpecies = species;
    copySpecies.splice(i, 1);
    setSpecies([...copySpecies]);
    console.log('speices: ', copySpecies)
    // update the surveyData object (to be submitted to the database)
    const surveyDatacopy = surveyData;
    surveyDatacopy.stationData[stationNum - 1].Species = species;
    setSurveyData(surveyDatacopy);
  }

  const printedSpeciesList = species.map((bird, i) => {
    return (
      <div>
        <IndividualSpecies
          bird={bird}
          i={i}
          stationNum={stationNum}
          removeSpecies={removeSpecies}
          species={species}
          setSpecies={setSpecies}
          surveyData={surveyData}
          setSurveyData={setSurveyData} />
      </div>
    )
  })

  const pressHandler = (key, value) => {
    if (key === 'Enter') {
      makeSpeciesList(value);
    }
  }

  const SelectItem = forwardRef(
    ({ CommonName, Code, ...others }, ref) => (
      <div ref={ref} {...others}>
        <Group noWrap>
          <Text size="sm">{CommonName}</Text>
          <Text size="xs" color="dimmed">
            {Code}
          </Text>
        </Group>
      </div>
    )
  );

  return (
    <>
      <Autocomplete
        itemComponent={SelectItem}
        icon={<IconSearch size={20} stroke={1.5} />}
        label="Species Observed"
        placeholder="Enter Banding Code"
        limit={5}
        value={searchText}
        data={(typeof searchText === 'string' && searchText.length >= 2) ? fullSpeciesList : []}
        onChange={setSearchText}
        onItemSubmit={(e) => { makeSpeciesList(e.Code) }}
        onKeyPress={(e) => pressHandler(e.key, e.target.value)}
        nothingFound={(typeof searchText === 'string' && searchText.length >= 2) ? "Species not found" : ''}
        filter={(value, item) =>
          item.Code && item.CommonName ?
            item.CommonName.toLowerCase().includes(value.toLowerCase().trim()) ||
            item.Code.includes(value.toUpperCase().trim())
            : false
        }
      />
      <ul>
        {printedSpeciesList}
      </ul>
    </>
  )
}

export default SpeciesInput
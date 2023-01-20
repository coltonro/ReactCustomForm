import { useState } from 'react';
import { Button, Collapse } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons';
import StationForm from './StationForm';
import './stationToggle.css';

const ToggleButton = ({ num, surveyData, setSurveyData, pastSurveySpecies, dbStationTimeBegan }) => {
    const [opened, setOpened] = useState(false);

    return (
        // interactive toggle/dropdown button to open form
        <div>
            <Button
                className='toggleButton'
                onClick={() => setOpened((o) => !o)}
                key={num} >
                <div className='buttonText'>
                    {`Station ${num}`}
                    {opened === false ? <IconChevronDown size={14} /> : ''}
                </div>
            </Button>

        {/* child component that contains the form input fields */}
            <Collapse in={opened} >
                {<StationForm
                    stationNum={num}
                    surveyData={surveyData}
                    pastSurveySpecies={pastSurveySpecies}
                    setSurveyData={setSurveyData}
                    dbStationTimeBegan={dbStationTimeBegan}
                />}
            </Collapse>
        </div>
    )
}

export default ToggleButton
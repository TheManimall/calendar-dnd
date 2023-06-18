import React from 'react'
import styled from 'styled-components'

import { dayNames } from '../helpers'

const DayRange = () => (
  <DayRangeContainer>
    {dayNames.map((el, index) => <DayLabel key={index}>{el}</DayLabel>)}
  </DayRangeContainer>
)

const DayRangeContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, calc(100%/7));
  position: relative;
  top: 62px;
`

const DayLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  width: 100%;
`
export default DayRange
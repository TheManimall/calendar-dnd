import React, { Fragment, useEffect, useState } from 'react';
import moment from 'moment';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import axios from 'axios';

import Calendar from './components/Calendar';

type CalendarType = {
  dayName: string,
  date: string,
  day: string
}[] | []

const App = (): JSX.Element => {
  const [days, setDays] = useState<CalendarType>([])
  const [today, setToday] = useState<string>('')
  const [holidays, setHolidays] = useState<any>({})

  useEffect(() => {
    const startOfMonth = moment().startOf('month')
    const startOfFirstWeek = moment(startOfMonth).startOf('week')
    const endOfMonth = moment().endOf('month')
    const endOfLastWeek = moment(endOfMonth).endOf('week')

    const days = []
    let day = startOfFirstWeek

    while (day <= endOfLastWeek) {
      days.push({ dayName: day.format('ddd'), date: day.format('YYYY-MM-DD'), day: day.format('DD') })
      day = day.clone().add(1, 'd')
    }

    axios({
      method: 'get',
      url: 'https://date.nager.at/api/v3/PublicHolidays/2023/UA',
    }).then((res: any) => {
      const holiday = res.data.reduce(
        (acc: {}, item: { date: string, name: string }) => ({
          ...acc,
          [item.date]: item.name
      }), {})
      setHolidays(holiday)
    })

    setDays(days)
    setToday(moment().format('YYYY-MM-DD'))
  }, [])

  return !!days.length ? 
    (<DndProvider backend={HTML5Backend}>
        <Calendar days={days} today={today} holidays={holidays} />
      </DndProvider>) : 
    <Fragment />;
}

export default App;

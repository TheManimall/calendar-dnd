import React, { 
  useEffect, useState, useCallback, useRef, FormEvent, MouseEvent 
} from 'react'
import styled from 'styled-components'

import Day from './Day'
import DayRange from './DayRange'
import Control from './Control'

import { TaskState, LabelRecord, TaskType } from '../types'

type CalendarProps = {
  days: {
    dayName: string,
    date: string,
    day: string
  }[],
  today: string,
  holidays: any
}

const Calendar = ({ days, today, holidays }: CalendarProps): JSX.Element => {
  const [tasks, setTasks] = useState<TaskState>({})
  const [idTask, setIdTask] = useState<number>(0)
  const [emptyTasks, setEmptyTasks] = useState<TaskState>({})
  const [filterByText, setFilterByText] = useState<string>('')
  const [filterTasks, setFilterTasks] = useState<TaskState>({})
  const [labelId, setLabelId] = useState<number>(0)
  const [labels, setLabels] = useState<LabelRecord>([])

  const isSearching: any = useRef()
  const screenshotRef: any = useRef(null)

  // Init tasks
  useEffect(() => {
    const taskObj = days!.reduce<{}>((acc, el) => ({
      ...acc,
      [el.date]: {}
    }), {})

    setTasks(taskObj)
    setEmptyTasks(taskObj)
    isSearching.current = false
  }, [])

  // Handle creating empty task by day
  const handleClickDay = useCallback((e: any) => {
    const { target: { id }} = e
    
    if (isSearching.current) return

    setTasks(prevState => ({ 
      ...prevState,
      [id]: {
        ...prevState[id],
        [idTask]: {
          id: idTask,
          text: '',
          isEditable: true,
        }
      }
    }))

    setIdTask(prevState => prevState + 1)
  }, [idTask])
  
  // Handle set text to task && handle edit task
  const handleAddTask = useCallback(
    (id: number, dayId: string, text: string, isEditable: boolean = false) => {
      if (isSearching.current) return

      setTasks((prevState: any) => ({
        ...prevState,
        [dayId]: {
          ...prevState[dayId],
          [id]: {
            id: id,
            text: text,
            isEditable: isEditable,
            order: Object.keys(prevState[dayId]).length - 1,
            labels: [...(prevState[dayId][id].labels || [])]
          }
        }
      }))
  }, [])

  // Handle drag & drop functionality by day
  const handleDropTaskByDay = useCallback(
    (dayId: string, taskId: number, dropDayId: string) => {
      if (isSearching.current) {
        return
      } else {
        setTasks((prevState: any) => {
          const copyTask = { 
            ...prevState[dayId][taskId], 
            order: Object.keys(prevState[dropDayId]).length
          }
          delete prevState[dayId][taskId]
  
          return {
            ...prevState,
            [dropDayId]: {
              ...prevState[dropDayId],
              [taskId]: {
                ...copyTask,
              }
            }
          }
        })
      }
  }, [filterByText])

  // Handle reorder tasks functionality using drag & drop 
  const handleReorderTask = useCallback(
    (dragIndex: number, hoverIndex: number, dragId: number, hoverId: number, dayId: string) => {
      if (dragIndex === undefined || isSearching.current) return

      setTasks((prevState: any) => ({
        ...prevState,
        [dayId]: {
          ...prevState[dayId],
          [dragId]: {
            ...prevState[dayId][dragId],
            order: hoverIndex
          },
          [hoverId]: {
            ...prevState[dayId][hoverId],
            order: dragIndex
          } 
        }
      }))
  }, [])

  // Handle filter functionality by text
  const handleFilterByText = useCallback((e: any) => {
    const { target: { value }} = e
    setFilterByText(value)

    if (!value) {
      isSearching.current = false
      return
    }

    setFilterTasks(emptyTasks)

    Object.entries(tasks).forEach(([key, task]) => {
        const taskArr: TaskType[] = Object.values(task)

        for (let i: number = 0; i < taskArr.length; i+=1) {
          if (taskArr[i].text.toLowerCase().search(value.toLowerCase()) === 0) {
            setFilterTasks((prevState: any) => ({
              ...prevState,
              [key]: {
                ...prevState[key],
                // @ts-ignore
                [taskArr[i].id]: {...tasks[key][taskArr[i].id]}
              }
            }))
          }
        }
    })

    isSearching.current = true
  }, [tasks, emptyTasks])

  // Handle creating labels by task && creating filter view for labels
  const handleCreateLabel = useCallback(
    (dayId: string, taskId: number, labelId: number, color: string, text: string, isCreate: boolean = true) => {
      if (isCreate) {
        setLabels(prevState => ([
          ...prevState,
          {
            id: labelId,
            color: color,
            text: text,
          }
        ]))
    
        setTasks((prevState: any) => ({
          ...prevState,
          [dayId]: {
            ...prevState[dayId],
            [taskId]: {
              ...prevState[dayId][taskId],
              labels: [
                ...prevState[dayId][taskId]['labels'],
                { 
                  id: labelId,
                  color: color,
                  text: text,
                }
              ]
            }
          }
        }))
    
        setLabelId(prevState => prevState + 1)
      } else {
        setTasks((prevState: any) => ({
          ...prevState,
          [dayId]: {
            ...prevState[dayId],
            [taskId]: {
              ...prevState[dayId][taskId],
              labels: [
                ...prevState[dayId][taskId]['labels'],
                { 
                  id: labelId,
                  color: color,
                  text: text,
                }
              ]
            }
          }
        }))
      }
  }, [])

  // Handle filter functionality by labels
  const handleFilterByLabel = useCallback((id: number | null) => {
    setFilterTasks(emptyTasks)

    if (id === null) {
      isSearching.current = false

      return
    }

    Object.entries(tasks).forEach((arr: any) => {
      const [key, task] = arr
      const taskArr: any = Object.values(task)

      for (let i = 0; i < taskArr.length; i+=1) {
        if ((taskArr[i].labels || []).findIndex((item: { id: number }) => item.id === id) !== -1) {
          setFilterTasks((prevState: any) => ({
            ...prevState,
            [key]: {
              ...prevState[key],
              // @ts-ignore
              [taskArr[i].id]: {...tasks[key][taskArr[i].id]}
            }
          }))
        }
      }
    })

    isSearching.current = true
  }, [emptyTasks, tasks])

  return (
    <CalendarContainer>
      <Control
        labels={labels}
        search={filterByText}
        calendarData={tasks}
        screenshotRef={screenshotRef}
        labelsData={labels}
        onSetLabelData={setLabels}
        onLabelFilter={handleFilterByLabel} 
        onSearch={handleFilterByText}
        onSetFilesData={setTasks}
      />
      <div ref={screenshotRef}>
        <DayRange />
        <CalendarStyled>
          {days.map(el => (
            <Day 
              day={el.day} 
              key={el.date} 
              date={el.date}
              task={isSearching.current ?
                filterTasks[el.date] as TaskType:
                tasks[el.date] as TaskType} 
              taskArr={Object.values(tasks[el.date] || {})}
              isToday={today === el.date}
              isSearching={isSearching.current}
              labelId={labelId}
              allLabels={labels}
              holiday={holidays[el.date] || null}
              onClickDay={handleClickDay}
              onAddTask={handleAddTask}
              onDrop={handleDropTaskByDay}
              onReorder={handleReorderTask}
              onCreateLabel={handleCreateLabel}
            />
          ))}
        </CalendarStyled>
      </div>
    </CalendarContainer>
  )
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const CalendarStyled = styled.main`
  display: grid;
  grid-template-columns: repeat(7, calc(100%/7));
  grid-template-rows: repeat(5, calc((100vh - 190px) / 5));
  margin-top: 67px;
`

export default Calendar
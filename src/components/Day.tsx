import React, { Fragment } from 'react'
import styled from 'styled-components'
import clsx from 'clsx'
import { useDrop } from 'react-dnd'

import Task from './Task'

import { LabelRecord, TaskType } from '../types'

type DayProps = {
  day: string
  date: string
  task: TaskType,
  taskArr: any,
  isToday: boolean,
  isSearching: boolean,
  labelId: number,
  holiday: string | null,
  allLabels: LabelRecord,
  onClickDay: (el: any) => void,
  onAddTask: (id: number, dayId: string, text: string, isEditable?: boolean) => void
  onDrop: (dayId: string, taskId: number, dropDayId: string) => void
  onReorder: (dragIndex: number, hoverIndex: number, dragId: number, hoverId: number, dayId: string) => void
  onCreateLabel: (dayId: string, taskId: number, labelId: number, color: string, text: string) => void
}

const Day = ({
   day, date, task, taskArr, isToday, isSearching, labelId, allLabels, holiday, 
   onClickDay, onAddTask, onDrop, onReorder, onCreateLabel 
  }: DayProps): JSX.Element => {

  // Handle drop functionalty by day
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: any) => {
      // Disabled if filtering tasks or doing reorder tasks
      if (date === item!.dayId || isSearching) {
        return
      }
      onDrop(item!.dayId, item!.taskId, date)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  return (
    <DayStyled 
      id={date} 
      ref={drop} 
      className={clsx(isToday && 'today', holiday && 'holiday')}
      onClick={onClickDay}
    >
      <span className="day-number">{day}</span>
      {holiday && <span className="holiday">{holiday}</span>}
      {!!taskArr.length ? 
        Object.values(task)
        .sort((a: any ,b: any) => (a.order - b.order))
        .map((el: any) => (
          <Task
            text={el.text} 
            isEditable={el.isEditable} 
            taskId={el.id} 
            key={el.id}
            dayId={date}
            order={el.order}
            isSearching={isSearching}
            labelId={labelId}
            labelsArr={el.labels}
            allLabels={allLabels}
            onAddTask={onAddTask}
            onReorder={onReorder}
            onCreateLabel={onCreateLabel} 
          />)) : 
        (<Fragment />)}
    </DayStyled>
  )
}

const DayStyled = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 40px;
  padding-left: 15px;
  padding-right: 15px;
  font-size: 18px;
  border: 1px solid #42424280;
  border-right: none;
  border-bottom: none;
  position: relative;
  overflow-y: hidden;
  box-shadow: inset 0px 1px 19px 8px rgb(0 0 0 / 3%);
  &&:hover {
    overflow-y: overlay;
  }
  &.today {
    background-color: #00968845;
    span {
      font-size: 34px !important;
      color: #9c27b0;
    }
  }
  &.holiday {
    background-color: #def63f45;
  }
  .day-number {
    position: absolute;
    top: 5px;
    left: 15px;
    font-size: 29px;
  }
  .holiday {
    position: absolute;
    color: #673AB7;
    top: 11px;
    right: 15px;
    font-size: 21px;
  }
`

export default Day
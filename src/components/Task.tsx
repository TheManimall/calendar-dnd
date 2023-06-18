import type { Identifier, XYCoord } from 'dnd-core'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useDrag, useDrop } from 'react-dnd'

import CreateLabelModal from './CreateLabelModal'

import { LabelRecord } from '../types' 

type TaskProps = {
  text: string,
  isEditable: boolean,
  taskId: number,
  dayId: string,
  order: number,
  isSearching: boolean | null,
  labelId: number,
  labelsArr: LabelRecord,
  allLabels: LabelRecord,
  onAddTask: (id: number, dayId: string, text: string, isEditable?: boolean) => void
  onReorder: (dragIndex: number, hoverIndex: number, dragId: number, hoverId: number, dayId: string) => void
  onCreateLabel: (dayId: string, taskId: number, labelId: number, color: string, text: string) => void
}

const Task = ({ 
  text, 
  isEditable, 
  taskId, 
  dayId, 
  order, 
  isSearching, 
  labelId, 
  labelsArr,
  allLabels, 
  onAddTask, 
  onReorder, 
  onCreateLabel 
} :TaskProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>(text)
  const [isAddLabel, setIsAddLabel] = useState<boolean>(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditable) {
      inputRef.current!.focus()
    }
  }, [isEditable])

  const handleChange = useCallback((e: any) => {
    const { target: { value }} = e

    setInputValue(value)
  }, [])

  const handleAddTask = useCallback(() => {
    if (isEditable && !!inputValue) {
      onAddTask(taskId, dayId, inputValue, false)
    } else if (!!text && !isEditable) {
      onAddTask(taskId, dayId, text, true)
    } else if (!inputValue) {
      onAddTask(taskId, dayId, 'empty', false)
    }
  }, [taskId, dayId, inputValue, onAddTask, isEditable, text])

  const handleOnEnterAdd = useCallback((e: any) => {
    if (e.keyCode === 13) {
      handleAddTask()
    }
  }, [handleAddTask])

  interface DropResult {
    date: string,
  }

  interface DragItem {
    order: number
    dayId: string
    type: string
    taskId: number
  }

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'TASK',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current || isSearching) {
        return
      }
      const dragIndex = item.order
      const hoverIndex = order
      if (dragIndex === hoverIndex) {
        return
      }
      if(dayId !== item.dayId) {
        return
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      onReorder(dragIndex, hoverIndex, item.taskId, taskId, item.dayId)
      item.order = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: () => ({ dayId, taskId, order }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    })
  }))

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  const handleOpenAddLabel = useCallback((e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddLabel(true)
  }, [])

  const handleCloseAddLabel = useCallback(() => {
    setIsAddLabel(false)
  }, [])

  return (
    <>
      {isEditable ?
        (<InputStyled 
          type="text" 
          value={inputValue} 
          onChange={handleChange}
          onBlur={handleAddTask}
          onKeyDown={handleOnEnterAdd} 
          ref={inputRef} 
        />) :
        (<TaskStyled 
          ref={ref} 
          style={{ opacity }} 
          onClick={handleAddTask} 
          key={taskId} 
          data-handler-id={handlerId}
        >
          <div className="task-container">
            <div className="label-container">
              {labelsArr.map((el: any) => (<LabelStyled key={el.id} color={el.color}>{el.text}</LabelStyled>))}
            </div>
            {text}
          </div>
          <AddLabelButton onClick={handleOpenAddLabel}>+</AddLabelButton>
        </TaskStyled>)
      }
      <CreateLabelModal 
        isShowing={isAddLabel}
        labels={allLabels}
        dayId={dayId}
        taskId={taskId}
        labelId={labelId}
        currentLabelsId={(labelsArr || []).map((el: {id: number}) => el.id)}
        onCreateLabel={onCreateLabel}
        onClose={handleCloseAddLabel}
        />
    </>
  )
}

const InputStyled = styled.input`
  display: flex;
  padding: 15px;
  height: 8px;
  border: none;
  font-size: 18px;
  box-shadow: 0px 2px 10px 4px rgb(205 205 205 / 42%);
  border-radius: 5px;
  &&:focus {
    outline: none;
  }
`

const TaskStyled = styled.div`
  background-color: #fffdfdd9;
  border-radius: 5px;
  padding: 10px;
  padding-top: 7px;
  margin-bottom: 3px;
  overflow-x: clip;
  text-overflow: clip;
  box-shadow: 0px 2px 10px 4px rgb(205 205 205 / 42%);
  position: relative;
  .task-container {
    display: flex;
    flex-direction: column;
  }
  .label-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding-right: 27px;
  }
`

const AddLabelButton = styled.button`
  border: none;
  padding: 5px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 15px;
  border-radius: 5px;
  position: absolute;
  top: 5px;
  right: 5px;
`

export const LabelStyled = styled.label`
  display: inline;
  padding: 3px;
  padding-left: 6px;
  padding-right: 6px;
  background-color: ${({ color }) => color};
  border-radius: 15px;
  margin-right: 2px;
  margin-top: 3px;
  color: #fff;
`

export default Task
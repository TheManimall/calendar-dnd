import React, { useState, useCallback, FormEvent } from 'react';
import styled from 'styled-components'
import ReactDOM from 'react-dom'
import clsx from 'clsx';

import { LabelStyled } from './Task'

import { labelColors } from '../helpers'
import { LabelRecord } from '../types';

type CreateLabelModalProps = {
  labels: LabelRecord,
  dayId: string,
  taskId: number,
  isShowing: boolean,
  labelId: number,
  currentLabelsId: number[],
  onClose: () => void
  onCreateLabel: 
    (dayId: string, taskId: number, labelId: number, color: string, text: string, isCreate?: boolean) => void
}

const CreateLabelModal = ({ 
  labels, dayId, taskId, isShowing, labelId, currentLabelsId, onClose, onCreateLabel 
}: CreateLabelModalProps) => {
  const [selectColor, setSelectColor] = useState<string>('')
  const [labelText, setLabelText] = useState<string>('')

  // Handle functionality to select color for labels
  const handleSelectColor = useCallback((e: any) => {
    const { currentTarget: { dataset: { color }}} = e

    setSelectColor(color)
  }, [])

  // Handle functionality to get text for labels
  const handleText = useCallback((e: any) => {
    const { target: { value }} = e

    setLabelText(value)
  }, [])

  // Creating labels
  const handleCreateLabel = useCallback(() => {
    // Disabled if color or text is empty
    if (!selectColor || !labelText) return

    onCreateLabel(dayId, taskId, labelId, selectColor, labelText)
    setSelectColor('')
    setLabelText('')
    onClose()
  }, [selectColor, labelText])

  // Adding already created labels to task
  const handleAddLabel = useCallback((e: any) => {
    const { currentTarget: { dataset: { id, text, color }}} = e

    onCreateLabel(dayId, taskId, Number(id), color, text, false)
    onClose()
  }, [])

  // Build Modal for creating labels
  if (isShowing) {
    return (
      ReactDOM.createPortal(
        <LabelContainer>
          <div className="modal">
            <h1>Add label</h1>
            <div className="labels-container">
              {labels.map(((el: any) => {
                if (currentLabelsId.some(item => item === el.id)) {
                  return
                } else {
                  return (
                    <LabelStyled
                      key={el.id}
                      color={el.color} 
                      onClick={handleAddLabel}
                      data-id={el.id}
                      data-color={el.color}
                      data-text={el.text} 
                    >
                      {el.text}
                    </LabelStyled>
                  )
                }
              } 
              ))}
            </div>
            <input value={labelText} onChange={handleText} type="text" />
            <div className='row-container'>
              {labelColors.map((color: string) => 
                (<ColorItem
                  color={color}
                  className={clsx((selectColor === color) && 'selected')}
                  data-color={color}
                  onClick={handleSelectColor}
                />)
              )}
            </div>
            <div className='row-container'>
              <button onClick={handleCreateLabel}>Add label</button>
              <button onClick={onClose}>Cancel</button>
            </div>
          </div>
        </LabelContainer>
      , document.getElementById('portal-root') as HTMLElement))
  } else {
    return null
  }
}

const LabelContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  .modal {
    position: relative;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    width: 600px;
    margin: 100px auto;
    background: #edebeb;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);
    border-radius: 15px;
    padding: 0 24px;
    height: 500px;
    z-index: 200;
   }
   input {
    padding: 20px;
    font-size: 21px
   }
   .row-container {
    display: flex;
    flex-direction: row;
   }
   button {
    padding: 20px;
    font-size: 21px;
    background-color: #fff;
    margin-right: 40px;
   }
   .label-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
   }
`

const ColorContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const ColorItem = styled.div`
  display: flex;
  width: 40px;
  height: 40px;
  margin: 5px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  &&.selected {
    border: 4px solid #000;
    width: 32px;
    height: 32px;
  }
` 

export default CreateLabelModal;
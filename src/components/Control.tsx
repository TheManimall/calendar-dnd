import React, { useState, useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import clsx from 'clsx'
// @ts-ignore
import { useScreenshot, createFileName } from 'use-react-screenshot'

import { LabelRecord } from '../types'

type ControlType = {
  search: string,
  labels: {}[],
  calendarData: {},
  screenshotRef: any,
  labelsData: LabelRecord,
  onSearch: (e: any) => void,
  onLabelFilter: (e: any) => void,
  onSetFilesData: (e: any) => void
  onSetLabelData: (e: any) => void
}

const Control = ({ 
  search, labels, calendarData, screenshotRef, labelsData, onLabelFilter, onSearch, onSetFilesData, onSetLabelData 
}: ControlType) => {
  const [filterById, setFilterById] = useState<number | null>(null)

  useEffect(() => {
    if (search) setFilterById(null)
  }, [search])

  const [image, takeScreenshot] = useScreenshot({
    type: "image/jpeg",
    quality: 1.0
  })

  const handleDownloadScreenshot = useCallback(
    (image: any, { name = "img", extension = "jpg" } = {}) => {
      const a = document.createElement("a");
      a.href = image;
      a.download = createFileName(extension, name);
      a.click();
  }, [image]);

  const getImage = () => takeScreenshot(screenshotRef.current).then(handleDownloadScreenshot)

  const handleSelectLabel = useCallback((e: any) => {
    const { currentTarget: { dataset: { id } }} = e
    const idToNumber = Number(id)

    if (idToNumber === filterById) {
      setFilterById(null)
      onLabelFilter(null)
    } else {
      setFilterById(idToNumber)
      onLabelFilter(idToNumber)
    }
  }, [onLabelFilter, filterById, search])

  const handleExportJSONfile = useCallback(() => {
    const fileName = "calendar.json";
    const exportedData = { calendar: calendarData, labels: labelsData }
    const data = new Blob([JSON.stringify(exportedData)], { type: "text/json" });
    const jsonURL = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.href = jsonURL;
    link.setAttribute("download", fileName);
    link.click();
    document.body.removeChild(link);
  }, [calendarData, labelsData])

  const handleImportJSONfile = useCallback((e: any) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e: any) => {
      const data = JSON.parse(e.target.result);
      onSetFilesData(data.calendar)
      onSetLabelData(data.labels)
    };
  }, [onSetFilesData, onSetLabelData])

  return (
    <ControlContainer>
      <div className="button-panel">
        <button onClick={handleExportJSONfile}>Export</button>
        <input type="file" onChange={handleImportJSONfile} />
        <button onClick={getImage}>Screenshot</button>
      </div>
      <Input value={search} onChange={onSearch} placeholder='Search' />
      <LabelContainer>
        {labels.map((el: any) => (
          <LabelStyled 
            key={el.id} 
            data-id={el.id} 
            color={el.color}
            className={clsx((el.id === filterById) && 'selected')}
            onClick={handleSelectLabel}
          >
            {el.text}
          </LabelStyled>
        ))}
      </LabelContainer>
    </ControlContainer>
  )
}

const ControlContainer = styled.header`
  display: flex;
  width: calc(100% - 40px);
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 20px;
  .label-container {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    flex-wrap: wrap;
    max-width: 32%;
    display: flex;
    flex-wrap: wrap;
  }
  button {
    font-size: 15px;
    padding: 15px;
    padding-left: 20px;
    padding-right: 20px;
    background-color: #fff;
    margin-right: 15px;
  }
  input {
    font-size: 14px;
    padding: 12px;
    padding-left: 14px;
    padding-right: 14px;
    background-color: #fff;
    margin-right: 15px;
    width: 33%;
  }
`

const Input = styled.input`
  width: 35%;
  padding: 15px;
  border: none;
  border-radius: 5px;
  &&:focus {
    outline: none;
  }
`

const LabelContainer = styled.div`
  display: flex;
    flex-direction: row;
    align-items: baseline;
    max-width: 32%;
    flex-wrap: wrap;
`

const LabelStyled = styled.label`
  display: inline;
  padding: 9px;
  padding-left: 13px;
  padding-right: 13px;
  background-color: ${({ color }) => color};
  border-radius: 25px;
  margin-right: 2px;
  margin-top: 3px;
  color: #fff;
  &&.selected {
    border: 3px solid #000;
    padding: 6px;
    padding-left: 10px;
    padding-right: 10px;
  }
`

export default Control
export type LabelRecord = {
  id: number,
  color: string,
  text: string,
}[]

export type TaskType = {
  id: number,
  text: string,
  isEditable: boolean,
  order: number,
  labels: LabelRecord
}

export type TaskRecord = {
  [key: number]: TaskType
} 

export type TaskState = {
  [key: string]: TaskRecord | {}
}
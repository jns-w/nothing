import {atom} from 'jotai'

export type Task = {
  id: string
  content: string
  isCompleted?: boolean
  isSelected?: boolean
  isDeleted?: boolean // this helps with keeping delete history
}

export const taskListAtom = atom<Task[]>([
  {
    id: "1",
    content: "create new rn app",
    isCompleted: false,
    isSelected: false,
    isDeleted: false,
  },
  {
    id: "2",
    content: "go for a run",
    isCompleted: false,
    isSelected: false,
    isDeleted: false,
  },
  {
    id: "3",
    content: "buy groceries",
    isCompleted: false,
    isSelected: false,
    isDeleted: false,
  },
  {
    id: "4",
    content: "get a haircut",
    isCompleted: false,
    isSelected: false,
    isDeleted: false,
  },
  {
    id: "5",
    content: "do laundry",
    isCompleted: false,
    isSelected: false,
    isDeleted: false,
  },
  {
    id: "6",
    content: "clean the house",
    isCompleted: false,
    isSelected: false,
    isDeleted: false,
  },
  // {
  //   id: "7",
  //   content: "walk the dog",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "8",
  //   content: "do the dishes",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "9",
  //   content: "water the plants",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "10",
  //   content: "take out the trash",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "11",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "12",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "13",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "14",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "15",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "16",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "17",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "18",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "19",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
  // {
  //   id: "20",
  //   content: "do the laundry",
  //   isCompleted: false,
  //   isSelected: false,
  //   isDeleted: false,
  // },
])

export const taskInputAtom = atom<string>("")
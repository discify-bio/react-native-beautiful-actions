import { createContext, MutableRefObject } from 'react'
import { ActionsMethods } from './types'

const Context = createContext<MutableRefObject<ActionsMethods>>(null as any)

export default Context

import React from 'react'
import { MutableRefObject, PropsWithChildren, useEffect, useRef, useState } from 'react'
import Context from './Context'
import { ActionsMethods, CloseProperties, ProviderConfig, ShowProperties } from './types'
import { Host, Portal } from 'react-native-portalize'
import { Easing, runOnJS, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import Action from './components/Action'
import { Action as ActionType } from './types'

interface IProps {
  config?: ProviderConfig
}

const Provider: React.FC<PropsWithChildren<IProps>> = ({
  children,
  config
}) => {
  const ref = useRef<ActionsMethods>(null) as MutableRefObject<ActionsMethods>

  const [isOpen, setIsOpen] = useState(false)
  const [header, setHeader] = useState<React.ReactNode | null>(null)
  const [close, setClose] = useState<CloseProperties>(config?.close || {
    text: 'Close'
  })
  const [actions, setActions] = useState<ActionType[]>([])

  useEffect(() => {
    ref.current = {
      show: start
    }
  }, [])

  const value = useSharedValue(0)

  const start = (properties: ShowProperties) => {
    setActions(properties.actions)
    setHeader(properties.header)
    if (properties.close) setClose({
      ...config?.close,
      ...properties.close
    })
    startAnimation()
  }

  const startAnimation = () => {
    setIsOpen(true)
    value.value = withSpring(255, {
      stiffness: 250,
      damping: 25
    }, () => runOnJS(setIsOpen)(true))
  }

  const closeAnimation = () => {
    value.value = withTiming(0, {
      easing: Easing.inOut(Easing.quad),
      duration: 350
    }, () => runOnJS(setIsOpen)(false))
  }
  
  return (
    <Context.Provider
      value={ref}
    >
      <Host
        style={{
          flex: 1
        }}
      >
        <Portal>
          {isOpen && (
            <Action
              value={value}
              onClose={closeAnimation}
              header={header}
              close={close}
              actions={actions}
              config={config}
            />
          )}
        </Portal>
        {children}
      </Host>
    </Context.Provider>
  )
}

export default Provider

export interface ShowProperties {
  header: React.ReactNode
  actions: Action[]
  close?: CloseProperties
}

export interface CloseProperties {
  text: string
  color?: string
}

export interface Action {
  icon?: React.ReactNode
  text: string
  color?: string
  onPress: () => any
}

export interface ActionsMethods {
  show: (properties: ShowProperties) => void
}

export interface ActionSharedValue {
  translateY: number
  value: number
}

export interface ProviderConfig {
  fonts?: {
    semibold?: string
    regular?: string
  },
  close?: CloseProperties
}

import React, { useState } from 'react'

import { BlurView } from '@react-native-community/blur'
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, LayoutRectangle, Platform } from 'react-native'
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler'
import Animated, { SharedValue, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Action as ActionType, CloseProperties, ProviderConfig } from '../types'

const height = Dimensions.get('window').height

interface IProps {
  value: SharedValue<number>
  onClose: () => any
  header?: React.ReactNode
  close?: CloseProperties
  actions: ActionType[]
  config?: ProviderConfig
}

const Action: React.FC<IProps> = ({
  value,
  onClose,
  header,
  close,
  actions,
  config
}) => {
  const insets = useSafeAreaInsets()
  const translateValue = useSharedValue(0)
  
  const [layout, setLayout] = useState<LayoutRectangle | null>(null)

  const gesture = Gesture.Pan().onUpdate(event => {
    const value = height - (layout?.height ?? 0)

    if (event.translationY < (-(Platform.OS === 'android' ? value + (insets.top * 2) + (insets.bottom * 2) : value - insets.top))) {
      translateValue.value = withSpring((translateValue.value) + (event.translationY / 5000), {
        stiffness: 250,
        damping: 25,
        mass: 1
      })
      return
    }

    translateValue.value = withSpring(event.translationY / 3.2, {
      stiffness: 250,
      damping: 25,
      mass: 1
    })
  }).onEnd(event => {
    if (event.translationY > 150) return runOnJS(onClose)()
    translateValue.value = withSpring(0, {
      stiffness: 250,
      damping: 25
    })
  })

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        value.value,
        [0, 255],
        [0, 1]
      )
    }
  })

  const containerStyle = useAnimatedStyle(() => {
    const interpolateValue = interpolate(
      value.value - translateValue.value,
      [0, 255],
      [height, 0]
    )
    return {
      transform: [
        {
          translateY: interpolateValue
        }
      ]
    }
  })

  return (
    <Animated.View
      style={[
        styles.backdrop,
        backdropStyle
      ]}
      collapsable={false}
    >
      <SafeAreaView>
        <GestureDetector
          gesture={gesture}
        >
          <Animated.View
            style={[
              styles.wrapper,
              containerStyle
            ]}
            onLayout={event => setLayout(event.nativeEvent.layout)}
          >
            <Block
              actions={actions}
              header={header}
              onClose={onClose}
              config={config}
            />
            <Close
              onClose={onClose}
              config={config}
              close={close}
            />
          </Animated.View>
        </GestureDetector>
      </SafeAreaView>
    </Animated.View>
  )
}

const Block: React.FC<Pick<IProps, 'actions' | 'header' | 'onClose' | 'config'>> = ({
  actions,
  header,
  onClose,
  config
}) => {
  return (
    <View
      style={styles.blockContainer}
    >
      <BlurView
        style={styles.block}
        // overlayColor='rgba(43, 43, 43, .9)'
      >
        <View
          style={styles.indicatorContainer}
        >
          <View
            style={styles.indicator}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.blockWrapper}
          style={{
            maxHeight: Dimensions.get('window').height / 1.5
          }}
        >
          {header}
          <ActionsBlock
            actions={actions}
            onClose={onClose}
            config={config}
          />
        </ScrollView>
      </BlurView>
    </View>
  )
}

const ActionsBlock: React.FC<Pick<IProps, 'actions' | 'onClose'| 'config'>> = ({
  actions,
  onClose,
  config
}) => {
  return (
    <View
      style={styles.actions}
    >
      {actions.map((action, i) => (
        <ActionItem
          action={action}
          onClose={onClose}
          config={config}
          key={i}
        />
      ))}
    </View>
  )
}

const ActionItem: React.FC<{ action: ActionType } & Pick<IProps, 'onClose' | 'config'>> = ({
  action,
  onClose,
  config
}) => {
  const handlePress = () => {
    onClose()
    if (action.onPress) action.onPress()
  }
  return (
    <TouchableOpacity
      style={styles.action}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {action.icon}
      <Text
        style={[
          styles.actionText,
          {
            fontFamily: config?.fonts?.regular,
            color: action.color || '#ffffff'
          }
        ]}
      >
        {action.text}
      </Text>
    </TouchableOpacity>
  )
}

const Close: React.FC<Pick<IProps, 'onClose' | 'close' | 'config'>> = ({
  onClose,
  close,
  config
}) => {
  return (
    <View
      style={styles.buttonContainer}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onClose}
      >
        <BlurView
          style={styles.block}
        >
          <View
            style={styles.button}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: close?.color || '#ffffff',
                  fontFamily: config?.fonts?.semibold
                }
              ]}
            >
              {close?.text}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    zIndex: 99999999
  },
  wrapper: {
    padding: 16
  },
  backdrop: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, .32)'
  },
  button: {
    // backgroundColor: 'rgba(43, 43, 43, .7)',
    paddingHorizontal: 10,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textTransform: 'uppercase',
    fontSize: 12,
  },
  block: {
    backgroundColor: 'rgba(43, 43, 43, .7)',
  },
  blockContainer: {
    overflow: 'hidden',
    borderRadius: 24,
    marginBottom: 8
  },
  blockWrapper: {
    padding: 32
  },
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: 24,
  },
  action: {
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    marginLeft: 5
  },
  actions: {
    rowGap: 24
  },
  indicator: {
    width: '20%',
    height: 5,
    borderRadius: 100,
    backgroundColor: '#fff',
  },
  indicatorContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      marginBottom: 16
  }
})

export default Action

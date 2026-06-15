import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions, Animated as RNAnimated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useAnimatedTheme from '../hooks/useAnimatedTheme'
import useUIStore from '../store/uiStore'

const { width, height } = Dimensions.get('window')

const WALKTHROUGH_STEPS = [
  {
    title: 'Welcome to Clarify.',
    description: 'Your dashboard summarizes your activity and personalized insights.',
    icon: 'home',
    position: 'top',
  },
  {
    title: 'Quick Capture',
    description: 'Tap + anytime to quickly capture tasks or notes.',
    icon: 'add-circle',
    position: 'bottom',
  },
  {
    title: 'AI Insights',
    description: 'After you build some history, Clarify will generate personalized productivity insights based on your own data.',
    icon: 'sparkles',
    position: 'center',
    isLast: true,
  }
]

export default function WalkthroughOverlay() {
  const { hasSeenWalkthrough } = useUIStore()
  if (hasSeenWalkthrough) return null
  return <WalkthroughContent />
}

function WalkthroughContent() {
  const { staticColors, typography, layout, themeMode } = useAnimatedTheme()
  const { setHasSeenWalkthrough } = useUIStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  
  // Use React Native's built-in Animated to avoid Reanimated freezing bug
  const opacity = useRef(new RNAnimated.Value(0)).current
  const cardScale = useRef(new RNAnimated.Value(0.9)).current

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      RNAnimated.timing(cardScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start()
  }, [])

  const step = WALKTHROUGH_STEPS[currentStep]

  const getPositionStyle = () => {
    if (step.position === 'top') return { top: 120, alignSelf: 'center' }
    if (step.position === 'bottom') return { bottom: 120, alignSelf: 'center' }
    return { top: height / 2 - 100, alignSelf: 'center' }
  }

  const handleNext = () => {
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      RNAnimated.sequence([
        RNAnimated.timing(cardScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        RNAnimated.timing(cardScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start()
      setCurrentStep(s => s + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    RNAnimated.timing(opacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setHasSeenWalkthrough(true)
    })
  }

  const isDark = themeMode === 'dark'
  const bgCard = isDark ? '#1A1F2E' : '#FFFFFF'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
  const textPrimary = isDark ? '#FFFFFF' : '#000000'
  const textSecondary = isDark ? '#8892B0' : '#64748B'

  return (
    <RNAnimated.View style={[styles.container, { opacity }]}>
      <Pressable style={styles.backdrop} onPress={() => {}} />
      
      <RNAnimated.View style={[
        styles.card, 
        { 
          backgroundColor: bgCard, 
          borderColor: borderColor,
          borderRadius: layout.radius.xl,
          transform: [{ scale: cardScale }]
        },
        getPositionStyle()
      ]}>
        <View style={styles.header}>
          <Ionicons name={step.icon} size={24} color={staticColors.primary} />
          <Text style={[typography.bodyS, { color: textSecondary, marginLeft: 'auto' }]}>
            {currentStep + 1} OF {WALKTHROUGH_STEPS.length}
          </Text>
        </View>
        
        <Text style={[typography.headingM, { color: textPrimary, marginBottom: 8, marginTop: 12 }]}>
          {step.title}
        </Text>
        <Text style={[typography.bodyM, { color: textSecondary, lineHeight: 22, marginBottom: 24 }]}>
          {step.description}
        </Text>
        
        <View style={styles.actions}>
          {!step.isLast && (
            <Pressable onPress={handleComplete} style={styles.skipBtn}>
              <Text style={[typography.bodyM, { color: textSecondary }]}>Skip</Text>
            </Pressable>
          )}
          
          <Pressable 
            onPress={handleNext} 
            style={[styles.nextBtn, { backgroundColor: staticColors.primary, borderRadius: layout.radius.md, marginLeft: step.isLast ? 0 : 'auto', flex: step.isLast ? 1 : undefined }]}
          >
            <Text style={[typography.bodyM, { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' }]}>
              {step.isLast ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </RNAnimated.View>
    </RNAnimated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  card: {
    position: 'absolute',
    width: width * 0.85,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  }
})

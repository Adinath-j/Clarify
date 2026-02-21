import { View, StyleSheet } from 'react-native'

export default function Skeleton({ height = 16, width = '100%', radius = 8 }) {
  return (
    <View
      style={[
        styles.box,
        { height, width, borderRadius: radius },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#E5E7EB',
  },
})

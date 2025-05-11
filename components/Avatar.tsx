import { View, StyleSheet } from 'react-native';

export default function Avatar() {
  return (
    <View style={styles.container}>
      {/* Head */}
      <View style={styles.head}>
        {/* Beard */}
        <View style={styles.beard} />
        {/* Headband */}
        <View style={styles.headband} />
      </View>
      
      {/* Body */}
      <View style={styles.body}>
        {/* Arms */}
        <View style={styles.leftArm} />
        <View style={styles.torso}>
          {/* Jersey number */}
          <View style={styles.jerseyNumber}>
            <View style={styles.numberLine} />
            <View style={styles.numberLine} />
          </View>
        </View>
        <View style={styles.rightArm} />
      </View>
      
      {/* Legs */}
      <View style={styles.legs}>
        <View style={styles.leg} />
        <View style={styles.leg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '80%',
  },
  head: {
    width: 60,
    height: 70,
    borderRadius: 30,
    backgroundColor: '#8D5524',
    marginBottom: 10,
    position: 'relative',
  },
  beard: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: '40%',
    backgroundColor: '#000',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignSelf: 'center',
  },
  headband: {
    position: 'absolute',
    top: '20%',
    width: '100%',
    height: 8,
    backgroundColor: '#FFF',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  torso: {
    width: 100,
    height: 150,
    backgroundColor: '#8D5524',
    borderRadius: 25,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jerseyNumber: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberLine: {
    width: 25,
    height: 4,
    backgroundColor: '#FFF',
    marginVertical: 3,
  },
  leftArm: {
    width: 35,
    height: 100,
    backgroundColor: '#8D5524',
    borderRadius: 20,
    transform: [{ rotate: '15deg' }],
  },
  rightArm: {
    width: 35,
    height: 100,
    backgroundColor: '#8D5524',
    borderRadius: 20,
    transform: [{ rotate: '-15deg' }],
  },
  legs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 90,
  },
  leg: {
    width: 35,
    height: 120,
    backgroundColor: '#8D5524',
    borderRadius: 20,
  },
}); 
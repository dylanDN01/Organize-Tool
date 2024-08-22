
import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, TextInput, Keyboard, Pressable} from 'react-native';

import Task from '../components/task.js';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

export default function Index() {
  const [task, setTask] = useState("");

  const [taskItems, setTaskItems] = useState<Array<string>>([]);


  const handleAddTask = () => {
    Keyboard.dismiss();
    setTaskItems([...taskItems, task]); 
    setTask("");

  }

  const editTask = (index: any) => {
    console.log(taskItems.at(index))
  }

  return (
    <View style = {styles.container} >
      {/* Todays Tasks */}

      <View style = {styles.taskWrapper}>
        <Text style = {styles.sectionTitle}> Todays Tasks </Text>

        <View style = {styles.items}>

        {/* item is the default for objects in array, index is default for index*/}
        {taskItems.map((item, index) => {
          return (
            <Pressable key={index} onPress={() => editTask(index)}>
              <Task text={item} />
            </Pressable>
            
            
          );
        }
          

        )}

        </View>
      </View>

      {/* Create tasks */}
      <GestureHandlerRootView>
        <KeyboardAvoidingView 
          behavior = {Platform.OS === 'ios' ? 'padding' : 'height'}
          style = {styles.writeTaskWrapper}>
          <TextInput style = {styles.input} 
                      placeholder={'Add a task'} 
                      value = {task}
                      onChangeText={text => setTask(text)}/>

          <TouchableOpacity onPress={() => handleAddTask()}>
            <View style = {styles.addWrapper}>
              <Text style = {styles.addText}>+</Text>
            </View>
          </TouchableOpacity>

        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'grey',
    borderWidth: 1,
  },
  addText: {
    fontSize: 40  
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: screenWidth  * 6/8,
    backgroundColor: 'white',
    borderRadius: 40,
    borderColor: 'grey',
    borderWidth: 1,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: screenHeight * 0.03,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

  },
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  taskWrapper: {
    paddingTop: screenHeight * 0.08,
    paddingHorizontal: screenWidth * 0.04, 
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  items: {
    marginHorizontal: screenWidth * 0.02,
    marginVertical: screenHeight * 0.03,
  },
});

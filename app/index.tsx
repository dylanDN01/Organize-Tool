
import React, {useState} from 'react';
import {ScrollView, TouchableWithoutFeedback, TouchableOpacity, Image, View, Text, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, TextInput, Keyboard, Pressable} from 'react-native';

import Task from '../components/task.js';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

import settingsIcon from '../assets/images/Gear-icon.png'
import trashIcon from '../assets/images/trash-bin.png'
import checkIcon from '../assets/images/check-all.png'
import cancelIcon from '../assets/images/cancel.png'

export default function Index() {
  const [task, setTask] = useState(""); // add tasks

  const [viewSettings, setViewSettings] = useState(false); // settings

  const [selectedItems, setSelectedItems] = useState<any[]>([]); // press and hold to select

  const [taskItems, setTaskItems] = useState<any[]>([]); // list of items

  const [selecting, setSelecting] = useState(false); // for press and hold to select state

  const [checkAll, setCheckAll] = useState<boolean>(false);
  

  const handleViewSettings = () => {
    Keyboard.dismiss();
    setViewSettings(true);
  }

  const handleExitSettings = () => {
    Keyboard.dismiss();
    setViewSettings(false); 
  }

  const handleAddTask = () => {
    Keyboard.dismiss();
    setTaskItems([...taskItems, task]); 
    setTask("");

  }



  // this function will highlight the task, add options at the top to delete,rename, etc,
  // renaming option is removed when more than 1 task is highlighted
  const editTask = (index: any) => {
    if (!selecting) {
      setSelecting(true)
    }
    if (!selectedItems.includes(index)){
      setSelectedItems(selectedItems => ([...selectedItems, index]))
    }
  }
  

  const addRemoveSelected = (index: any) => {
    if (selecting) {
      if (selectedItems.includes(index)){
        let selectedCopy = [...selectedItems];
        let itemToRemove = selectedCopy.indexOf(index);
        selectedCopy.splice(itemToRemove, 1);
        setSelectedItems([...selectedCopy]);

        // actually no clue why its <= 1 and not 0; but it works
        if (selectedItems.length <= 1) {
          cancel();
        }
      }
      else if (!selectedItems.includes(index)) {
        setSelectedItems(selectedItems => ([...selectedItems, index]));
      }
    }
  }

  const cancel = () => {
    setSelectedItems([]);
    setSelecting(false);    
  }

  const deleteAll = (toDelete: Array<any>) => {
    let itemsCopy = taskItems.filter((item, index) => !toDelete.includes(index));
    setTaskItems(itemsCopy);
    cancel();
  }



  return (
    <View style = {styles.container} >
      {/* Todays Tasks */}

      <View style = {styles.taskWrapper}>
        <View style = {styles.header}>

          <Text style = {styles.sectionTitle}>List</Text>

          {selecting && <View style = {styles.selectOptions}>
            <TouchableOpacity onPress = {() => deleteAll(selectedItems)} style = {{alignItems: 'center'}}>
              <Image style = {{height: 40, width: 40}}source = {trashIcon}></Image>
              <Text>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress = {() => setCheckAll(!checkAll)} style = {{alignItems: 'center'}}>
              <Image style = {{height: 40, width: 40}}source = {checkIcon}/>
              <Text>Check All</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress = {() => cancel()}style = {{alignItems: 'center'}}>
              <Image style = {{height: 40, width: 40}} source = {cancelIcon}/>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>}


          <TouchableOpacity onPress={() => handleViewSettings()}>
            <Image style = {styles.settingsIconStyle} source = {settingsIcon}/>
          </TouchableOpacity>

          {viewSettings && 
          (
          <TouchableWithoutFeedback>
            <View style = {styles.viewOptions}>
              <Text style = {{fontSize: 24}}>
                Settings
              </Text>
              <TouchableOpacity  onPress={() => handleExitSettings()} style = {styles.closeSettings}>
                <Text style = {styles.exitStyle}>
                  X
                </Text>
              </TouchableOpacity>
              <View style = {styles.settingsOption}>
                <Text>
                  Change Theme
                </Text>
              </View>
              <View style = {styles.settingsOption}>
                <Text>
                  Reset All
                </Text>
              </View>
              <View style = {styles.settingsOption}>
                <Text>
                  Check 
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>)}
        </View>

        <View style = {styles.items}>

        {/* item is the default for objects in array, index is default for index*/}
        {taskItems.map((item, index) => {
          return (
            <TouchableOpacity key={index} 
              onLongPress={() => editTask(index)} 
              onPress={() => addRemoveSelected(index)} 
              style = {selectedItems.includes(index) && styles.selectedItem}
              
              >
              <Task task={item} isChecked = {checkAll} />
            </TouchableOpacity>
          );
        }    

        )}

        </View>
      </View>

      {/* Create tasks */}

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



    </View>
  );
}

const styles = StyleSheet.create({
  selectOptions: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-between'
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: 'blue',
  },
  settingsOption: {
    backgroundColor: 'white',
    borderRadius: 5,
    
  },
  exitStyle: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  closeSettings: {
    backgroundColor: '#ff3e00',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,

    position: 'absolute',
    right: 0,
  },
  viewOptions: {
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    width: '100%',
    height: screenHeight * 0.85,

    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999 ,
    
    borderWidth: 3,
    borderColor: 'gray',
    paddingTop: 4,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems:  'center',
    justifyContent: 'space-between'
  },
  settingsIconStyle: {
    height: 40,
    width: 40,
  },  
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

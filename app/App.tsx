import React, {useRef, useEffect, useState} from 'react';
import {AppState, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Image, View, Text, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, TextInput, Keyboard, Alert} from 'react-native';

import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import Task from '../components/task.js';


const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;


import settingsIcon from '../assets/images/Gear-icon.png'
import trashIcon from '../assets/images/trash-bin.png'
import checkIcon from '../assets/images/check-all.png'
import cancelIcon from '../assets/images/cancel.png'
import selectAllIcon from '../assets/images/select-all.png'
import editIcon from '../assets/images/edit-icon.png'
import upArrow from '../assets/images/uparrow.png'
import downArrow from '../assets/images/downarrow.png'
import importIcon from '../assets/images/import.png'
import exportIcon from '../assets/images/export.png'



export default function App() {


  const { StorageAccessFramework } = FileSystem; // storage management
  
  const [task, setTask] = useState(""); // add tasks

  const [viewSettings, setViewSettings] = useState(false); // settings

  const [selectedItems, setSelectedItems] = useState<any[]>([]); // press and hold to select

  const [taskItems, setTaskItems] = useState<any[]>([]); // list of items (NEED THIS FOR DATABASE)

  const [selecting, setSelecting] = useState(false); // for press and hold to select state

  const [checkAll, setCheckAll] = useState<any[]>([]); // for checking all selected items (NEED THIS FOR DATABASE)

  const [selectedIndex, setSelectedIndex] = useState(-1); // for modifying text

  const [isEditingText, setIsEditingText] = useState(false); // for opening text box


  const [isShiftingPriority, setIsShiftingPriority] = useState(false); // for shifting priority

  const [title, setTitle] = useState("List"); // change list title

  const handleViewSettings = () => {
    cancel()
    Keyboard.dismiss();
    setViewSettings(true);
  }

  const handleExitSettings = () => {
    Keyboard.dismiss();
    setViewSettings(false); 
  }

  const handleAddTask = () => {
    if (task.length != 0) {
      Keyboard.dismiss();
      setTaskItems([...taskItems, task]); 
      setTask("");
    }
  }

  const handleSelectAll = () => {
    // select all items if all items are not selected
    // unselec all items otherwise
    if (selectedItems.length != taskItems.length){
      setSelectedItems( Array.from({ length: taskItems.length }, (_, i) => i));
    }
    else{
      setSelectedItems([]);
    }
  }


  const modifyText = (task: string) => {
    // if there is a selected item
    if (selectedIndex !== -1) {
      taskItems[selectedIndex] = task
    }
    cancel()
    
    
  }


  // this function will highlight the task, add options at the top to delete,rename, etc,
  // renaming option is removed when more than 1 task is highlighted
  const editTask = (index: any) => {
    if (isShiftingPriority){
      setIsShiftingPriority(false);
    }
    
    if (!selecting) {
      setSelecting(true)
      setSelectedIndex(index); // for editing text
    }
    if (!selectedItems.includes(index)){
      setSelectedItems(selectedItems => ([...selectedItems, index]))
    }   
  }
  
  
  // adds or removes by value (which is an index)
  const addRemoveSelected = (value: any) => {
    if (selecting) {
      if (selectedItems.includes(value)){
        let selectedCopy = [...selectedItems];
        let itemToRemove = selectedCopy.indexOf(value);
        selectedCopy.splice(itemToRemove, 1);
        setSelectedItems([...selectedCopy]);

        // actually no clue why its <= 1 and not 0; but it works
        if (selectedItems.length <= 1) {
          cancel();
        }
      }
      else if (!selectedItems.includes(value)) {
        setSelectedItems(selectedItems => ([...selectedItems, value]));
      }
    }
  }


  const cancel = () => {
    setSelectedItems([]); // set selection to none
    setSelectedIndex(-1); // change selected item to none
    setIsEditingText(false); // remove edit text box
    setSelecting(false);   // exit selection mode
    setTask(""); // reset typed tasks
    setIsShiftingPriority(false);
  }

  const deleteAll = (toDelete: Array<any>) => {
    let itemsCopy = taskItems.filter((item, index) => !toDelete.includes(index));
    setTaskItems(itemsCopy);
    cancel();
  }

  const handleCheckAll = () =>{
    if(!(selectedItems.every(item => checkAll.includes(item)))) {
      setCheckAll(selectedItems);
    }
    else {
      setCheckAll([]);
    }
  }
  const handleSetCheck = (indexValue: any) => {
    AddRemoveByValue(checkAll, setCheckAll, indexValue);
  }

  const AddRemoveByValue = (arrayInput: any[], setterFunction: any, value: any) => {
    if (arrayInput.includes(value)) {
      let arraycopy = [...arrayInput];
      let indexToRemove = arraycopy.indexOf(value);
      arraycopy.splice(indexToRemove, 1);
      setterFunction([...arraycopy]);
    }
    else{
      setterFunction([...arrayInput, value]);
    }
  }

  const shiftItem = (indexOld: number, indexNew: number) => {
    let tasksCopy = [...taskItems];
    
    if (indexNew > -1 && indexNew < taskItems.length){
      let tempTask = tasksCopy[indexNew];
      tasksCopy[indexNew] = tasksCopy[indexOld];
      tasksCopy[indexOld] = tempTask;
      
      // move the checkmarks too (swap if needed)
      let checkMoved = checkAll;
      if (!(checkMoved.includes(indexNew)) && checkMoved.includes(indexOld)) {
        checkMoved[checkMoved.indexOf(indexOld)] = indexNew;
      }
      else if (checkMoved.includes(indexNew) && !checkMoved.includes(indexOld)){
        checkMoved[checkMoved.indexOf(indexNew)] = indexOld;
      }

      
      setCheckAll(checkMoved);

      setSelectedIndex(indexNew);
    }

    setTaskItems(tasksCopy);

    
  }

  const handleSetShiftingIndex = (index: any) => {

    if (!isShiftingPriority) {
      setIsShiftingPriority(true);
      setSelectedIndex(index);
    }
    else{
      setIsShiftingPriority(false);
      cancel();
    }
  }

  // this function should:
  //  open file explorer,
  // accept a JSON file (only),
  // convert the JSON to a dictionary,
  // initialize the list,
  // change the title to the file name

  const uploadList = async () => {

    try {
      const result: any = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      const fileUri = result.assets[0].uri;
      
      const fileName = result.assets[0].name;

      const fileContents = await FileSystem.readAsStringAsync(fileUri, {encoding: FileSystem.EncodingType.UTF8});


      const jsonData = JSON.parse(fileContents);

      loadFromJson(jsonData, fileName); // json is a dictionary
    }
    catch (error){
      console.log(error);
      return;
    }
    

  }

  const loadFromJson = (dictionary: any, listName: string) => {


    let newTaskItems: string[] = []
    let newCheckedItems: number[] = []
    for (const key in dictionary){
      const entry = dictionary[key];
      newTaskItems.push(entry.task);
      
      if (entry.checked === true){
        newCheckedItems.push(Number(key));
      } 
    }

    setTitle(listName.substring(0, listName.length - 5));
    setCheckAll(newCheckedItems);
    setTaskItems(newTaskItems); 
  }

  // this function should:
  // convert all the task items into a dictionary,
  // parse it into a JSON file,
  // download the JSON file, with the name as the title of the list

  const downloadList = async () => {
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted){
      const directoryUri = permissions.directoryUri; // set directory
      // convert to dictionary
      let dictToJSON: any = [];
      for (let i = 0; i < taskItems.length; i++) {
        dictToJSON[i] = {
          task: taskItems[i],
          checked: checkAll.includes(i)
        };
      }
      // change the type to a JSON
      dictToJSON = JSON.stringify(dictToJSON);
      
      // create the URI ( problem is here )

      const uriDir = await StorageAccessFramework.readDirectoryAsync(directoryUri);

      let foundCopy = false;
      // search for existing uri
      uriDir.forEach(async element => {
        let fileName = title;
        fileName = fileName.replaceAll(" ", "%20"); // SAF URI compatibility
        fileName = fileName.replaceAll("/", '%2F');
        fileName = fileName + ".json";
        
        if (element.includes(fileName) && !foundCopy) {
          let uri = element;
          foundCopy = true;

          await Alert.alert(
            'Existing List Found',
            'A file with the same name already exists. Do you want to overwrite it?',
            [
              {
                text: "Overwrite",
                onPress: () => {handleOverwrite(2, dictToJSON, directoryUri, uri)
                  return;
                }
              },
              {
                text: "Make New",
                onPress: () => {handleOverwrite(1, dictToJSON, directoryUri, uri)

                }
              },
              {
                text: "Cancel", 
                onPress: () => {return;}
                
              }
            ]
          );
          

        }
      });
      
      // create a new file 
      if (!foundCopy) {

        const uri = await StorageAccessFramework.createFileAsync(
          directoryUri,
          title.toString(),
          'application/json',
        );
        await FileSystem.writeAsStringAsync(uri, dictToJSON, { encoding: FileSystem.EncodingType.UTF8}); 
      } 
    }
  }



  const handleOverwrite = async (value: number,dictToJSON: any, directoryUri: any, uri : string) => {

    try{
      if (value === 2) {  

        await FileSystem.deleteAsync(uri);

        const uriNew  = await StorageAccessFramework.createFileAsync(
          directoryUri,
          title.toString(),
          'application/json',
        );
        await  FileSystem.writeAsStringAsync(uriNew, dictToJSON, { encoding: FileSystem.EncodingType.UTF8}); 
      }
      else if (value === 1) {
        // this works as intended

        const uri = await StorageAccessFramework.createFileAsync(
          directoryUri,
          title.toString(),
          'application/json',
        );
        await FileSystem.writeAsStringAsync(uri, dictToJSON, { encoding: FileSystem.EncodingType.UTF8}); 
      }
    }
    catch{
      return;
    } 
  }


  return (
    
    <View style = {styles.container} >
      {/* Todays Tasks */}
      {(selectedIndex !== -1 && isEditingText) && 
      <View style = {styles.renameBox}>
        <TextInput placeholder='Rename Task...' onChangeText={text => setTask(text)}/>

        <TouchableOpacity onPress={() => modifyText(task)} 
        style = {styles.actionButtonModify && {...styles.actionButtonModify,
                           backgroundColor: 'lightgreen', left: 0}}>
          <Text>
            Save
          </Text>
        </TouchableOpacity> 
      
        <TouchableOpacity onPress={() => cancel()} 
                          style = {styles.actionButtonModify && {...styles.actionButtonModify,
                           backgroundColor: '#FF474C', right: 0}}>
          <Text>
            Cancel
          </Text>
        </TouchableOpacity>

      </View>}

      {(isShiftingPriority) && <View style = {styles.shiftOptionsBox}>

        <TouchableOpacity onPress = {() => shiftItem(selectedIndex, selectedIndex -1)} style = {{alignItems: 'center'}}>
          <Image source = {upArrow} style = {styles.selectingToolIcon}/>
          <Text style = {{fontSize: screenHeight * 0.015}}>Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress = {() => shiftItem(selectedIndex, selectedIndex + 1)} style = {{alignItems: 'center'}}>
          <Image source = {downArrow} style = {styles.selectingToolIcon}/>
          <Text style = {{fontSize: screenHeight * 0.015}}>Down</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress = {() => cancel()} style = {{alignItems: 'center'}}>
              <Image style = {styles.selectingToolIcon} source = {cancelIcon}/>
              <Text style = {{fontSize: screenHeight * 0.015}}>Cancel</Text>
        </TouchableOpacity>
      </View>
      }

      <View style = {styles.taskWrapper}>
        <View style = {styles.header}>


          <Text style = {styles.sectionTitle}>{title}</Text>

          

          {selecting && <View style = {styles.selectOptions}>

            {(selectedItems.length === 1) && <TouchableOpacity onPress = {() => setIsEditingText(true)} style = {{alignItems: 'center'}}>
              <Image style = {styles.selectingToolIcon} source = {editIcon}></Image>
              <Text style = {{fontSize: screenHeight * 0.015}}>Edit</Text>
            </TouchableOpacity>}

            <TouchableOpacity onPress ={() => handleSelectAll()} style = {{alignItems: 'center'}}>
              <Image style = {styles.selectingToolIcon} source = {selectAllIcon}/>
              <Text style = {{fontSize: screenHeight * 0.015}}>Select</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress = {() => handleCheckAll()} style = {{alignItems: 'center'}}>
              <Image style = {styles.selectingToolIcon} source = {checkIcon}/>
              <Text style = {{fontSize: screenHeight * 0.015}}>Check</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress = {() => cancel()} style = {{alignItems: 'center'}}>
              <Image style = {styles.selectingToolIcon} source = {cancelIcon}/>
              <Text style = {{fontSize: screenHeight * 0.015}}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress = {() => deleteAll(selectedItems)} style = {{alignItems: 'center'}}>
              <Image style = {styles.selectingToolIcon} source = {trashIcon}></Image>
              <Text style = {{fontSize: screenHeight * 0.015}}>Delete</Text>
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
                <View>
                <Text>
                  Change Title (Auto Saved)
                </Text> 
                <TextInput placeholder='New Title Here...' onChangeText = {async text => await  setTitle(text)}></TextInput>
                </View>

              </View>
              
              <TouchableOpacity onPress = {() => uploadList()} style = {styles.settingsOption}>
                <Image source = {importIcon} style = {styles.selectingToolIcon}/>
                <Text>
                  Open List (from files)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress = {() => downloadList()} style = {styles.settingsOption}>
                <Image source = {exportIcon} style = {styles.selectingToolIcon}/>
                <Text>
                  Download List (to files)
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>)}
        </View>

        <ScrollView style = {styles.items}>

          {/* item is the default for objects in array, index is default for index*/}
          {taskItems.map((item, index) => {
            return (
              
              <TouchableOpacity key={index} 
                onLongPress={() => editTask(index)} 
                onPress={() => addRemoveSelected(index)} 
                style = {(selectedItems.includes(index) && styles.selectedItem) || (isShiftingPriority && selectedIndex === index && styles.shiftingTask)}
                >
                  
                  <Task 
                  checkBoxDisplay = {
                    <TouchableOpacity style = {styles.checkBox} onPress={() => handleSetCheck(index)}>
                      {(checkAll.includes(index)) && <Text style = {styles.check}>✓</Text>}
                    </TouchableOpacity>} 
                    
                  shiftIconDisplay={<TouchableOpacity style = {styles.circular}
                                    onLongPress={() => handleSetShiftingIndex(index)}/>}

                  task={item}/>

                  
              </TouchableOpacity>


            );
          }    

          )}

        </ScrollView>
      </View>

      {/* Create tasks */}

      {!isEditingText && <KeyboardAvoidingView 
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

      </KeyboardAvoidingView>}


    </View>
  );
}

const styles = StyleSheet.create({
  shiftingTask: {
    borderWidth: 3,
    borderColor: 'orange',
  },
  circular: {
    width: screenHeight * 0.03,
    height: screenHeight * 0.04,
    borderColor: 'lightgray',
    borderWidth: 3,
    borderRadius: 6
},
  shiftOptionsBox: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 3,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: 'orange',
    width: '70%',
    height: screenHeight * 0.07,
    left: '25%',
    top: '8%',
    zIndex: 997,
  },
  actionButtonModify: {
    position: 'absolute', 
    padding: 2, 
    bottom: 0,
    alignItems: 'center',
    width: screenWidth * 0.3
  },
  renameBox: {
    position: 'absolute',
    top: screenHeight * 0.06,
    left: screenWidth * 0.03,
    width: screenWidth * 0.95,
    height: screenHeight * 0.08,
    zIndex: 998,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 6,
    borderRadius: 8,
  },
  check: {
    fontSize: screenHeight * 0.014,
    color: 'black',
    fontWeight: 'bold',
},
  checkBox: {
    width: screenHeight * 0.03,
    height: screenHeight * 0.03,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
    borderRadius: 6,
    marginRight: 15,
},
  selectingToolIcon: {
    height: screenHeight * 0.03,
    width: screenHeight * 0.03,
  },
  selectOptions: {
    flexDirection: 'row',
    width: '70%',
    justifyContent: 'space-between',
    position: 'absolute',
    left: '25%',
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'blue',
    zIndex: 990,
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: 'blue',
  },

  settingsOption: {
    width: '50%',
    height: '6%',
    alignItems: 'center',
    justifyContent: 'center',
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
    top: 0
  },
  viewOptions: {
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
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
    marginBottom: screenHeight * 0.15,
  },
});
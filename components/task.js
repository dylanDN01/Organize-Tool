import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { GestureHandlerRootView, NativeViewGestureHandler, TouchableOpacity } from 'react-native-gesture-handler';

const Task = (task) => {
    return (
        <View style = {styles.item}>
            <GestureHandlerRootView style = {styles.itemLeft}>
                <TouchableOpacity style = {styles.checkBox}></TouchableOpacity>
                <Text style = {styles.itemText}>{task.text}</Text>
            </GestureHandlerRootView>

            <View style = {styles.circular}>

            </View>
            
        </View>
    );
}

export default Task;


const styles = StyleSheet.create({
    item: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
        
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    checkBox: {
        width: 24,
        height: 24,
        backgroundColor: 'lightgray',
        opacity: 0.4,
        borderRadius: 6,
        marginRight: 15,
    },
    itemText: {
        maxWidth: '80%',
    },
    circular: {
        width: 12,
        height: 12,
        borderColor: 'lightgray',
        borderWidth: 3,
        borderRadius: 6
    },
});

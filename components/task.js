import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const Task = ({task, isChecked}) => {

    const [checked, setChecked] = useState(false);

    // enable checkbox
    const handleSetCheck = () => {
        setChecked(!checked);
    };

    return (
        <View style = {styles.item}>
            <View style = {styles.itemLeft}>
                <TouchableOpacity style = {styles.checkBox} onPress={() => handleSetCheck()}>
                    {(isChecked || checked) && <Text style = {styles.check}>✓</Text>}
                </TouchableOpacity>
             
                <Text style = {styles.itemText}>{task}</Text>
            </View>   

            <View style = {styles.circular}>

            </View>
            
        </View>
    );
}

export default Task;


const styles = StyleSheet.create({
    check: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },

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
        width: 32,
        height: 32,
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.4,
        borderRadius: 6,
        marginRight: 15,
    },
    itemText: {
        maxWidth: '80%',
        fontSize: 15
    },
    circular: {
        width: 12,
        height: 12,
        borderColor: 'lightgray',
        borderWidth: 3,
        borderRadius: 6
    },
});

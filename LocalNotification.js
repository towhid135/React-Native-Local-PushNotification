import React,{useEffect,useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Button } from 'react-native';
import * as Notifications from 'expo-notifications';

/*We can set a local(doesn't require net) notification by only implementing 
"Notifications.setNotificationHandler" and "Notifications.scheduleNotificationAsync"
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  })
})

const Permission = async () =>{
  let permissionObj = await Notifications.getPermissionsAsync();
  if(permissionObj.status !== 'granted'){
    permissionObj = await Notifications.requestPermissionsAsync();

    if(permissionObj.status !== 'granted'){
      console.log('Without permission expo can not push notification!');
    }
    return;
  }
  return;
}

export default function App() {

  useEffect(()=>{
    Permission();
    console.log('Permission func executed!');
  },[]);

  useEffect(()=>{
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response =>{
      /* Here, I can navigate to another screen, send a HTTP request etc. */
      console.log('On tap response ',response);
    })
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification =>{
      console.log('notification data ',notification);
    });
    return () =>{
      foregroundSubscription.remove();
    }
  })

  const triggerNotificationHandler = async () =>{
    /*With this method helps us to schedule a local notification. */
    
    await Notifications.scheduleNotificationAsync({
      content:{
        title: 'My first local notification',
        body: 'This is the first local notification we are sending!',
        data: {data: 'We can get this additional data when the notification is sent.'}
      },
      trigger:{
        seconds: 1,
      }
    });
    
  }
  return (
    <View style={styles.container}>
      <Button title='triggerNotification' onPress={triggerNotificationHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

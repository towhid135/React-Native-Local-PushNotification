import React,{useEffect,useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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
    else{
      //Registering to expo's push server
      if(Device.isDevice){
        //for using expo push token we need to sign in to expo account using cmd
        return ( await Notifications.getExpoPushTokenAsync() ).data;
      }
    }
  }

  else{
    //Registering to expo's push server
    if(Device.isDevice){
    return ( await Notifications.getExpoPushTokenAsync() ).data;
    }
  }

}

export default function App() {
  const [token,setToken] = useState(undefined);

  useEffect(()=>{
    const getPermissionAndToken = async () => {
     const Token = await Permission();
     setToken(Token);
     console.log('Permission func executed!');
     console.log('token ',token);
    }
    getPermissionAndToken();
  },[token]);

  useEffect(()=>{
    // it helps to show notification if app is minimized (if we go to the main menu or using some othe app)
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response =>{
      /* Here, I can navigate to another screen, send a HTTP request etc. */
      console.log('On tap response ',response);
    })
    //it helps to show notification when we are using the app
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification =>{
      console.log('notification data ',notification);
    });
    return () =>{
      foregroundSubscription.remove();
    }
  })

  const triggerNotificationHandler = async () =>{
    /*With this method helps us to schedule a local notification. */
    
    // await Notifications.scheduleNotificationAsync({
    //   content:{
    //     title: 'My first local notification',
    //     body: 'This is the first local notification we are sending!',
    //     data: {data: 'We can get this additional data when the notification is sent.'}
    //   },
    //   trigger:{
    //     seconds: 1,
    //   }
    // });

    fetch('https://exp.host/--/api/v2/push/send',{
      method: 'POST',
      headers: {
        "host": "exp.host",
        "accept": "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        "to": token,
        title : "Push Notification",
        data: {extraData: 'some data'},
        body: 'This push notification was send via the app!'
        //I can set a trigger time also
        // trigger:{
        //   seconds: 1,
        // }
      })
    })
    
  }
  return (
    <View style={styles.container}>
      <Button title='Trigger Notification' onPress={triggerNotificationHandler} />
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

import React, {useRef, useState} from 'react';
import {Modal,View, Text,ScrollView, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, FlatList, Image, Button, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import{Menu, MenuOption, MenuOptions,MenuTrigger, MenuProvider} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/Ionicons';
import {KeyBoardAwareScrollVeiw} from 'react-native-keyboard-aware-scroll-view';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

const RoadMapSocial = (props, {navigation}) => {

  // App.js ip 받아오기
  const [ip,setIp] = useState();
  AsyncStorage.getItem("ip").then((value) => {
    setIp(value);
  });

  const scrollRef = useRef();

  let roadMapId = props.route.params.roadMapId;
  let roadmap = props.route.params.roadmap;
  let userId = props.route.params.userId;

  console.log(roadMapId);

  let [info, setInfo] = useState(["생생하며 그들의 눈에 무엇이 타오르고 있는가? 우리 눈이 그것을 보는 때에 우리의 귀는 생의 찬미를 듣는다. 그것은 웅대한 관현악이며 미묘한 교"]);
  let [user, setUser] = useState([]);
  let [userComment, setUserComment] = useState([]);
  let [date, setDate] = useState([]);
  let [like, setLike] = useState(["♡",37]);

  let [moddifyindex, setModifyIndex] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [head, setHead] = useState(["삭제 하시겠습니까?"]);
  const [body, setBody] = useState([""]);

  let [getdata,setGetData] = useState(["0"]);

  if(getdata == "0"){
    if(ip != null){
      getComment();
      setGetData("1");
    }
  }

  //댓글 정보 받아오기
  async function getComment(){
    try{ 

      var newUserArray = [...user];
      var newUserCommentArray = [...userComment];
      var newDate = [...date];

      const response = await axios.get("http://"+ip+":8082/getcomment",{
        params : {
          rid : roadMapId
        }
      });

      let length = response.data.length

      for(var i = 0; i<length; i++){
        newUserArray.push(response.data[i].UID);
        newUserCommentArray.push(response.data[i].UCOMMENT);
        newDate.push(response.data[i].UDATE);
      }

      setUser(newUserArray);
      setUserComment(newUserCommentArray);
      setDate(newDate);

    }catch(error){
      console.log(error);
    }
  }

  //댓글 저장
  async function insertComment(uid, text, date){
    try{
      const response = await axios.get("http://"+ip+":8082/insertcomment",{
        params : {
          rid : roadMapId,
          uid : uid,
          ucomment : text,
          udate : date
        }
      });
      console.log(response.data[0]);
    }catch(error){
      console.log(error);
    }
  }

  //댓글 삭제 함수
  async function delectComment(){
    const response = await axios.get("http://"+ip+":8082/deletecomment",{
      params : {
        uid : user[moddifyindex],
        udate : date[moddifyindex]
      }
    });
    
    const result = response.data
 
    console.log(result);
    if(result == "success"){
      var newUserArray = [...user];
      var newUserCommentArray = [...userComment];
      var newDateArray = [...date];

      newUserArray.splice(moddifyindex,1);
      newUserCommentArray.splice(moddifyindex,1);
      newDateArray.splice(moddifyindex,1);

      setUser(newUserArray);
      setUserComment(newUserCommentArray);
      setDate(newDateArray);
    }
  }

  //입력된 댓글을 저장하는 state
  let [inputText, setInputText] = useState([""]);

  //댓글 등록
  const handleCommentButtonPress = () =>{

    if(inputText == ""){
    }

    else{
      var newCommentArray = [...userComment];
      var newUserArray = [...user];
      var newDateArray = [...date];
  
      var currentTime = new Date();
  
      // var time = currentTime.getFullYear() + "-" + currentTime.getMonth() + "-" + currentTime.getDay() + " " + currentTime.getHours() + ":" + currentTime.getMinutes();
      var time = currentTime.toLocaleString();
      newCommentArray.push(inputText);
      newUserArray.push(userId);
      newDateArray.push(time);
  
      setUser(newUserArray);
      setUserComment(newCommentArray);
      setDate(newDateArray);

      insertComment(userId, inputText, time.toString());
      setInputText("");
      scrollRef.current.scrollToEnd({animated : true});
    }

  }

  const modalHeader=(
    <View style={styles.modalHeader}>
      <Text style={styles.title}>{head}</Text>
      <View style={styles.divider}></View>
    </View>
  )
  const modalBody=(
    <View style={styles.modalBody}>
      <Text style={styles.bodyText}>{body}</Text>
    </View>
  )
  const modalFooter=(
    <View style={styles.modalFooter}>
      <View style={styles.divider}></View>
      <View style={{flexDirection:"row-reverse",margin:10}}>
        <TouchableOpacity style={{...styles.actions,backgroundColor:"#db2828"}} 
          onPress={() => {
            delectComment();
            setModalVisible(!modalVisible);
          }}>
          <Text style={styles.actionText}>삭제</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{...styles.actions,backgroundColor:"#21ba45"}}
          onPress = {() => {
            setModalVisible(!modalVisible);
          }}>
          <Text style={styles.actionText}>취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
  const modalContainer = (
    <View style = {styles.modalContainer}>
      {modalHeader}
      {/* {modalBody} */}
      {modalFooter}
    </View>
  )

  const modal = (
    <Modal
      animationType='fade'
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
      }}>
      <View style={styles.modal}>
        <View>
          {modalContainer}
        </View>
      </View>
    </Modal>
  )

  //좋아요 카운트
  const getLike = () => {
    var newLikeArray = [...like];
    
    if (newLikeArray[0].trim()==("♡")){
      newLikeArray[0] = "♥";
      newLikeArray[1] += 1; 
    }
    else {
      newLikeArray[0] = "♡";
      newLikeArray[1] -= 1;
    }
    setLike(newLikeArray);
  }

  const commentlist = user.map((user, index) => 
    (              
      <TouchableOpacity key={index} style = {styles.commentArea} onLongPress = {()=> {
        if(user == userId){
          setModalVisible(true);
          setModifyIndex(index);
        }
      }}>
        <View style = {styles.imageandname}>
          <Image style = {styles.userimage} source = {require('../../../assets/favicon.png')}></Image>
          <Text style = {styles.user}>{user}</Text>
        </View>
        <Text style = {styles.usercomment}>{userComment[index]}</Text>
        <Text style = {styles.date}>{date[index]}</Text>
      </TouchableOpacity>
    )
  );

    return(
      <MenuProvider>

        {modal}
        <KeyboardAvoidingView keyboardVerticalOffset = {100} behavior = {Platform.OS == 'ios' ? 'padding' : 'height'}  style ={styles.container}>

        <SafeAreaView>
        {/* <ScrollView ref={scrollRef} onContentSizeChange = {() =>{
            scrollRef.current.scrollToEnd({animated : true})
          }}> */}
          <ScrollView ref={scrollRef}>
            {/* 최상단 부분 */}
            <View style = {styles.topArea}>
              {/* 정보 상단 */}
              <View style = {styles.top}>
                {/* 더보기 줄 */}
                <View style = {{flexDirection : 'row', flex : 1}}>
                  <View style = {{flex : 7}}></View>

                  <View style = {{flex : 1, justifyContent : 'center', alignItems : 'center'}}>
                      <Menu>
                        <MenuTrigger style = {{margin : 10}}> 
                          <Icon name='ellipsis-vertical'size={30} color="black"></Icon>
                        </MenuTrigger>
                        <MenuOptions>
                          <MenuOption onSelect={() => alert('save')} text='수정'></MenuOption>
                          <MenuOption onSelect={() => alert('delete')} text='삭제'></MenuOption>
                        </MenuOptions>
                      </Menu>
                  </View>
                </View>
                {/* 로드맵 줄 */}
                <View style = {{flex : 1, justifyContent : 'center', alignItems : 'center'}}>
                  <Image style = {styles.mindMapImage} source ={require("../../img/loadmap_illustrate.png")}></Image>
                </View>
              </View>

              {/* 정보 하단 */}
              <View>
                <Text style = {styles.roadMapName}>{roadmap}</Text>
                <Text style = {styles.roadMapInfo}>{info}</Text>
                <TouchableOpacity style = {{flexDirection : 'row'}} onPress = {() =>{
                      props.navigation.navigate("RoadMap", {roadMapId : roadMapId, roadmap : roadmap})
                    }}>
                  <View style = {{flex : 3}}></View>
                  <Text style = {{flex : 1, color : 'blue', justifyContent : 'center', alignItems : 'center', fontSize : 20, fontWeight :'bold', margin : 10}}>로드맵 보기</Text>
                </TouchableOpacity>
              </View>
            </View>
                       
            {/* 하단 소셜 부분 */}
            <View style = {styles.bottomArea}>
              <View style = {{flexDirection : 'row', justifyContent : 'space-between', margin : 10}}>
                <View>
                    <Text style = {{fontSize : 30, fontWeight : 'bold'}} >댓글</Text>
                  </View>
                <TouchableOpacity style = {styles.like} onPress = {() => {
                  getLike();
                }}>
                  <Text style = {styles.like}>{like[0]}{like[1]}</Text>
                </TouchableOpacity>
              </View>

              <View style = {styles.insertcomment}>
                <TextInput style = {styles.comment} onChangeText = {
                  (inputText) => setInputText(inputText) 
                }>
                </TextInput>
                <TouchableOpacity style = {{flex : 1, justifyContent : 'center', alignItems : 'center', backgroundColor : 'white', borderColor : 'gray', borderWidth : 1,borderRadius : 10, marginLeft : 5}}
                onPress = {handleCommentButtonPress}>
                  <Text style = {styles.insert}>▷</Text>
                </TouchableOpacity>
              </View>

              {commentlist}            

            </View>
          </ScrollView>
        </SafeAreaView>
        </KeyboardAvoidingView>
      </MenuProvider>
    );
}
 
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height : '100%',
    flex: 1,
    flexDirection: 'column', // row
    backgroundColor: 'white',
  },


  mindMapImage : {
    height : hp("20%"),
    width : wp("80%"),
    justifyContent : 'center',
    alignItems : 'center',
    margin : 10,
    borderRadius : 10,
  },
  topArea : {
    flex : 1,
    backgroundColor : '#ffffff',
    shadowColor : "#000000",
    shadowOpacity : 0.3,
    shadowOffset : {width : 2, height : 2},
    elevation : 3,
    margin : 20
  },
  top : {
    flex : 1,
    backgroundColor : 'skyblue',
  },
  roadMapName : {
    flex : 1,
    margin : 10,
    fontWeight : 'bold',
    fontSize : 30,
  },
  roadMapInfo : {
    flex : 1,
    margin : 10,
    fontSize : 20
  },
  bottomArea : {
    margin : 10,
  },
  commentArea : {
    backgroundColor : '#ffffff',
    shadowColor : "#000000",
    shadowOpacity : 0.3,
    shadowOffset : {width : 2, height : 2},
    elevation : 3,
  },
  imageandname : {
    flexDirection : 'row',
    alignItems : 'center',
    margin : 5
  },
  like : {
    justifyContent : 'center',
    alignItems : 'center',
    fontSize : 25,
  },
  user : {
    fontSize : 20,
    fontWeight : 'bold',
    marginLeft : 10,
  },
  userimage : {
    height : hp('4%'),
    width : wp('9%'),
  },
  usercomment : {
    margin : 5,
    fontSize : 18
  },
  date : {
    marginLeft : 5,
    marginBottom : 5,
    color : 'gray'
  },
  insertcomment : {
    margin : 10,
    flexDirection : 'row',
    flex : 1,
  },
  comment : {
    height : 30,
    borderColor : 'gray',
    borderWidth : 1,
    borderRadius : 10,
    flex : 6
  },
  insert : {
    fontSize : 30,
  },
  modal:{
    backgroundColor:"#00000099",
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer:{
    backgroundColor:"#f9fafb",
    width:"80%",
    borderRadius:5
  },
  modalHeader:{
    
  },
  title:{
    fontWeight:"bold",
    fontSize:20,
    padding:15,
    color:"#000"
  },
  divider:{
    width:"100%",
    height:1,
    backgroundColor:"lightgray"
  },
  modalBody:{
    backgroundColor:"#fff",
    paddingVertical:20,
    paddingHorizontal:10
  },
  modalFooter:{
  },
  actions:{
    borderRadius:5,
    marginHorizontal:10,
    paddingVertical:10,
    paddingHorizontal:20
  },
  actionText:{
    color:"#fff"
  }
  });

export default RoadMapSocial;
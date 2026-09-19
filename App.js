import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Linking, SafeAreaView, Animated, Image } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [screen, setScreen] = useState('home');
  const [service, setService] = useState('install');
  const [step, setStep] = useState(0);
  const [myRequests, setMyRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ type: '', detail: '', area: '', urgency: '', cameras: 'Not sure - Need advice', property: 'House' });
  const [prices, setPrices] = useState({'1-2 Cameras':'2500','3-4 Cameras':'4500','5-8 Cameras':'7500','8+ Cameras':'11000','Not sure - Need advice':'3500',repairs:'450',upgrade:'1800',maintenance:'350',advice:'0',callout:'250'});

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true })
    ]).start();
    (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2c563d8323.mp3?filename=notification-113340.mp3' }, { shouldPlay: true, volume: 1.0 });
        setTimeout(() => sound.unloadAsync(), 2500);
      } catch(e) {}
    })();
    setTimeout(() => setShowSplash(false), 3200);
  }, []);

  const getQuote = () => service==='install'?parseInt(prices[form.cameras]||3500):service==='repairs'?450:service==='upgrade'?1800:350;
  const reset = () => setForm({ type: '', detail: '', area: '', urgency: '', cameras: 'Not sure - Need advice', property: 'House' });
  const sendWA = () => {
    const no='QP'+Math.floor(1000+Math.random()*9000);
    setMyRequests([{id:no,service,type:form.type,area:form.area,quote:getQuote()},...myRequests]);
    Linking.openURL(`https://wa.me/27752149924?text=${encodeURIComponent(`QUE-PAM ${service} ${no} - ${form.type} ${form.area} R${getQuote()}`)}`);
    setScreen('requests'); reset(); setStep(0);
  };

  if (showSplash) {
    return (
      <View style={styles.splash}>
        <Animated.View style={{ transform:[{scale}], opacity, alignItems:'center' }}>
          <Image source={require('./assets/logo.png')} style={{ width: 200, height: 200, borderRadius: 100 }} resizeMode="contain" />
          <Text style={styles.splashQP}>QUE-PAM</Text>
          <Text style={styles.splashSub}>CCTV SERVICES</Text>
          <Text style={styles.splashTag}>SECURE WHAT MATTERS</Text>
        </Animated.View>
        <Text style={styles.loading}>🔊 Sound ON</Text>
      </View>
    );
  }

  const Top = () => (
    <View style={styles.topNav}>
      <Pressable onPress={()=>setScreen('home')} style={[styles.topBtn, screen==='home'&&styles.topActive]}><Text style={[styles.topTxt, screen==='home'&&styles.topTxtA]}>HOME</Text></Pressable>
      <Pressable onPress={()=>setScreen('requests')} style={[styles.topBtn, screen==='requests'&&styles.topActive]}><Text style={[styles.topTxt, screen==='requests'&&styles.topTxtA]}>JOBS</Text></Pressable>
      <Pressable onPress={()=>setScreen('profile')} style={[styles.topBtn, screen==='profile'&&styles.topActive]}><Text style={[styles.topTxt, screen==='profile'&&styles.topTxtA]}>PROFILE</Text></Pressable>
    </View>
  );

  const Wrap = ({children}) => (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Top/>
        <ScrollView contentContainerStyle={{padding:24, paddingBottom: 120}}>{children}</ScrollView>
        <View style={styles.bottom}>
          <Pressable onPress={()=>setScreen('home')} style={styles.bItem}><Text style={[styles.bTxt, screen==='home'&&styles.bA]}>HOME</Text></Pressable>
          <Pressable onPress={()=>setScreen('requests')} style={styles.bItem}><Text style={[styles.bTxt, screen==='requests'&&styles.bA]}>REQUESTS</Text></Pressable>
          <Pressable onPress={()=>setScreen('profile')} style={styles.bItem}><Text style={[styles.bTxt, screen==='profile'&&styles.bA]}>PROFILE</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );

  if (screen==='requests') return (<Wrap><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Image source={require('./assets/logo.png')} style={{width:45,height:45,borderRadius:22}} /><View><Text style={styles.logo}>QUE-PAM</Text><Text style={styles.small}>MY REQUESTS</Text></View></View>{myRequests.length===0?<View style={styles.hero}><Text style={{color:'#888'}}>No requests yet</Text></View>:myRequests.map(r=><View key={r.id} style={styles.card}><Text style={styles.cardId}>{r.id} • {r.service}</Text><Text style={styles.cardQ}>R{r.quote}</Text></View>)}</Wrap>);
  if (screen==='profile') return (<Wrap><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Image source={require('./assets/logo.png')} style={{width:45,height:45,borderRadius:22}} /><View><Text style={styles.logo}>QUE-PAM</Text><Text style={styles.small}>PRICES</Text></View></View><Pressable style={[styles.btnS, isAdmin&&{borderColor:'#B7F000',borderWidth:2}]} onPress={()=>setIsAdmin(!isAdmin)}><Text style={[styles.btnSTxt, isAdmin&&{color:'#B7F000'}]}>{isAdmin?'ADMIN ON':'EDIT PRICES'}</Text></Pressable>{isAdmin&&<View style={styles.editBox}>{Object.keys(prices).map(k=><View key={k}><Text style={styles.editLabel}>{k}</Text><TextInput style={styles.editInput} value={prices[k]} onChangeText={v=>setPrices({...prices,[k]:v})} keyboardType="numeric"/></View>)}</View>}</Wrap>);

  if (screen==='flow') {
    const qs={install:[{t:'How many cameras?',f:'cameras',o:['1-2 Cameras','3-4 Cameras','5-8 Cameras','8+ Cameras','Not sure - Need advice']},{t:'Property?',f:'property',o:['House','Business / Shop','Apartment','Warehouse']},{t:'Where?',f:'type',o:['Indoor only','Outdoor only','Both']}],repairs:[{t:'What repair?',f:'type',o:['Camera not showing','No recording','Night vision','Phone viewing','Cable issue','Other']},{t:'How many?',f:'detail',o:['1 Camera','2 Cameras','All','DVR issue']}],upgrade:[{t:'Upgrade?',f:'type',o:['Add cameras','HD/4K','Phone viewing','Replace DVR','Night vision','Full upgrade']},{t:'Current?',f:'detail',o:['Analog','HD','IP','Not sure']}],maintenance:[{t:'Maintenance?',f:'type',o:['Check-up','Cleaning','Hard drive','Not recording','Annual']},{t:'Last?',f:'detail',o:['Never','<6 months','6-12 months','>1 year']}],advice:[{t:'Advice?',f:'type',o:['Best cameras','How many?','Indoor vs Outdoor','Budget','Security tips']},{t:'Size?',f:'detail',o:['Small','Medium','Large','Very large']}]};
    const list=qs[service];
    if(step<list.length){const q=list[step];return(<SafeAreaView style={styles.container}><View style={styles.inner}><Top/><ScrollView contentContainerStyle={{padding:24, paddingBottom: 120}}><Pressable onPress={()=>step===0?setScreen('services'):setStep(step-1)}><Text style={styles.back}>‹ BACK</Text></Pressable><Text style={styles.step}>STEP {step+1} OF {list.length+2}</Text><Text style={styles.title}>{q.t}</Text>{q.o.map(o=><Pressable key={o} style={[styles.opt, form[q.f]===o&&styles.optA]} onPress={()=>setForm({...form,[q.f]:o})}><Text style={[styles.optTxt, form[q.f]===o&&styles.optTxtA]}>{o}</Text></Pressable>)}<Pressable style={[styles.mainBtn,!form[q.f]&&{opacity:0.3}]} disabled={!form[q.f]} onPress={()=>setStep(step+1)}><Text style={styles.mainBtnTxt}>CONTINUE</Text></Pressable></ScrollView></View></SafeAreaView>);}
    if(step===list.length)return(<SafeAreaView style={styles.container}><View style={styles.inner}><Top/><ScrollView contentContainerStyle={{padding:24, paddingBottom: 120}}><Pressable onPress={()=>setStep(step-1)}><Text style={styles.back}>‹ BACK</Text></Pressable><Text style={styles.title}>Area & Urgency?</Text><TextInput style={styles.input} placeholder="Area e.g. Pinetown" placeholderTextColor="#666" value={form.area} onChangeText={t=>setForm({...form,area:t})}/>{['Urgent - Today','This week','Next week','Just planning'].map(o=><Pressable key={o} style={[styles.opt, form.urgency===o&&styles.optA]} onPress={()=>setForm({...form,urgency:o})}><Text style={[styles.optTxt, form.urgency===o&&styles.optTxtA]}>{o}</Text></Pressable>)}<Pressable style={[styles.mainBtn,(!form.area||!form.urgency)&&{opacity:0.3}]} disabled={!form.area||!form.urgency} onPress={()=>setStep(step+1)}><Text style={styles.mainBtnTxt}>QUOTE R{getQuote()}</Text></Pressable></ScrollView></View></SafeAreaView>);
    return(<SafeAreaView style={styles.container}><View style={styles.inner}><Top/><ScrollView contentContainerStyle={{padding:24, paddingBottom: 120}}><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Image source={require('./assets/logo.png')} style={{width:50,height:50,borderRadius:25}} /><Text style={styles.logo}>QUE-PAM</Text></View><View style={styles.hero}><Text style={styles.qPrice}>R{getQuote()}</Text><Text style={styles.qSub}>+ R{prices.callout} callout</Text><Text style={{color:'#fff',marginTop:15}}>• {form.type}</Text><Text style={{color:'#fff'}}>• {form.area}</Text></View><Pressable style={[styles.mainBtn,{backgroundColor:'#25D366'}]} onPress={sendWA}><Text style={styles.mainBtnTxt}>SEND WHATSAPP</Text></Pressable><Pressable style={styles.mainBtn} onPress={()=>{setScreen('home');reset();setStep(0);}}><Text style={styles.mainBtnTxt}>DONE</Text></Pressable></ScrollView></View></SafeAreaView>);
  }
  if(screen==='services')return(<Wrap><Pressable onPress={()=>setScreen('home')}><Text style={styles.back}>‹ BACK</Text></Pressable><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Image source={require('./assets/logo.png')} style={{width:50,height:50,borderRadius:25}} /><View><Text style={styles.logo}>QUE-PAM</Text><Text style={styles.small}>SERVICES</Text></View></View>{['install','repairs','upgrade','maintenance','advice'].map(id=><Pressable key={id} style={styles.btnS} onPress={()=>{setService(id);setScreen('flow');setStep(0);reset();}}><Text style={styles.btnSTxt}>{id.toUpperCase()} ✓</Text></Pressable>)}</Wrap>);

  return(<Wrap><View style={{flexDirection:'row',alignItems:'center',gap:12}}><Image source={require('./assets/logo.png')} style={{width:60,height:60,borderRadius:30}} /><View><Text style={styles.logo}>QUE-PAM</Text><Text style={styles.small}>CCTV SERVICES</Text></View></View><View style={styles.hero}><Text style={styles.heroSmall}>PROFESSIONAL CCTV</Text><Text style={styles.heroTitle}>SECURE WHAT MATTERS.</Text><Text style={styles.heroDesc}>Your exact logo + sound + fixed bottom</Text></View><Pressable style={styles.mainBtn} onPress={()=>setScreen('services')}><Text style={styles.mainBtnTxt}>REQUEST SERVICE</Text></Pressable></Wrap>);
}

const styles=StyleSheet.create({
  splash:{flex:1,backgroundColor:'#000',alignItems:'center',justifyContent:'center'},
  splashQP:{color:'#B7F000',fontSize:36,fontWeight:'900',letterSpacing:4,marginTop:22},
  splashSub:{color:'#fff',fontSize:13,letterSpacing:5,marginTop:4},
  splashTag:{color:'#B7F000',fontSize:10,letterSpacing:3,marginTop:12,fontWeight:'bold'},
  loading:{position:'absolute',bottom:50,color:'#666',fontSize:11},
  container:{flex:1,backgroundColor:'#0B0B0B'},
  inner:{flex:1},
  topNav:{flexDirection:'row',backgroundColor:'#111',padding:8,gap:6,borderBottomWidth:1,borderColor:'#222'},
  topBtn:{flex:1,backgroundColor:'#181818',padding:12,borderRadius:8,alignItems:'center',borderWidth:1,borderColor:'#333'},
  topActive:{backgroundColor:'#1e2600',borderColor:'#B7F000'},
  topTxt:{color:'#777',fontWeight:'900',fontSize:10},
  topTxtA:{color:'#B7F000'},
  bottom:{flexDirection:'row',backgroundColor:'#111',borderTopWidth:2,borderColor:'#B7F000',height:70,marginHorizontal:12,borderRadius:16,marginBottom:30, position:'absolute', bottom:0, left:0, right:0},
  bItem:{flex:1,alignItems:'center',justifyContent:'center', paddingVertical:12},
  bTxt:{color:'#777',fontWeight:'900',fontSize:11},
  bA:{color:'#B7F000'},
  logo:{color:'#B7F000',fontSize:28,fontWeight:'900',letterSpacing:2},
  small:{color:'#fff',fontSize:11,letterSpacing:2},
  hero:{backgroundColor:'#181818',borderRadius:18,padding:22,marginTop:15,marginBottom:15},
  heroSmall:{color:'#B7F000',fontSize:12,fontWeight:'bold',marginBottom:8},
  heroTitle:{color:'#fff',fontSize:26,fontWeight:'900',marginBottom:8},
  heroDesc:{color:'#BBB',fontSize:14},
  mainBtn:{backgroundColor:'#B7F000',padding:18,borderRadius:12,alignItems:'center',marginBottom:12},
  mainBtnTxt:{color:'#0B0B0B',fontSize:15,fontWeight:'900'},
  back:{color:'#B7F000',fontSize:16,fontWeight:'bold',marginBottom:15},
  step:{color:'#B7F000',fontSize:11,fontWeight:'bold',marginBottom:5},
  title:{color:'#fff',fontSize:20,fontWeight:'900',marginBottom:15},
  btnS:{backgroundColor:'#181818',borderWidth:1,borderColor:'#333',padding:16,borderRadius:12,marginBottom:10},
  btnSTxt:{color:'#fff',fontSize:15,fontWeight:'bold'},
  opt:{backgroundColor:'#181818',borderWidth:1,borderColor:'#333',padding:16,borderRadius:12,marginBottom:10},
  optA:{borderColor:'#B7F000',backgroundColor:'#1e2600'},
  optTxt:{color:'#fff',fontSize:15},
  optTxtA:{color:'#B7F000',fontWeight:'bold'},
  input:{backgroundColor:'#181818',borderWidth:1,borderColor:'#333',color:'#fff',padding:14,borderRadius:10,marginBottom:12,fontSize:15},
  qPrice:{color:'#B7F000',fontSize:36,fontWeight:'900'},
  qSub:{color:'#888',fontSize:12,marginTop:4},
  editBox:{backgroundColor:'#181818',borderRadius:15,padding:15,borderWidth:1,borderColor:'#B7F000',marginTop:10},
  editLabel:{color:'#fff',fontSize:11,fontWeight:'bold',marginTop:8,marginBottom:3},
  editInput:{backgroundColor:'#0B0B0B',borderWidth:1,borderColor:'#444',color:'#B7F000',padding:10,borderRadius:8,fontSize:15,fontWeight:'bold'},
  card:{backgroundColor:'#181818',borderRadius:12,padding:14,marginBottom:10,borderWidth:1,borderColor:'#333'},
  cardId:{color:'#B7F000',fontWeight:'bold',fontSize:11},
  cardQ:{color:'#B7F000',fontWeight:'900',fontSize:13,marginTop:6}
});
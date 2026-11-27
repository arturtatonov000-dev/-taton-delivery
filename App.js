import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, ScrollView, Pressable,
  StyleSheet, Alert
} from "react-native";

const GREEN = "#218447";
const CATS = ["Все", "Молочные продукты", "Хлеб и выпечка", "Овощи и фрукты", "Напитки", "Бакалея", "Сладости"];
const SAMPLE_PRODUCTS = [
  { id: "p1", name: "Молоко", category: "Молочные продукты", price: 90, unit: "1 л" },
  { id: "p2", name: "Хлеб", category: "Хлеб и выпечка", price: 45, unit: "1 шт." },
  { id: "p3", name: "Яблоки", category: "Овощи и фрукты", price: 130, unit: "1 кг" },
  { id: "p4", name: "Вода", category: "Напитки", price: 55, unit: "1,5 л" }
];
const DELIVERY = { "Чикола": 150, "Лескен": 500 };

export default function App() {
  const [tab, setTab] = useState("Каталог");
  const [category, setCategory] = useState("Все");
  const [cart, setCart] = useState({});
  const [products] = useState(SAMPLE_PRODUCTS);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("Чикола");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [search, setSearch] = useState("");

  const visible = products.filter(p =>
    (category === "Все" || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
  const total = subtotal + (DELIVERY[village] || 0);

  const add = id => setCart(old => ({...old, [id]: (old[id] || 0) + 1}));
  const remove = id => setCart(old => {
    const next = {...old}; next[id] = Math.max(0, (next[id] || 0) - 1);
    if (!next[id]) delete next[id]; return next;
  });

  function submitOrder() {
    if (!name.trim() || !phone.trim() || !address.trim() || count === 0) {
      Alert.alert("Заполните заказ", "Укажите имя, телефон, подробный адрес и добавьте товары в корзину.");
      return;
    }
    Alert.alert(
      "Форма заказа готова",
      `Покупатель: ${name}\nТелефон: ${phone}\nСело: ${village}\nАдрес: ${address}\nКомментарий: ${comment || "—"}\nТовары: ${count} шт.\nИтого: ${total} ₽\n\nПодключение отправки владельцу через WhatsApp и сохранения заказа на сервере будет следующим этапом.`
    );
  }

  const Button = ({title, onPress, secondary=false}) => (
    <Pressable onPress={onPress} style={[styles.button, secondary && styles.secondary]}>
      <Text style={[styles.buttonText, secondary && {color: GREEN}]}>{title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View><Text style={styles.logo}>ТАТОН</Text><Text style={styles.sub}>Доставка продуктов</Text></View>
        <Pressable onPress={() => setTab("Корзина")} style={styles.cartIcon}>
          <Text style={{fontSize: 20}}>🛒</Text><Text style={styles.cartCount}>{count}</Text>
        </Pressable>
      </View>
      <View style={styles.location}><Text style={{color:"#5D7864"}}>Доставка в</Text><Text style={styles.locationName}>📍 {village}</Text></View>
      <View style={styles.tabs}>
        {["Каталог", "Корзина", "Заказ"].map(t =>
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab===t && styles.activeTab]}>
            <Text style={{color: tab===t ? GREEN : "#65756A", fontWeight:"600"}}>{t}</Text>
          </Pressable>
        )}
      </View>

      {tab === "Каталог" && <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}><Text style={styles.heroTitle}>Покупки с доставкой на дом!</Text><Text style={styles.heroText}>Выбирайте продукты — мы доставим</Text></View>
        <TextInput value={search} onChangeText={setSearch} placeholder="Поиск товаров" style={styles.input}/>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:12}}>
          {CATS.map(c => <Pressable key={c} onPress={()=>setCategory(c)} style={[styles.chip, category===c && styles.chipActive]}><Text style={{color:category===c?"white":GREEN}}>{c}</Text></Pressable>)}
        </ScrollView>
        {visible.map(p => <View key={p.id} style={styles.product}>
          <View style={styles.productEmoji}><Text style={{fontSize:26}}>🛍️</Text></View>
          <View style={{flex:1}}><Text style={styles.productName}>{p.name}</Text><Text style={styles.muted}>{p.unit}</Text><Text style={styles.price}>{p.price} ₽</Text></View>
          <Pressable style={styles.add} onPress={()=>add(p.id)}><Text style={styles.addText}>+</Text></Pressable>
          {!!cart[p.id] && <Text style={styles.qty}>{cart[p.id]}</Text>}
        </View>)}
        <Text style={styles.note}>Показаны демонстрационные товары. Реальный каталог и цены добавит владелец.</Text>
      </ScrollView>}

      {tab === "Корзина" && <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Ваша корзина</Text>
        {products.filter(p=>cart[p.id]).map(p=><View key={p.id} style={styles.product}>
          <View style={{flex:1}}><Text style={styles.productName}>{p.name}</Text><Text style={styles.muted}>{p.price} ₽ × {cart[p.id]}</Text></View>
          <Pressable style={styles.counter} onPress={()=>remove(p.id)}><Text>−</Text></Pressable>
          <Text style={styles.qty}>{cart[p.id]}</Text>
          <Pressable style={styles.counter} onPress={()=>add(p.id)}><Text>+</Text></Pressable>
        </View>)}
        {!count && <Text style={styles.muted}>Корзина пока пустая. Добавьте товары из каталога.</Text>}
        <Button title="Перейти к оформлению" onPress={()=>setTab("Заказ")}/>
      </ScrollView>}

      {tab === "Заказ" && <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Оформление заказа</Text>
        <Text style={styles.label}>Имя клиента</Text><TextInput value={name} onChangeText={setName} placeholder="Ваше имя" style={styles.input}/>
        <Text style={styles.label}>Телефон</Text><TextInput value={phone} onChangeText={setPhone} placeholder="+7 ..." keyboardType="phone-pad" style={styles.input}/>
        <Text style={styles.label}>Село доставки</Text>
        <View style={styles.villages}>{["Чикола","Лескен"].map(v=><Pressable key={v} onPress={()=>setVillage(v)} style={[styles.village, village===v && styles.villageActive]}><Text style={{color:village===v?"white":GREEN}}>{v} · {DELIVERY[v]} ₽</Text></Pressable>)}</View>
        <Text style={styles.label}>Подробный адрес доставки</Text><TextInput value={address} onChangeText={setAddress} placeholder="Улица, дом, ориентир" style={styles.input}/>
        <Text style={styles.label}>Комментарий к заказу</Text><TextInput value={comment} onChangeText={setComment} placeholder="Дополнительные пожелания" multiline style={[styles.input,{height:90,textAlignVertical:"top"}]}/>
        <View style={styles.total}><Text style={styles.totalText}>Товары: {subtotal} ₽</Text><Text style={styles.totalText}>Доставка: {DELIVERY[village] || 0} ₽</Text><Text style={styles.totalBig}>Итого: {total} ₽</Text></View>
        <Button title="Подтвердить заказ" onPress={submitOrder}/>
        <Text style={styles.note}>SMS-вход, сервер заказов и отправка в WhatsApp подключаются после настройки аккаунтов владельца.</Text>
      </ScrollView>}
      <View style={styles.footer}><Text style={styles.footerText}>ТАТОН · Доставка продуктов</Text></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 safe:{flex:1,backgroundColor:"#F7FAF7"}, header:{padding:18,backgroundColor:"white",flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
 logo:{fontSize:27,fontWeight:"900",color:GREEN,letterSpacing:1},sub:{color:"#718477",fontSize:12},cartIcon:{backgroundColor:"#EAF5EC",padding:10,borderRadius:14,flexDirection:"row",gap:5},cartCount:{color:GREEN,fontWeight:"800"},
 location:{backgroundColor:"white",paddingHorizontal:18,paddingBottom:12},locationName:{fontWeight:"700",color:"#203B2A",marginTop:3},
 tabs:{flexDirection:"row",backgroundColor:"white",borderTopWidth:1,borderColor:"#EDF1ED"},tab:{flex:1,padding:13,alignItems:"center"},activeTab:{borderBottomWidth:3,borderColor:GREEN},
 content:{padding:16,paddingBottom:30},hero:{backgroundColor:"#DCEFE0",borderRadius:18,padding:20,marginBottom:14},heroTitle:{fontSize:21,fontWeight:"800",color:"#176B37"},heroText:{color:"#426C50",marginTop:6},
 input:{backgroundColor:"white",borderWidth:1,borderColor:"#E0E9E1",borderRadius:12,padding:13,color:"#203B2A",marginTop:6},
 chip:{paddingHorizontal:14,paddingVertical:9,borderRadius:20,backgroundColor:"#EAF5EC",marginRight:8},chipActive:{backgroundColor:GREEN},
 product:{backgroundColor:"white",borderRadius:14,padding:12,marginBottom:10,flexDirection:"row",alignItems:"center",gap:12,borderWidth:1,borderColor:"#EDF2ED"},
 productEmoji:{width:52,height:52,backgroundColor:"#F0F7F1",borderRadius:12,alignItems:"center",justifyContent:"center"},productName:{fontWeight:"700",color:"#203B2A",fontSize:15},muted:{color:"#7A897D",fontSize:12,marginTop:3},price:{color:GREEN,fontWeight:"800",marginTop:4},
 add:{backgroundColor:GREEN,width:36,height:36,borderRadius:12,alignItems:"center",justifyContent:"center"},addText:{color:"white",fontSize:24,fontWeight:"700"},qty:{color:GREEN,fontWeight:"800",minWidth:18,textAlign:"center"},
 heading:{fontSize:22,fontWeight:"800",color:"#203B2A",marginBottom:15},label:{fontWeight:"700",color:"#365A40",marginTop:13},villages:{flexDirection:"row",gap:8,marginTop:8},village:{padding:12,borderRadius:12,backgroundColor:"#EAF5EC"},villageActive:{backgroundColor:GREEN},
 total:{backgroundColor:"#EAF5EC",padding:16,borderRadius:14,marginVertical:18},totalText:{color:"#426C50",marginBottom:5},totalBig:{fontSize:20,fontWeight:"900",color:GREEN,marginTop:5},
 button:{backgroundColor:GREEN,padding:16,borderRadius:14,alignItems:"center",marginTop:16},buttonText:{color:"white",fontWeight:"800",fontSize:16},secondary:{backgroundColor:"#EAF5EC"},
 note:{fontSize:12,color:"#819084",lineHeight:18,marginTop:14},footer:{padding:12,alignItems:"center",backgroundColor:"white",borderTopWidth:1,borderColor:"#EDF1ED"},footerText:{fontSize:11,color:"#819084"}
});

import { createContext, useEffect } from "react";
import { useState } from "react";
import axios from "axios";
export const StoreContext=createContext(null);
const StoreContextProvider=(props)=>{
    const url="http://localhost:4000";
    const [token,setToken]=useState("");
    const [food_list,setFoodlist]=useState([]);
    const [cartItems,setCartItems]=useState({});
    const addToCart=async (itemId)=>{
        if(!cartItems[itemId]){
            setCartItems((prev)=>({...prev,[itemId]:1}))
        }
        else{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        }
        if(token){
            await axios.post(`${url}/api/cart/add`,{itemId},{headers:{token}})
        }
    }
    const removeFromCart=async (itemId)=>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
        if(token){
            await axios.post(`${url}/api/cart/remove`,{itemId},{headers:{token}})
        }
    }
    
    const getTotalCartAmount=()=>{
        let totalAmount=0;
        for(const item in cartItems){
            if(cartItems[item]>0){
                let itemInfo=food_list.find((product)=>{
                return product._id===item
           })
           totalAmount+=itemInfo.price*cartItems[item];}
            
        }
        return totalAmount;
    }
   
    const loadCartData = async (token) => {
        try {
            const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } });
            if (response.data && response.data.cartData) {
                setCartItems(response.data.cartData);
            } else {
                console.error("Invalid response format:", response);
                
            }
        } catch (error) {
            console.error("Error loading cart data:", error);
           
        }
    };
    const fetchFoodList=async ()=>{
        try{
            const response=await axios.get(url+"/api/food/list")
        setFoodlist(response.data.data)
        }
        catch(error){
            console.log(error)
        }
        
}
    useEffect(()=>{
        async function loadData(){
            await fetchFoodList();
            if(localStorage.getItem("token")){
                setToken(localStorage.getItem("token"))
                await loadCartData(localStorage.getItem("token"));
            }
        }
        loadData();
    },[])
    const contextValue={
            food_list,
            cartItems,
            setCartItems,
            addToCart,
            removeFromCart,
            getTotalCartAmount,
            url,
            token,
            setToken
    }
    return(
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
}
export default StoreContextProvider;
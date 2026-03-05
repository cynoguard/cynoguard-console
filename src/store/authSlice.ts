import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState{
    userId:string | null;
    email: string | null;
    firebaseId:string | null;
    firstName: string | null;
    lastName: string | null;
}



const initialState:AuthState = {
    userId: null,
    firebaseId:null,
    email: null,
    firstName: null,
    lastName: null,
}

export const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        setAuth:(_,action:PayloadAction<AuthState>)=>{
            return action.payload;
        },
        setUserId: (state, action: PayloadAction<string | null>) => {
          state.userId = action.payload;
        },
        setEmail: (state, action: PayloadAction<string | null>) => {
            state.email = action.payload;
        },
        setFirstName: (state, action: PayloadAction<string | null>) => {
            state.firstName = action.payload;
        },
        setLastName: (state, action: PayloadAction<string | null>) => {
            state.lastName = action.payload;
        },
        clearAuth:()=>initialState,
    }
});

export const {setAuth,setUserId,setEmail,setFirstName,setLastName,clearAuth} = authSlice.actions;
export default authSlice.reducer;
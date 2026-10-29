package com.loose.coupling;

public class UserManager {
//    private UserDatabaseProvider userDatabaseProvider = new UserDatabaseProvider();
//    public String getUserInfo(){
//        return userDatabaseProvider.getUserDetails();
//    }
    private UserDataProvider userDataProvider;

    public UserManager(UserDataProvider userDataProvider){
        this.userDataProvider = userDataProvider;
    }

    public String getUserInfo(){
        System.out.print("UserManager - ");
        return userDataProvider.getUserDetails();
    }
}

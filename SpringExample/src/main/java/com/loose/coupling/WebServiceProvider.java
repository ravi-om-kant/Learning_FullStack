package com.loose.coupling;

public class WebServiceProvider implements UserDataProvider{
    @Override
    public String getUserDetails(){
        return "User Details from Web Service Provider";
    }
}

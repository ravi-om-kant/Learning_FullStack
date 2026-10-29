package com.ioc.coupling;

public class WebServiceProvider implements UserDataProvider {
    @Override
    public String getUserDetails(){
        return "User Details from Web Service Provider";
    }
}

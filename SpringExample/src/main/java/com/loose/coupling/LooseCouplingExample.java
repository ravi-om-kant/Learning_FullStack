package com.loose.coupling;

import com.tight.coupling.UserDatabase;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class LooseCouplingExample {

    public static void main(String[] args) {
//        UserManager userManager = new UserManager();
//        System.out.println(userManager.getUserInfo());
//        System.out.println(userDataProvider.getUserDetails());
        UserDataProvider userDataProvider = new UserDatabaseProvider();
        UserManager userManagerWithDB = new UserManager(userDataProvider);
        System.out.println(userManagerWithDB.getUserInfo());

        UserDataProvider userDataProvider1 = new NewDatabaseProvider();
        UserManager userManagerWithDB1 = new UserManager(userDataProvider1);
        System.out.println(userManagerWithDB1.getUserInfo());

        WebServiceProvider webServiceProvider = new WebServiceProvider();
        UserManager userManagerWithWebService = new UserManager(webServiceProvider);
        System.out.println(userManagerWithWebService.getUserInfo());

//        System.out.println("Using Bean implementation ----");
//        ApplicationContext context = new ClassPathXmlApplicationContext("applicationLooseCouplingBeanInjection.xml");
//        UserManager userDatabaseBean = (UserManager) context.getBean("userManagerDatabaseProvider");
//        System.out.println("Bean: "+userDatabaseBean.getUserInfo());
//
//        UserManager userManagerWebService = (UserManager) context.getBean("userManagerWebService");
//        System.out.println("Bean: "+userManagerWebService.getUserInfo());
//
//        UserManager userManagerNewDatabase = (UserManager) context.getBean("userManagerNewUser");
//        System.out.println("Bean: "+userManagerNewDatabase.getUserInfo());

    }
}

package car.example.bean;

public class MyBean {
    private String message;
    private String name;

    public void setMessage(String message){
        this.message = message;
    }

    public String getMessage(){
        System.out.println("Message: "+message);
        return this.message;
    }

    @Override
    public String toString(){
        return "MyBean [message="+message+",  name="+name+"]";
    }
}

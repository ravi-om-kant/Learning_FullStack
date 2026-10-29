package car.example.autowire.constructor;

public class Car {
    private Specification specification;
    public Car(Specification specification) {
        this.specification = specification;
    }

//    public void setSpecification(Specification specification) {
//        this.specification = specification;
//    }

    public void displayDetails() {
        System.out.println("Auto wire by Constructor Car Details: "+specification.toString());
    }

}

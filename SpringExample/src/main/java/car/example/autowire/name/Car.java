package car.example.autowire.name;

public class Car {
    private Specification specification;
    private Specification specification2;
//    public Car(Specification specification) {
//        this.specification = specification;
//    }

    /**
     * By Name injection is happen through setter as bean is configurate byName
     * <bean id="myCar" class="car.example.autowire.name.Car" autowire="byName"/>
     * @param specification
     */
    public void setSpecification(Specification specification) {
        this.specification = specification;
    }
    // For Bean By Name specification2
    public void setSpecification2(Specification specification2) {
        this.specification2 = specification2;
    }
    public void  displayDetails() {
        System.out.println("Auto wire by Name Car Details: "+specification.toString());
        System.out.println("Auto wire by Name Car Details: "+specification2.toString());
    }


}

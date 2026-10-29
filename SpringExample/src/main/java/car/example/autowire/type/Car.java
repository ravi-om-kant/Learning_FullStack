package car.example.autowire.type;

public class Car {
    private Specification specification;

    public void setSpecification(Specification specification) {
        this.specification = specification;
    }

    public void displayDetails() {
        System.out.println("Auto wire by Type Car Details: "+specification.toString());
    }

}

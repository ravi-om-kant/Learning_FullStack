package car.example.setter.injection;

public class Car {
    private Specification specification;

    public void setSpecification(Specification specification){
        this.specification = specification;
    }

    public Specification getSpecification(){
        return this.specification;
    }

    public void displayDetails() {
        System.out.println(specification.toString());
    }

}

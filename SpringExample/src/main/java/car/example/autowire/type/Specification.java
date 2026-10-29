package car.example.autowire.type;

public class Specification {
    private String model;
    private String manufacturer;

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    @Override
    public String toString() {
        return "Specification{" + "model=" + model + ", manufacturer=" + manufacturer + '}';
    }

}

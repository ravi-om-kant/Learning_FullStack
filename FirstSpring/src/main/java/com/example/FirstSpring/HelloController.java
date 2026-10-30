package com.example.FirstSpring;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/hello")
public class HelloController {

    @RequestMapping(method = RequestMethod.GET)
    public HelloResponse sayHello() {
        return new HelloResponse("Hello Worlds!");
    }

    @GetMapping("/{name}")
    public HelloResponse sayHello(@PathVariable String name) {
        return new HelloResponse("Hello : " + name);
    }
//    public String sayHello() {
//        return new HelloResponse("Hello World!").getMessage();
//    }

    @PostMapping("/hello")
    public HelloResponse sayHelloPost(@RequestBody String name) {
        return new HelloResponse("Hello: "+name);
    }
}

package com.example.autowire.annotation;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/** -------------- NOTES: ----------------
 * We need to tell spring, to refer to this class for all the configuration and that we have to specify using configuration annotation.
 *
 */
@Configuration
@ComponentScan(basePackages = "com.example.autowire.annotation")
public class AppConfig {

}

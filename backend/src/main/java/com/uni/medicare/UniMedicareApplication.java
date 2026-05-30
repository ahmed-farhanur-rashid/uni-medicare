package com.uni.medicare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAspectJAutoProxy
@EnableAsync
public class UniMedicareApplication {
    public static void main(String[] args) {
        SpringApplication.run(UniMedicareApplication.class, args);
    }
}

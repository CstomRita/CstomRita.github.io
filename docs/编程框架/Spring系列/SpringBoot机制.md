@autoHeader: 2.1.1.1.1.1


<p align="right">update time : {docsify-updated}</p>

## 自动装配

> [!tip]
>
> **springboot是一个脚手架工具，约定大于配置。**
>
> **只需要按照springboot的规范来开发，就能减少很多配置**

### 概述

#### 没有自动装配时

在springboot之前，spring、springmvc中开启某些 Spring 特性或者引入第三方依赖的时候，还是需要用 XML 或 Java 进行显式配置。

例如，在MVC中我们使用容器依赖的bean的时候需要在xml中配置声明才能使用，如：

- xml中配置dispatcherServlet和filter

![image-20231128150302825](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128150302825.png)

- 在bean.xml配置视图解析器、文件上传multipartResolver、数据源等配置

![image-20231128150401438](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128150401438.png)

没用使用自动装配之前，这些庞杂的web配置是每一个项目必须的。首先在pom中引入相关的jar，再在xml中一遍一遍的配置这些东西， 十分复杂低效。

#### 自动装配之后

Spring Boot 项目，我们只需要添加`spring-boot-starter-xxx`相关依赖，无需配置，通过 Spring Boot 的全局配置文件 `application.properties`或`application.yml`即可对项目进行设置比如更换端口号等等，直接启动即可。

例如：

- 引入web包的starter启动器

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

- 启动springboot项目之后，就能看到所有的bean。这些bean在容器加载的时候就会把bean自动加载进来。

```java
@SpringBootApplication(scanBasePackages = "com.thits")
@ImportResource(value = "bean.xml") //装配xml文件配置的bean
 
public class SpringBoot1Application {
 
    public static void main(String[] args) {
        //返回ioc容器
        ConfigurableApplicationContext run = SpringApplication.run(SpringBoot1Application.class, args);
        //获取容器中的所有bean
        String[] beanDefinitionNames = run.getBeanDefinitionNames();
        for (String beanDefinitionName : beanDefinitionNames) {
            System.out.println("bean的名字："+beanDefinitionName);
        }
    }
 
}
```

![image-20231128151023952](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128151023952.png)

可以看到控制台的各种bean已经被spring容器管理了。 比如multipartResolver、DispatcherServlet、视图解析器、事务管理器等可以直接使用，不需要在xml中额外配置。

### 原理

#### 启动类SpringBootApplication

```java
@SpringBootApplication
public class SpringBoot1Application {
    //程序的主入口
    public static void main(String[] args) {
        SpringApplication.run(SpringBoot1Application.class, args);
    }
 
}
```

在启动类中有一个注解就是@SpringBootApplication，他有三个子注解，子注解又有其他的注解，搞清楚这些注解的意思就能理解自动装配了。

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
<1.>@SpringBootConfiguration
<2.>@ComponentScan
<3.>@EnableAutoConfiguration
public @interface SpringBootApplication {

}
```

1. @SpringBootConfiguration ：有一个子注解Configuaration
   - @Configuaration ：允许在上下文中注册额外的 bean 或导入其他配置类有一个子注解:Component
     - @Component ：声明为bean

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration //实际上它也是一个配置类
public @interface SpringBootConfiguration {
}
```

2. @EnableAutoConfiguration：启用 SpringBoot 的自动配置机制，有两个子注解）

   - @AutoConfigurationPackage  （自动配置包：有一个子注解，import）
     - @Import({Registrar.class})      (没有子注解)
   - @Import({AutoConfigurationImportSelector.class})    (没有子注解)

3. @ComponentScan  ：组件扫描：没有子注解，作用：包扫描项目包路径

**在这三个注解中，第一和第三都没有太大的意思，主要看第二个注解就好了。在第二个注解中使用了两个@import注解。就是这两个注解解释了自动装配的含义。**

#### @EnableAutoConfiguration

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage //作用：将main包下的所有组件注册到容器中
@Import({AutoConfigurationImportSelector.class}) //加载自动装配类 xxxAutoconfiguration
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

    Class<?>[] exclude() default {};

    String[] excludeName() default {};
}

```

##### @AutoConfigurationPackage

@AutoConfigurationPackage有一个子注解`@Import({Registrar.class})  `

 **@Import({Registrar.class})源码的作用就是：主启动类注册到容器，也就是main方法所在的包下边，将所有的我们自己的代码中的配置注入的bean容器。**

![image-20231128165109028](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128165109028.png)

##### @Import注解

Import注解的作用：也是注入第三方类让他变成容器管理的bean.

与@Configuration+@bean组合使用的方式相比，功能更加单一，但是更加暴力简单。

###### @import（类.class） 

直接指定类让容器管理。

![image-20231128171343055](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128171343055.png)

###### @import（选择器.class） 

实现选择器，让选择器可以使用数组，把很多类都注入到容器中，这就是依赖注入的核心代码。

![image-20231128171500806](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128171500806.png)

##### @Import({AutoConfigurationImportSelector.class})

加载自动装配类 xxxAutoconfiguration

###### AutoConfigurationImportSelector 

```java
public class AutoConfigurationImportSelector implements DeferredImportSelector, BeanClassLoaderAware, ResourceLoaderAware, BeanFactoryAware, EnvironmentAware, Ordered {

}
public interface DeferredImportSelector extends ImportSelector {

}
public interface ImportSelector {
    String[] selectImports(AnnotationMetadata var1);
}
```

`AutoConfigurationImportSelector` 类实现了 `ImportSelector`接口，也就实现了这个接口中的 `selectImports`方法，该方法主要用于**获取所有符合条件的类的全限定类名，这些类需要被加载到 IoC 容器中**。

###### selectImports方法流程

> [!Note] 是一种SPI机制的应用。

![image-20231128165621331](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128165621331.png)

```java
private static final AutoConfigurationEntry EMPTY_ENTRY = new AutoConfigurationEntry();

AutoConfigurationEntry getAutoConfigurationEntry(AutoConfigurationMetadata autoConfigurationMetadata, AnnotationMetadata annotationMetadata) {
        //<1>.
        if (!this.isEnabled(annotationMetadata)) {
            return EMPTY_ENTRY;
        } else {
            //<2>.
            AnnotationAttributes attributes = this.getAttributes(annotationMetadata);
            //<3>.
            List<String> configurations = this.getCandidateConfigurations(annotationMetadata, attributes);
            //<4>.
            configurations = this.removeDuplicates(configurations);
            Set<String> exclusions = this.getExclusions(annotationMetadata, attributes);
            this.checkExcludedClasses(configurations, exclusions);
            configurations.removeAll(exclusions);
            configurations = this.filter(configurations, autoConfigurationMetadata);
            this.fireAutoConfigurationImportEvents(configurations, exclusions);
            return new AutoConfigurationImportSelector.AutoConfigurationEntry(configurations, exclusions);
        }
    }

```

**<1>**

判断自动装配开关是否打开。默认`spring.boot.enableautoconfiguration=true`，可在 `application.properties` 或 `application.yml` 中设置。

![image-20231128165759200](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128165759200.png)

**<2>**

用于获取`EnableAutoConfiguration`注解中的 `exclude` 和 `excludeName`，即排除自动装配的类名。

![img](SpringBoot%E6%9C%BA%E5%88%B6.assets/3d6ec93bbda1453aa08c52b49516c05a~tplv-k3u1fbpfcp-zoom-1.png)

**<3>**

获取需要自动装配的所有配置类，读取`META-INF/spring.factories`，获取自动装载类xxxAutoConfiguration的全限定名。

![image-20231128172002456](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128172002456.png)

![image-20231128170536727](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128170536727.png)

所有 Spring Boot Starter 下的`META-INF/spring.factories`都会被读取到。

![image-20231128172100772](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128172100772.png)

**<4>**

Condition按需加载，根据XXXAutoConfiguration的设置，在里边的条件@conditional判断是否满足加载这些配置类的条件，进行筛选出真正需要管理的配置类。

> 条件注解包括
>
> - `@ConditionalOnBean`：当容器里有指定 Bean 的条件下
> - `@ConditionalOnMissingBean`：当容器里没有指定 Bean 的情况下
> - `@ConditionalOnSingleCandidate`：当指定 Bean 在容器中只有一个，或者虽然有多个但是指定首选 Bean
> - `@ConditionalOnClass`：当类路径下有指定类的条件下
> - `@ConditionalOnMissingClass`：当类路径下没有指定类的条件下
> - `@ConditionalOnProperty`：指定的属性是否有指定的值
> - `@ConditionalOnResource`：类路径是否有指定的值
> - `@ConditionalOnExpression`：基于 SpEL 表达式作为判断条件
> - `@ConditionalOnJava`：基于 Java 版本作为判断条件
> - `@ConditionalOnJndi`：在 JNDI 存在的条件下差在指定的位置
> - `@ConditionalOnNotWebApplication`：当前项目不是 Web 项目的条件下
> - `@ConditionalOnWebApplication`：当前项目是 Web 项 目的条件下




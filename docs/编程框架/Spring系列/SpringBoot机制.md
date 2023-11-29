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

2. @EnableAutoConfiguration：启用 SpringBoot 的自动配置机制，有两个子注解）

   - @AutoConfigurationPackage  （自动配置包：有一个子注解，import）
     - @Import({Registrar.class})      (没有子注解)
   - @Import({AutoConfigurationImportSelector.class})    (没有子注解)
3. @ComponentScan  ：组件扫描：没有子注解，作用：包扫描项目包路径

其实在Spring Boot 1.2版之前，都还没开始使用@SpringBootApplication这个注解，而是使用以上三个注解启动项目。

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
public class SpringBoot {
 public static void main(String[] args) {
  SpringApplication.run(SpringBoot.class, args);
 }
}
```

> 在这三个注解中主要看第二个注解就好了。在第二个注解中使用了两个@import注解。就是这两个注解解释了自动装配的含义。

#### @SpringBootConfiguration

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration //实际上它也是一个配置类
public @interface SpringBootConfiguration {
}
```

可以看到，除去元注解，剩下的@Configuration注解。springboot为什么可以去除xml配置，靠的就是@Configuration这个注解。

所以，它的作用就是将当前类申明为配置类，同时还可以使用@bean注解将类以方法的形式实例化到spring容器，而方法名就是实例名。

```java
@Configuration
public class TokenAutoConfiguration {
 @Bean
 public TokenService tokenService() {
  return new TokenService();
 }
}
```

作用等同于xml配置文件的

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tx="http://www.springframework.org/schema/tx"
 xmlns:context="http://www.springframework.org/schema/context"
 xmlns:cache="http://www.springframework.org/schema/cache" xmlns:mvc="http://www.springframework.org/schema/mvc"
 xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.1.xsd 
       http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-3.1.xsd 
       http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.1.xsd
       http://www.springframework.org/schema/cache http://www.springframework.org/schema/cache/spring-cache.xsd
       http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.0.xsd ">
    <!--实例化bean-->
  <bean id="tokenService" class="TokenService"></bean>
</beans>
```

#### @CompentScan

作用就是扫描当前包以及子包，将有@Component，@Controller，@Service，@Repository等注解的类注册到容器中，以便调用。

如果@ComponentScan不指定basePackages，那么默认扫描当前包以及其子包，而@SpringBootApplication里的@ComponentScan就是默认扫描，所以我们一般都是把springboot启动类放在最外层，以便扫描所有的类。

#### @EnableAutoConfiguration(重点)

> [!Note] 通过扫描classpath的META-INF/spring.factories配置文件，将其中的 org.springframework.boot.autoconfigure.EnableAutoConfiguration 对应的配置项实例化并且注册到spring容器。

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

实际上，为了优化性能，实际上读取的是`META-INF/spring-autoconfigure-metadata.properties` ，是一个Spring Boot自动配置的元数据文件。它包含了有关自动配置类的信息，包括它们的条件和过滤规则。

> [!tip]这个文件是由Spring Boot在构建时自动生成的，用于优化自动配置的性能。

这个文件存储的是“待自动装配候选类”的过滤计算规则，框架会根据里面的规则逐一对候选类进行计算看是否需要被自动装配进容器，并不是全部加载。这样可以提高自动配置的性能，避免不必要的计算。

让我们看一个例子。假设我们有一个自动配置类`com.example.FooAutoConfiguration`，它有一个条件`@ConditionalOnClass(Bar.class)`，那么，`spring-autoconfigure-metadata.properties`可能包含如下内容：

```com.example.FooAutoConfiguration.ConditionalOnClass=com.example.Bar```

这意味着`FooAutoConfiguration`的加载是有条件的，只有当类路径上存在`Bar`类时，`FooAutoConfiguration`才会被加载。通过这种方式，Spring Boot可以在不加载`Bar`类的情况下快速决定是否应加载`FooAutoConfiguration`，从而提高启动性能。

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

###### selectImport方法总结

1.获取EnableAutoConfiguration的值。

2.获取主类上的exclude类，并从EnableAutoConfiguration集合中排除。

3.加载META-INF/spring-autoconfigure-metadata.properties文件中的内容

4.应用程序会循环遍历所有的`AutoConfigurationImportFilter`实现类，并对每个实现类执行以下操作：

- 调用实现类的`match`方法，传入当前要处理的自动配置类和应用程序上下文。
- 如果`match`方法返回`true`，则表示当前自动配置类满足条件，可以生效。否则，表示当前自动配置类不满足条件，应该被排除。
- 这个过程会不断重复，直到所有的自动配置类都被处理完毕。

最终，只有满足条件的自动配置类才会生效。

#### 加载时机

spring.factories被加载到Spring的时机为，所有的扫描结束后进行加载。

@SpringBootApplication的扫描顺序为：

1.创建spring容器。

2.Spring Framework先去解析Configuration，然后执行@ComponentScan，扫描Bean。

3.当扫描结束，开始解析到@Import(AutoConfigurationImportSelector.class)，由于他是延迟加载，所以在所有的扫描结束后才会去执行selectImports，然后将方法返回值去解析每个值都会去执行processImports方法。

### Spring Factories

Spring Boot自动装配的这套机制，也称为Spring Factories机制。

Spring Factories。它允许开发人员在META-INF/spring.factories文件中配置接口的实现类名称，然后在程序中读取这些配置文件并实例化。这种机制类似于Java的SPI机制，可以用来实现模块化和可扩展性。

#### SpringFactoriesLoader

Spring Factories机制的底层实现是基于SpringFactoriesLoader类。

这个类会在程序启动时检索ClassLoader中所有jar包（包括ClassPath下的所有模块）引入的META-INF/spring.factories文件，然后基于文件中的接口（或者注解）加载对应的实现类并且注册到IOC容器。

SpringFactoriesLoader主要方法：

- loadFactories 根据接口类获取其实现类的实例，这个方法返回的是对象列表。
- loadFactoryNames 根据接口获取其接口类的名称，这个方法返回的是类名的列表。
- instantiateFactory：私有方法，根据类创建实例对象，通过反射机制实例化对象。

##### loadFactories

```java
SpringFactoriesLoader.loadFactories(MyService.class, null);
```

这段代码会调用 `loadFactories` 方法，传入 `MyService.class` 和 `null` 作为参数。该方法会搜索类路径下所有的 `spring.factories` 文件，找到指定类型的实现类。最后，该方法返回一个接口的实现类对象（即 `MyServiceImpl1` 和 `MyServiceImpl2`）列表。

```java
public static <T> List<T> loadFactories(Class<T> factoryClass, @Nullable ClassLoader classLoader) {
    Assert.notNull(factoryClass, "'factoryClass' must not be null");
   
    ClassLoader classLoaderToUse = classLoader;
    if (classLoaderToUse == null) {
        classLoaderToUse = SpringFactoriesLoader.class.getClassLoader();
    }
    // 调用loadFactoryNames获取接口的实现类
    List<String> factoryNames = loadFactoryNames(factoryClass, classLoaderToUse);
    if (logger.isTraceEnabled()) {
        logger.trace("Loaded [" + factoryClass.getName() + "] names: " + factoryNames);
    }
    // 遍历 factoryNames 数组，创建实现类的对象
    List<T> result = new ArrayList<>(factoryNames.size());
    for (String factoryName : factoryNames) {
        result.add(instantiateFactory(factoryName, factoryClass, classLoaderToUse));
    }
    // 排序
    AnnotationAwareOrderComparator.sort(result);
    return result;
}
```

##### loadFactoryNames

```java
 SpringFactoriesLoader.loadFactoryNames(MyService.class, null);
```

这段代码会调用 `loadFactoryNames` 方法，传入 `MyService.class` 和 `null` 作为参数。该方法会搜索类路径下所有的 `spring.factories` 文件，找到指定类型的类路径，并返回对应的类名称的列表。最后，该方法返回一个实现类的<font color=red>**全限定名**</font>（即 `"example.MyServiceImpl1"` 和 `"example.MyServiceImpl2"`）的列表。

```java
public static List<String> loadFactoryNames(Class<?> factoryClass, ClassLoader classLoader) {
    String factoryClassName = factoryClass.getName();
    try {
        Enumeration<URL> urls = (classLoader != null ? classLoader.getResources(FACTORIES_RESOURCE_LOCATION) :
                ClassLoader.getSystemResources(FACTORIES_RESOURCE_LOCATION));
        List<String> result = new ArrayList<String>();
        while (urls.hasMoreElements()) {
            URL url = urls.nextElement();
            Properties properties = PropertiesLoaderUtils.loadProperties(new UrlResource(url));
            String factoryClassNames = properties.getProperty(factoryClassName);
            result.addAll(Arrays.asList(StringUtils.commaDelimitedListToStringArray(factoryClassNames)));
        }
        return result;
    }
    catch (IOException ex) {
        throw new IllegalArgumentException("Unable to load [" + factoryClass.getName() +
                "] factories from location [" + FACTORIES_RESOURCE_LOCATION + "]", ex);
    }
}
```

##### instantiateFactory

私有方法，利用反射机制实例化某个类的对象。

```java
private static <T> T instantiateFactory(String instanceClassName, Class<T> factoryClass, ClassLoader classLoader) {
    try {
        
        Class<?> instanceClass = ClassUtils.forName(instanceClassName, classLoader);
        // 是否实现了指定接口
        if (!factoryClass.isAssignableFrom(instanceClass)) {
            throw new IllegalArgumentException("Class [" + instanceClassName + "] is not assignable to [" + factoryClass.getName() + "]");
        }
        // 创建对象
        return (T) ReflectionUtils.accessibleConstructor(instanceClass).newInstance();
    } catch (Throwable ex) {
        throw new IllegalArgumentException("Unable to instantiate factory class: " + factoryClass.getName(), ex);
    }
}
```

#### spring.factoreies

spring.factories的是通过Properties解析得到的，文件中的内容都是按照下面这种方式配置的。

```properties
# PropertySource Loaders
org.springframework.boot.env.PropertySourceLoader=\
org.springframework.boot.env.PropertiesPropertySourceLoader,\
org.springframework.boot.env.YamlPropertySourceLoader
```

每一行表示一个键值对，键和值之间用等号(`=`)分隔。键通常是一个接口或者抽象类，值则是这个接口或抽象类的具体实现类。

如果一个键有多个值，那么这些值可以用逗号(`,`)或反斜线(`\`)来分隔。使用反斜线(`\`)可以在多行中定义一个键的多个值。



### 应用

#### 实现一个starter

##### 引入starter基础依赖

![image-20231129123648862](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231129123648862.png)

##### 创建`AutoConfiguration`

![image-20231129123732544](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231129123732544.png)

#####  resources 包下创建`META-INF/spring.factories`文件

![image-20231129123832853](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231129123832853.png)

编译打包`threadpool-spring-boot-starter`。

##### 测试

新建工程引入`threadpool-spring-boot-starter`

![image-20231129123948925](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231129123948925.png)

![image-20231129124024117](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231129124024117.png)

自动装配。

## 启动流程

> [!Note]
>
> ```text
> -------------------创建springbootApplication对象---------------------------------------
> springboot在创建SpringApplicaiton实例的时候，对Springboot容器初始化操作，主要做了四个事情：
> 1. 获取当前应用的启动类型。
>    注1：通过判断当前classpath是否加载servlet类，返回servlet web启动方式。
>     注2：webApplicationType三种类型：
>      1.reactive：响应式启动（spring5新特性）
>      2.none:即不嵌入web容器启动（springboot放在外部服务器运行 ）
>      3.servlet:基于web容器进行启动
> 2. 获取初始化器：读取springboot下的META-INFO/spring.factories文件，获取对应的ApplicationContextInitializer装配到集合
> 3. 获取监听器：读取springboot下的META-INFO/spring.factories文件，获取对应的ApplicationListener装配到集合
> 4. 定位到main方法：mainApplicationClass，获取当前运行的主函数
> 
> ------调用springbootApplication对象的run方法，实现启动，返回当前容器的上下文------------------
> 1. 记录项目启动时间
> 2. 记录启动异常日志
> 3. 循环调用监听器中的starting方法
> 4. 读取配置文件，yml，yaml，xml，properties等
> 5. 打印banner图，就是sprongboot启动最开头的图案
> 6. 初始化AnnotationConfigServletWebServerApplicationContext对象
> 7. <font color=red>刷新上下文，调用注解，refreshContext(context),在这次实现自动化配置，包括spring.factories的加载，bean的实例化等核心工作。</font>
> 8. 创建tomcat
> 9. 加载springmvc
> 10. 刷新后的方法，空方法，给用户自定义重写afterRefresh（）
> 11. stopWatch.stop();结束计时
> 12. 使用广播和回调机制告诉监听者springboot容器已经启动化成功，可以运行;
> 13. 返回上下文
> ```

### 创建SpringApplication实例

#### 代码总览

```java
public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
 this.resourceLoader = resourceLoader;
 Assert.notNull(primarySources, "PrimarySources must not be null");
 this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));
 //获取应用类型
 this.webApplicationType = WebApplicationType.deduceFromClasspath();
 //获取所有初始化器
 setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class));
 //获取所有监听器
 setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
 //定位main方法
 this.mainApplicationClass = deduceMainApplicationClass();
}
```

#### 分析

springboot在创建SpringApplicaiton实例的时候，对Springboot容器初始化操作，主要做了四个事情：

2. 获取当前应用的启动类型。
 注1：通过判断当前classpath是否加载servlet类，返回servlet web启动方式。
 注2：webApplicationType三种类型：
    1.reactive：响应式启动（spring5新特性）
    2.none:即不嵌入web容器启动（springboot放在外部服务器运行 ）
    3.servlet:基于web容器进行启动
3. 获取初始化器：读取springboot下的META-INFO/spring.factories文件，获取对应的ApplicationContextInitializer装配到集合
4. 获取监听器：读取springboot下的META-INFO/spring.factories文件，获取对应的ApplicationListener装配到集合
5. 定位到main方法：mainApplicationClass，获取当前运行的主函数

### run方法

#### 代码总览

```java
// 开启计时类进行计时
  StopWatch stopWatch = new StopWatch();
  stopWatch.start();
  //声明应用上下文
  ConfigurableApplicationContext context = null;
  // 记录sprongboot启动异常日志
  Collection<SpringBootExceptionReporter> exceptionReporters = new ArrayList<>();
  //设置系统java.awt.headless属性，默认为true(跟踪代码可以看到)
  configureHeadlessProperty();
  // 获取监听器，它的作用是为后期一些环境参数进行赋值，就是加载配置文件
  // 获取到org.springframework.boot.context.event.EventPublishingRunListener
  // implements SpringApplicationRunListener
  SpringApplicationRunListeners listeners = getRunListeners(args);
  //********* 遍历调用监听器，表示监听器已经开始初始化容器**********
  listeners.starting();
  try {
   // 将args包装厂ApplicationArguments类
   ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
   // ********监听器开始对对环境参数进行赋值***********
   ConfigurableEnvironment environment = prepareEnvironment(listeners, applicationArguments);
   configureIgnoreBeanInfo(environment);
   //打印banner图，就是我们springboot启动时，前面几行图形
   Banner printedBanner = printBanner(environment);
   // 初始化上下文对象AnnotationConfigServletWebServerApplicationContext
   context = createApplicationContext();
   // 异常采集
   exceptionReporters = getSpringFactoriesInstances(SpringBootExceptionReporter.class,
     new Class[] { ConfigurableApplicationContext.class }, context);
   // 部署上下文,prepareContext方法将listeners、environment、applicationArguments、banner等重要组件与上下文对象关联
   prepareContext(context, environment, listeners, applicationArguments, printedBanner);
   // springbootApplication生效
   // 刷新上下文,refreshContext(context)方法(初始化方法如下)将是实现spring-boot-starter-*(mybatis、redis等)自动化配置的关键，包括spring.factories的加载，bean的实例化等核心工作。
   refreshContext(context);
   //刷新后的方法，空方法，给用户自定义重写
   afterRefresh(context, applicationArguments);
   //结束计时
   stopWatch.stop();
   //输出日志记录执行主类名、时间信息
   if (this.logStartupInfo) {
    new StartupInfoLogger(this.mainApplicationClass).logStarted(getApplicationLog(), stopWatch);
   }
   //********* 使用广播和回调机制告诉监听者springboot容器已经启动化成功**********
   listeners.started(context);
   //做一些调整顺序操作
   callRunners(context, applicationArguments);
  } catch (Throwable ex) {
   handleRunFailure(context, ex, exceptionReporters, listeners);
   throw new IllegalStateException(ex);
  }

  try {
   //********* 使用广播和回调机制告诉已经可以运行springboot了**********
   listeners.running(context);
  } catch (Throwable ex) {
   handleRunFailure(context, ex, exceptionReporters, null);
   throw new IllegalStateException(ex);
  }
  //返回上下文
  return context;
```

#### 分析

调用springbootApplication对象的run方法，调用run方法启动，返回当前容器的上下文，主要做了以下事情：
8. StopWatch stopWatch = new StopWatch()，记录项目启动时间
9. getRunListeners，读取META-INF/spring.factores，将SpringApplicationRunListeners类型存到集合中
10. listeners.starting();循环调用starting方法
11. prepareEnvironment(listeners, applicationArguments);将配置文件读取到容器中
    读取多数据源：classpath:/,classpath:/config/,file:./,file:./config/底下。其中classpath是读取编译后的，file是读取编译前的
    支持yml，yaml，xml，properties
12. Banner printedBanner = printBanner(environment);开始打印banner图，就是sprongboot启动最开头的图案
13. 初始化AnnotationConfigServletWebServerApplicationContext对象
14. 刷新上下文，调用注解，refreshContext(context);
15. 创建tomcat
16. 加载springmvc
17. 刷新后的方法，空方法，给用户自定义重写afterRefresh（）
18. stopWatch.stop();结束计时
19. 使用广播和回调机制告诉监听者springboot容器已经启动化成功，listeners.started(context);
21. 返回上下文

## 注解

### Import注解

Import注解的作用：也是注入第三方类让他变成容器管理的bean.

与@Configuration+@bean组合使用的方式相比，功能更加单一，但是更加暴力简单。

#### 使用方式

> [!note]
>
> - @Import（{ 要导入的容器中的组件 } ）：容器会自动注册这个组件，id默认是全类名
> - ImportSelector：返回需要导入的组件的全类名数组，springboot底层用的特别多【重点 】
> - ImportBeanDefinitionRegistrar：手动注册bean到容器

##### @import（类.class） 

直接指定类让容器管理。

![image-20231128171343055](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128171343055.png)

##### @import（选择器.class） 

导入 `ImportSelector`接口或 `DeferredImportSelector`接口的实现类。

实现选择器，让选择器可以使用数组，把很多类都注入到容器中，这就是依赖注入的核心代码。

![image-20231128171500806](SpringBoot%E6%9C%BA%E5%88%B6.assets/image-20231128171500806.png)

##### @import(ImportBeanDefinitionRegistrar )

导入 `ImportBeanDefinitionRegistrar`接口的实现类，如果@Import注解导入的类是ImportBeanDefinitionRegistrar的实现类，那么可以利用registerBeanDefinitions()方法将bean注入到IoC容器中。

```java
public class RegistrarTest implements ImportBeanDefinitionRegistrar {
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        registry.registerBeanDefinition("user",new RootBeanDefinition(User.class));
    }
}
```


@autoHeader: 2.1.1.1.1.1


<p align="right">update time : {docsify-updated}</p>

## 内部机制

### SpringBoot的自动装配机制？

SpringBoot的自动装配主要是依赖@EnableAutoConfiguration注解实现的。

他的本质是基于SPI服务提供发现机制的一种应用，通过读取META-INF/spring.factories配置文件，获取自动装载类的全限定类名，通过反射机制实例化该类的对象，并装载到IOC容器中。

在SpringBoot中采用的是按需加载的策略，会通过Condition条件判断自动装载类是否满足加载的条件，例如ConditonOnBean容器中是否有指定的Bean，ConditionOnClass是否有指定类等等条件，只加载满足条件的自动配置类对象。

### SPI和SpringBoot自动装载中的区别？

他们的原理是差不多的，都是通过扫描配置文件，得到某个实现类的全限定类名，再利用反射机制获取实例对象，是一种动态加载服务的机制。

区别在于：

- 扫描文件不一致，SPI扫描的是META-INF/services目录，文件名与接口的全限定名一致；每一行是实现类的全限定名；而SpringBoot中扫描的是META-INF/Spring.factories文件，文件基于键值对格式，key为接口，value是类的全限定名。
- SPI不能按需加载，必须遍历所有的实现类并实例化。SpringBoot中则增加了Condition按需加载的机制。

### SpringBoot的启动流程？

每个SpringBoot程序都有一个主入口，即main方法，main里面调用SpringApplication.run()启动整个spring-boot程序，该方法所在类需要使用@SpringBootApplication注解，启动SpringBoot业务服务，具体流程包括：

首先会创建SpringApplication实例，对Springboot容器做初始化工作，包括获取当前应用的启动类型，是否以Web容器的方式启动；获取监听器等等。

第二步调用SpringApplication对象的run方法，实现启动，包括：

- 记录项目启动时间
- 读取yml、properties等配置文件
- 打印banner图
- 始化Spring容器，包含创建bean实例、依赖注入等操作。
- 开启自动配置功能，在META-INF/spring.factories文件配置接口的实现类名称，通过读取配置文件，实例化对应的配置项，实现自动装配。
- 启动内嵌的Web服务器，比如Tomcat或Jetty，在Web服务器上部署应用程序。

最后，SpringBoot会启动应用程序本身，启动相应的线程进行服务处理。

## 使用

### SpringBoot配置文件的优先级？

SpringBoot提供了多种配置方式，并且对配置文件的目录结构和文件格式都做了优先级设置，因此要从多个方面来看。

（一）首先是在常用的配置文件方法，读取顺序优先级为：

1. 命令行参数，例如`java  -jar  app.jar --server.port=4321`
2. JVM系统属性，通过-Dxxx进行设置，例如`java -Dserver.port=1234 -jar  app.jar`
3. 系统环境属性，在系统环境中设置的属性值(通过System.getenv()方法获取)
4. jar包外部的application-{profile}.properties/yml配置文件，如果没有指明激活的profile，则默认为default。
5. jar包内部的application-{profile}.properties/yml配置文件，如果没有指明激活的profile，则默认为default。
6. jar包外部的application.properties/yml配置文件。
7. jar包内部的application.properties/yml配置文件。
8. 通过@Configuration注解类上的@PropertySource注解引入的配置文件。

（二）其中，如果是Jar包内部配置目录结构，跟随以下的优先级：

1. config目录下的配置文件
2. 根目录下的配置文件
3. resources下的config目录下的配置文件
4. resources目录下的配置文件

（三）如果是jar包外部的目录结构，优先级为：

1. jar包所在目录中的/config文件夹下的配置文件
2. jar包所在目录中的配置文件

（四）当相同目录结构下，配置文件格式层面

优先级为：properties > yml > yaml

（五）springBoot默认读取bootstrap和application配置文件，且前者优先级更高。

### application.yml与bootstrap.yml的区别？

bootstrap.yml是被一个父级 Spring ApplicationContext 加载的，用来程序引导时执行，应用于更加早期配置信息读取，bootstrap先于 application加载。

比如常见配置Spring.application，spirng cloud config等信息，进行提前配置。

application.yml是由子类ApplicationContext加载的， 应用程序特有配置信息，可以用来配置后续各个模块中需使用的公共参数等。

此外，bootstrap的配置参数不能被application覆盖。

### 有哪些常用的SpringBootStarter？

- spring-boot-starter-web，用于构建Web应用程序的starter，包括Spring MVC和内嵌Tomcat
- spring-boot-starter-test，单元测试的starter
- mybatis-boot-starter，mybatis集成的starter
- pagehelper-spring-boot-starter，集成分页插件
- dynamic-datasource-spring-boot-starter，多源数据库集成，用@DS注解选择在哪个数据库上操作
- druid-spring-boot-starter，连接池集成
- spring-boot-starter-data-redis，与redis集成的starter
- spring-boot-starter-json，集成Jackson包

在Springcloud的交互中，还会用到：

- spring-cloud-starter-openfeign，openfeigin声明调用
- spring-cloud-starter-alibaba-nacos-discovery，nacos服务发现集成
- spring-cloud-starter-alibaba-nacos-config，配置中心集成
- spring-cloud-starter-gateway，集成网关
- spring-cloud-starter-alibaba-sentinel ，sentinel集成




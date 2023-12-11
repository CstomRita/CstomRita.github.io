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


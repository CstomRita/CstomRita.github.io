@autoHeader: 2.1.1.1.1.1


<p align="right">update time : {docsify-updated}</p>

## 内部机制

### SpringBoot的启动流程？

每个SpringBoot程序都有一个主入口，即main方法，main里面调用SpringApplication.run()启动整个spring-boot程序，该方法所在类需要使用@SpringBootApplication注解，启动SpringBoot业务服务，具体流程包括：

首先，SpringBoot会读取配置文件与启动类，配置文件指定了项目的各种配置信息，启动类是应用程序的入口。

然后，SpringBoot会初始化Spring容器，包含创建bean实例、依赖注入等操作。

接着，SpringBoot会开启自动配置功能，扫描项目中的类，自动注册bean，以便于可以方便地使用。

在完成了自动配置后，SpringBoot会启动内嵌的Web服务器，比如Tomcat或Jetty，在Web服务器上部署应用程序。

最后，SpringBoot会启动应用程序本身，启动相应的线程进行服务处理。


@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>



## 简介

### 简介

Spring Cloud Alibaba是Spring Cloud的子项目，包含微服务开发必备组件，基于和符合Spring Cloud标准的阿里的微服务解决方案。

### 功能和组件

核心功能包括：服务注册发现，服务熔断降级，配置管理，分布式事务，消息中间件(RocketMQ)。

1.  **Nacos**:【注册中心 + 配置中心】一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。
2. **Sentinel**:【服务容错组件】把流量作为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。
3.  **RocketMQ**:【消息队列组件】一款开源的分布式消息系统，基于高可用分布式集群技术，提供低延时的、高可靠 的消息发布与订阅服务。
4. **Seata**:【分布式事务组件】阿里巴巴开源产品，一个易于使用的高性能微服务分布式事务解决方案。
5. **Dubbo**:Apache DubboTM 是一款高性能 Java RPC 框架。 
6.  **Alibaba Cloud ACM**:一款在分布式架构环境中对应用配置进行集中管理和推送的应用配置中心 产品。
7.  **Alibaba Cloud OSS**: 阿里云对象存储服务(Object Storage Service，简称 OSS)，是阿里云提 供的海量、安全、低成本、高可靠的云存储服务。您可以在任何应用、任何时间、任何地点存储和 访问任意类型的数据。
8.  **Alibaba Cloud SchedulerX**: 阿里中间件团队开发的一款分布式任务调度产品，提供秒级、精 准、高可靠、高可用的定时(基于 Cron 表达式)任务调度服务。
9.  **Alibaba Cloud SMS**: 覆盖全球的短信服务，友好、高效、智能的互联化通讯能力，帮助企业迅速 搭建客户触达通道。

## Nacos

### Nacos简介

Nacos 是一个基于 REST 的动态服务发现、配置和服务管理平台，它可以帮助开发者快速地构建一套微服务生态系统。Nacos 提供了一个简单的 Web 界面来管理服务、配置和命名空间，可以通过 REST API 和服务 SDK 实现动态配置和服务发现。

#### Nacos的作用

Nacos就是注册中心+配置中心的组合  

Nacos = Eureka + Config + Bus

**服务发现与服务健康检查**

Nacos使服务更容易注册，并通过DNS或HTTP接口发现其他服务，Nacos还提供服务的实时健康检查，以防止向不健康的主机或服务实例发送请求。

**动态配置管理**

动态配置服务允许您在所有环境中以集中和动态的方式管理所有服务的配置。Nacos消除了在更新配置时重新部署应用程序，这使配置的更改更加高效和灵活。

**动态DNS服务**

Nacos提供基于DNS 协议的服务发现能力，旨在支持异构语言的服务发现，支持将注册在Nacos上的服务以域名的方式暴露端点，让三方应用方便的查阅及发现。

**服务和元数据管理**

Nacos 能让您从微服务平台建设的视角管理数据中心的所有服务及元数据，包括管理服务的描述、生命周期、服务的静态依赖分析、服务的健康状态、服务的流量管理、路由及安全策略。

#### Nacos内部模块

Nacos 的架构设计基于三个核心模块：

命名服务（Naming）：命名服务负责服务的注册和发现。

配置服务（Configuration）：配置服务负责配置的管理和发布。

服务治理（Governance）：服务治理负责服务的负载均衡和流量控制。

#### 1.x vs 2.x

目前nacos版本2.X在内部设计上有了很大更改。

Nacos  1.x版本架构

![img](SpringCloudAlibaba.assets/742a6c09abba006bf67c5ee51d922a32.png)


Nacos  2.x版本架构

![img](SpringCloudAlibaba.assets/acad8d666d3869a5868ffc4066384df8.png)

Nacos 2.X 在 1.X 的架构基础上 新增了对长连接模型的支持，同时保留对旧客户端和 openAPI 的核心功能支持。通信层通过 gRPC 和 Rsocket 实现了长连接 RPC 调用和推送能力。

最主要的特性是新增了对 gRPC 框架的支持，gRPC 是一款开源的基于 HTTP/2 标准设计的高性能 RPC 框架，Nacos 2.0 还带来了 6 个增强功能：

- 异步执行一些耗时的操作
- SDK 多语言支持
- 增加一些度量、日志支持
- 全面支持自定义实例注册
- 支持单推当首次订阅服务时
- 支持通过阈值健康保护

### Nacos-discovery 注册中心1.x

#### 工作流程

##### 总体流程

![Nacos 注册流程](SpringCloudAlibaba.assets/java-interview-15-02.png)

服务提供者、服务消费者、Nacos Server这三者之间的交互大致如下：

1. 服务提供者启动时，将ip-端口号-服务名-分组名-集群名等信息封装为一个对象，通过nacos的api，向Nacos服务器注册服务
2. 服务提供者创建一个定时任务，每隔一段时间向Nacos服务器发送PUT请求并携带相关信息，作为定时心跳连接，服务器端在接收到心跳请求后，会去检查当前服务列表中有没有该实例，如果没有的话将当前服务实例重新注册，注册完成后立即开启一个异步任务，更新客户端实例的最后心跳时间，如果当前实例是非健康状态则将其改为健康状态；
3. Nacos开启一个定时任务（5s），检查当前服务中的各个实例是否在线，如果实例上次心跳时间大于15s就将其状态设置为不健康，如果超出30s，则直接将该实例删除，说明节点服务不可用；
4. Nacos服务检测到有异常（服务上下线）就会发送UDP协议给客户端进行更新
5. 服务消费者启动时会拉取自已要用的服务列表，之后每10秒进行拉取一下数据。
6. 如果Nacos是集群环境，客户端会随机选择一个 Nacos 节点发起注册，再通过集群间的数据同步。

##### 集群注册

如果Nacos是集群环境，客户端会随机选择一个 Nacos 节点发起注册，再通过集群间的数据同步。

服务 A 注册时，是向所有 Nacos 节点发起注册呢？还是只向其中一个节点发起注册？如果只向一个节点注册，要向哪个节点注册呢？

> 答案：在 Client 发起注册之前，会有一个后台线程随机拿到 Nacos 集群服务列表中的一个地址。

**Nacos 为什么会这样设计？**

- 这其实就是一个负载均衡的思想在里面，每个节点都均匀的分摊请求。
- 保证高可用，当某个节点宕机后，重新拿到其他的 Nacos 节点来建立连接。

接下来我们看下服务 A 是怎么随机拿到一个 Nacos 节点的：

![img](SpringCloudAlibaba.assets/image-20220412085821355AZgLcJ.png)

**拿到一个随机的 Nacos 地址**：

```java
// 一个 int 随机数，范围 [0 ~ Nacos 个数)
currentIndex.set(new Random().nextInt(serverList.size()));
// index 自增 1
int index = currentIndex.incrementAndGet() % getServerList().size();
// 返回 Nacos 地址
return getServerList().get(index);
```

**小结**：客户端生成一个随机数，然后通过这个随机数取余数，从 Nacos 服务列表中拿到一个 Nacos 服务地址返回给客户端，然后客户端通过这个地址和 Nacos 服务建立连接。Nacos 服务列表中的节点都是平等的，随机拿到的任何一个节点都是可以用来发起调用的。

#### Nacos集群数据同步 //todo

##### Raft协议



##### Distro协议



##### 协议选择

1. （4）然后将当前实例添加到对应服务列表中，这里会通过synchronized锁住当前服务，然后分两种情况向集群中添加实例，如果是持久化数据，则使用基于CP模式的简单Raft协议，通过leader节点将实例数据更新到内存和磁盘文件中，并且通过CountDownLatch实现了一个简单的raft写入数据的逻辑，必须集群半数以上节点写入成功才会给客户端返回成功；
   （5）如果是非持久化实例数据，使用的是基于AP模式的Distro协议，首先向任务阻塞队列添加一个本地服务实例改变任务，去更新本地服务列表，然后在遍历集群中所有节点，分别创建数据同步任务放进阻塞队列异步进行集群数据同步，不保证集群节点数据同步完成即可返回；
   （6）在将服务实例更新到服务注册表中时，为了防止并发读写冲突，采用的是写时复制的思想，将原注册表数据拷贝一份，添加完成之后再替换回真正的注册表，更新完成之后，通过发布服务变化事件，将服务变动通知给客户端，采用的是UDP通信，客户端接收到UDP消息后会返回一个ACK信号，如果一定时间内服务端没有收到ACK信号，还会尝试重发，当超出重发时间后就不在重发，虽然通过UDP通信不能保证消息的可靠抵达，但是由于Nacos客户端会开启定时任务，每隔一段时间更新客户端缓存的服务列表，通过定时轮询更新服务列表做兜底，所以不用担心数据不会更新的情况，这样既保证了实时性，又保证了数据更新的可靠性；
   （7）服务发现：客户端通过定时任务定时从服务端拉取服务数据保存在本地缓存，服务端在发生心跳检测）服务列表变更或者健康状态改变时会触发推送事件，在推送事件中会基于UDP通信将服务列表推送到客户端，同时开启定时任务，每隔10s定时推送数据到客户端。

#### 使用方式

（1）pom文件加依赖:alibaba-nacos-discovery

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

（2）启动类加注解

```java
//Nacos服务端【早期版本需要加注解，现在0.0.9版本后已不是必须的】
@EnableDiscoveryClient
```

（3）在对应的微服务的yml配置文件【服务名称和nacos server 地址】

```yml
spring:
  cloud:
    nacos:
      discovery:
        #指定nacos server的地址，不需要写http
        server-addr: localhost:8848 
```



### Nacos-config 配置中心 1.x

#### 工作流程 

长轮询工作机制

![nacos-config](SpringCloudAlibaba.assets/0-1683272152.png)

1. 客户端会轮询向服务端发出一个长连接请求，这个长连接最多30s就会超时
2. Nacos-config服务端收到客户端的请求会先判断当前是否有配置更新，有则立即返回，如果当前没有更新，服务端会将这个请求加入队列“hold”29.5s，最后0.5s再检测配置文件，无论有没有更新都进行正常返回
3. Nacos-config服务端若在等待的29.5s期间有配置更新可以提前结束并返回。

#### 使用方式

##### 使用方式说明

（1）添加Nacos依赖

Spring Cloud Alibaba Nacos Config依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

（2）配置Nacos元数据

src/main/resources/bootstrap.properties 配置文件（注意：bootstrap.properties 优先级高于其他配置文件），配置 Nacos Config 连接地址

```properties
spring.application.name=passjava-member
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
```

（3）Nacos后台新增配置

**Data ID:** passjava-member.properties

**Group:** DEFAULT_GROUP

**配置格式:**

```properties
member.nick="悟空"
member.age=10复制复制失败复制成功
```

（4）开启动态刷新配置功能

添加注解@RefreshScope开启动态刷新配置功能

```java
@RefreshScope
@RestController
@RequestMapping("member/sample")
public class SampleController {}复制复制失败复制成功
```

可以从控制台看到日志信息：

```properties
Refresh keys changed: [member.age]
2020-04-19 23:34:07.154  INFO 8796 --- [-127.0.0.1_8848] c.a.nacos.client.config.impl.CacheData   : [fixed-127.0.0.1_8848] [notify-ok] dataId=passjava-member.properties, group=DEFAULT_GROUP, md5=df136e146c83cbf857567e75acb11e2b, listener=com.alibaba.cloud.nacos.refresh.NacosContextRefresher$1@4f49b78b 
2020-04-19 23:34:07.154  INFO 8796 --- [-127.0.0.1_8848] c.a.nacos.client.config.impl.CacheData   : [fixed-127.0.0.1_8848] [notify-listener] time cost=529ms in ClientWorker, dataId=passjava-member.properties, group=DEFAULT_GROUP, md5=df136e146c83cbf857567e75acb11e2b, listener=com.alibaba.cloud.nacos.refresh.NacosContextRefresher$1@4f49b78b
member.age` 更新了，通知了member服务，刷新了配置。对应的配置id为`passjava-member.properties`，分组为`DEFAULT_GROUP`。监听器为`com.alibaba.cloud.nacos.refresh.NacosContextRefresher
```

（5）命名空间

我们现在有5个微服务，每个微服务用到的配置可能都不一样，那不同微服务怎么样获取自己微服务的配置呢？

这里可以用到命名空间，我们针对每个微服务，都创建一个命名空间。

```json
# 创建5个命名空间
passjava-channel
passjava-content
passjava-member
passjava-question
passjava-study
```

- bootstrap.properties配置命名空间

```
spring.cloud.nacos.config.namespace=passjava-member
```

（6）分组

如果我们有多套环境，比如开发环境，测试环境，生产环境，每一套环境的配置参数不一样，那配置中心该如何配置呢？

我们可以使用配置中心的`分组`功能。每一套环境都是一套分组。

- 首先创建一套dev环境配置项，然后克隆配置到test和prod环境

![dev、test、prod分组](SpringCloudAlibaba.assets/kUF8qfV1ty18um1KmD.png)

- bootstrap.properties配置当前使用的分组：prod

```
spring.cloud.nacos.config.group=prod
```

（7）多配置集

我们可以将application.yml文件中的datasource、mybatis-plus等配置进行拆解，分成好几个yml，放到配置中心。

- 配置中心新建`datasource.yml` 配置

- 配置中心新建`mybatis.yml` 配置

- 配置中心新建`more.yml` 配置

-  bootstrap.properties使用extension-configs或者shared-configs增加nacos配置，application.yml注释配置

```properties
spring.application.name=passjava-member
spring.cloud.nacos.config.server-addr=127.0.0.1:8848

spring.cloud.nacos.config.namespace=passjava-member
spring.cloud.nacos.config.group=prod

spring.cloud.nacos.config.extension-configs[0].data-id=datasource.yml
spring.cloud.nacos.config.extension-configs[0].group=dev
spring.cloud.nacos.config.extension-configs[0].refresh=true

spring.cloud.nacos.config.extension-configs[1].data-id=mybatis.yml
spring.cloud.nacos.config.extension-configs[1].group=dev
spring.cloud.nacos.config.extension-configs[1].refresh=true

spring.cloud.nacos.config.extension-configs[2].data-id=more.yml
spring.cloud.nacos.config.extension-configs[2].group=dev
spring.cloud.nacos.config.extension-configs[2].refresh=true复制复制失败复制成功
```

（8）更多配置项

| 配置项                   | key                                       | 默认值        | 说明                                                         |
| ------------------------ | ----------------------------------------- | ------------- | ------------------------------------------------------------ |
| 服务端地址               | spring.cloud.nacos.config.server-addr     |               |                                                              |
| DataId前缀               | spring.cloud.nacos.config.prefix          |               | spring.application.name                                      |
| Group                    | spring.cloud.nacos.config.group           | DEFAULT_GROUP |                                                              |
| dataID后缀及内容文件格式 | spring.cloud.nacos.config.file-extension  | properties    | dataId的后缀，同时也是配置内容的文件格式，目前只支持 properties |
| 配置内容的编码方式       | spring.cloud.nacos.config.encode          | UTF-8         | 配置的编码                                                   |
| 获取配置的超时时间       | spring.cloud.nacos.config.timeout         | 3000          | 单位为 ms                                                    |
| 配置的命名空间           | spring.cloud.nacos.config.namespace       |               | 常用场景之一是不同环境的配置的区分隔离，例如开发测试环境和生产环境的资源隔离等。 |
| AccessKey                | spring.cloud.nacos.config.access-key      |               |                                                              |
| SecretKey                | spring.cloud.nacos.config.secret-key      |               |                                                              |
| 相对路径                 | spring.cloud.nacos.config.context-path    |               | 服务端 API 的相对路径                                        |
| 接入点                   | spring.cloud.nacos.config.endpoint        | UTF-8         | 地域的某个服务的入口域名，通过此域名可以动态地拿到服务端地址 |
| 是否开启监听和自动刷新   | spring.cloud.nacos.config.refresh-enabled | true          |                                                              |

##### Shared-configs vs extension-config

```yml
spring:
  application:
    name: nacos-config-multi
  main:
    allow-bean-definition-overriding: true
  cloud:
    nacos:
      username: ${nacos.username}
      password: ${nacos.password}
      config:
        server-addr: ${nacos.server-addr}
        namespace: ${nacos.namespace}
        # 用于共享的配置文件
        shared-configs:
          - data-id: common-mysql.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP

          - data-id: common-redis.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP

          - data-id: common-base.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP

        # 常规配置文件
        # 优先级大于 shared-configs，在 shared-configs 之后加载
        extension-configs:
          - data-id: nacos-config-advanced.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP
            refresh: true

          - data-id: nacos-config-base.yaml
            group: SPRING_CLOUD_EXAMPLE_GROUP
            refresh: true
```

参数解析：

- data-id : Data Id
- group：自定义 Data Id 所在的组，不明确配置的话，默认是 DEFAULT_GROUP。
- refresh: 控制该 Data Id 在配置变更时，是否支持应用中可动态刷新， 感知到最新的配置值。默认是不支持的。

注意：这里的`Data ID`后面是加`.yaml`后缀的，且不需要指定`file-extension`。

实际上，Nacos中并未对`extension-configs`和`shared-configs`的差别进⾏详细阐述。我们从他们的结构，看不出本质差别；除了优先级不同以外，也没有其他差别。

那么，Nacos项⽬组为什么要引⼊两个类似的配置呢?我们可以从当初该功能的需求（issue）上找到其原始⽬的。

  **Nacos对配置的默认理念**

- `namespace`区分环境：开发环境、测试环境、预发布环境、⽣产环境。
- `group`区分不同应⽤：同⼀个环境内，不同应⽤的配置，通过`group`来区分。

**主配置是应⽤专有的配置**

因此，主配置应当在`dataId`上要区分，同时最好还要有`group`的区分，因为`group`区分应⽤（虽然`dataId`上区分了，不⽤设置`group`也能按应⽤单独加载）。

**要在各应⽤之间共享⼀个配置，请使⽤上⾯的 shared-configs**

因此按该理念，`shared-configs`指定的配置，本来应该是不指定`group`的，也就是应当归⼊`DEFAULT_GROUP`这个公共分组。

**如果要在特定范围内（⽐如某个应⽤上）覆盖某个共享dataId上的特定属性，请使⽤ extension-config**

⽐如，其他应⽤的数据库url，都是⼀个固定的url，使⽤`shared-configs.dataId = mysql`的共享配置。但其中有⼀个应⽤`ddd-demo`是特例，需要为该应⽤配置扩展属性来覆盖。

```yml
spring:
 application:
   name: ddd-demo-service
 cloud:
   nacos:
     config:
       server-addr: nacos-2.nacos-headless.public.svc.cluster.local:8848
       namespace: ygjpro-test2
       group: ddd-demo
       ......
       shared-configs[3]:
         data-id: mysql.yaml
         refresh: true
       ......
       extension-configs[3]:
         data-id: mysql.yaml
         group: ddd-demo
         refresh: true
```

##### 优先级

- 本地配置和Nacos远程配置的优先级

当根据远程Nacos的配置文件和本地的配置文件中的配置有重复时，根据远程Nacos的配置文件是否做了all-override的配置区分，如果配置了为true，则优先用本地的，否则用远程的。

```yaml
spring:
  cloud:
    config:
      override-none: true // 允许nacos被本地文件覆盖
      allow-override: true  // nacos不覆盖任何本地文件
      override-system-properties: false  
```

- Nacos远程配置的优先级

Spring Cloud Alibaba Nacos Config目前提供了三种配置方式从 Nacos 配置中心获取配置信息：

1. 通过 shared-configs支持多个共享 Data Id 的配置

2. 通过 extension-configs配置扩展 Data Id

3. 通过内部相关规则(服务名-环境.扩展名)自动生成相关的 Data Id 配置，即主配置文件

   > 服务名.后缀** 为默认配置文件
   >
   > 当配置了环境：
   >
   > 优先级：**服务名-环境.后缀** > **服务名.后缀**
   >
   > 默认配置文件还生效
   >
   > 相同的配置优先级大的会覆盖优先级小的，并且会形成互补

**服务名-环境.扩展名 > 服务名.扩展名 > `extension-configs > shared-configs`，其中extension-configs和shared-configs都是数组，数组元素对应的下标越⼤，优先级越⾼**

> - 同为扩展配置，存在如下优先级关系：`extension-configs[3] > extension-configs[2] > extension-configs[1] > extension-configs[0`。
> - 同为共享配置，存在如下优先级关系：`shared-configs[3] > shared-configs[2] > shared-configs[1] > shared-configs[0]`。

##### 使用Nacos config总结

1.引入Nacos依赖

2.Nacos server配置Nacos数据源

3.配置中心配置数据集`DataId`和配置内容

7.使用命名空间`namespace`来区分各服务的配置

8.使用分组`group`来区分不同环境

9.使用多配置集`extension-configs`或者`shared-configs`区分不同类型的配置

### Nacos-discovery 注册中心 2.x //todo



### Nacos-config 配置中心 2.x // todo



### 和其他组件的结合使用

#### Ribbon

Nacos底层负载均衡底层是通过Ribbon实现的，Ribbon中定义了负载均衡算法，然后基于这些算法从服务实例中获取一个实例提供服务。

Spring Cloud Alibaba Nacos 中已经内置了 Ribbon 框架了，引入Nacos无需再引入Ribbon依赖。

Ribbon具体内容间[SpringCloudNetflix](编程框架/Spring系列/SpringCloudNetflix)

![image.png](SpringCloudAlibaba.assets/30578a30e90a01c1c2746ebb7d638421.png)

#### OpenFegin

OpenFeign 声明式服务调用和负载均衡组件。

采用OpenFegin和Nacos结合，可使用FeignClient声明式调用，不再需要用restTemplate手动调用。

OpenFeign 是基于 Feign 实现的，是 Spring Cloud 官方提供的注解式调用 REST 接口框架，OpenFeign/Feign 底层是基于 Ribbon 实现负载均衡的。

OpenFegin具体内容间[SpringCloudNetflix](编程框架/Spring系列/SpringCloudNetflix)

## Sentinel

### 简介

sentinel在微服务中叫做流量防卫兵，以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。Sentinel 具有以下特征：
（1）丰富的应用场景：Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀（即突发流量控制在系统容量可以承受的范围）、消息削峰填谷、集群流量控制、实时熔断下游不可用应用等。
（2）完备的实时监控：Sentinel 同时提供实时的监控功能。您可以在控制台中看到接入应用的单台机器秒级数据，甚至 500 台以下规模的集群的汇总运行情况。
（3）广泛的开源生态：Sentinel 提供开箱即用的与其它开源框架/库的整合模块，例如与 Spring Cloud、Apache Dubbo、gRPC、Quarkus 的整合。您只需要引入相应的依赖并进行简单的配置即可快速地接入 Sentinel。同时 Sentinel 提供 Java/Go/C++ 等多语言的原生实现。
（4）完善的 SPI 扩展机制：Sentinel 提供简单易用、完善的 SPI 扩展接口。您可以通过实现扩展接口来快速地定制逻辑。例如定制规则管理、适配动态数据源等。



### 流量控制



### 熔断降级









## Seata


@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>





https://www.bmabk.com/index.php/post/142012.html

## 组件说明类

### Spring Cloud Netflix和Spring Cloud Alibaba包括哪些组件

**Spring Cloud Netflix主要由：** Eureka、Ribbon、Feign、Hystrix、Zuul｜Gateway、Config等组件组成。

**Spring Cloud Alibaba主要由：** Nacos、Sentinel、Seata等组件组成。

### 项目中使用到了哪些组件

常用的SpringCloudAlibaba解决方案+部分Netflix组件。

> 这里多加一些介绍，太简短了

1、使用Nacos注册中心，提供服务注册和服务发现功能。（项目中采用的版本是1.4.1）

2、使用Nacos config配置中心组件，提供动态配置，可以动态界面化管理环境中的应用配置。

3、使用Ribbon作为服务负载均衡组件。可以让我们轻松地将面向服务的REST请求自动转换成客户端负载均衡的服务调用，微服务间的调用，请求转发等内容，实际上都是通过Ribbon来实现的

4、使用OpenFeign 作为声明式服务调用。

5、使用Sentinel作为流量控制和熔断降级组件。

## Nacos

### Nacos注册中心

#### Nacos作为注册中心应该选择是CP还是AP

Nacos即能保证CP，也能保证AP，具体看如何配置，默认是AP模式。

**AP：** 如果注册中心是AP的，注册中心集群不管出现了什么情况都是可以提供服务的，即使节点之间数据出现了不一致，例如拉取到了一个已经下线了的服务节点，但是现在一般的微服务框架或组件都提供了服务容错和重试功能，也可以避免这个问题。对于注册中心而言不需要消耗太多的资源来实时的保证数据一致性，保证最终一致性就可以了，这样注册中心的压力会小一点。

**CP：** 如果注册中心是CP的，当我们向注册中心注册实例或移除实例时，都要等待注册中心集群中的数据达到一致后，才算注册或移除成功，这是比较耗时的，随着业务应用规模的增大，应用频繁的上下线，那么就会导致注册中心的压力比较大，会影响到服务发现的效率以及服务调用。

#### Nacos如何实现就近访问

在Nacos中一个服务可以有多个实例，并且可以给实例设置`cluster-name`，如果现在某个服务A想要调用服务B，那么Naocs会看调用服务A的实例是属于哪个集群的，就会调用同样集群下的服务B实例，这就是Nacos的就近访问。

#### Eureka和Nacos对比

1. Nacos整合了注册中心、配置中心功能，Eureka只是注册中心。
2. Nacos社区活跃，Eureka开源工作已停止。
3. Nacos具备服务优雅上下线和流量管理，而Eureka的后台页面仅供展示，需要使用api操作上下线且不具备流量管理功能。
4. Nacos支持CP和AP模式，Eureka支持AP模式。
5. Nacos2.0中注册中心会定时向消费者主动推送信息，Eureka不会主动推送。

### Nacos配置中心

#### Nacos读取配置文件的有哪几种方案？

- Data ID方案：通过配置的DataID读取指定配置文件。
- Group方案：通过Group实现环境区分，区分生产环境、测试环境等。
- Namespace方案：通过建立不同NameSpace来区分。
- 多配置集方案：可将配置文件进行拆解，通过shared-configs或者extension-configs读取多个配置文件。

#### Nacos加载配置的优先级

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

#### Nacos配置中心宕机了，会影响服务吗？

不会。客户端获取了配置中心的配置信息后，会将配置信息在本地保存一份。当配置中心宕机了会先读取本地文件。
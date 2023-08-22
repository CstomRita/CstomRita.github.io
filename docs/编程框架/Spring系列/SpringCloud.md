@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>


## 微服务中的概念

###  什么是微服务架构

微服务架构就是将单体的应用程序分成多个应用程序，这多个应用程序就成为微服务，每个微服务运行在自己的进程中，并使用轻量级的机制通信。

这些服务围绕业务能力来划分，并通过自动化部署机制来独立部署。

这些服务可以使用不同的编程语言，不同数据库，以保证最低限度的集中式管理。

## Springcloud简介

### 什么是SpringCloud

Spring Cloud是一系列框架的有序集合。

它利用Spring Boot的开发便利性巧妙地简化了分布式系统基础设施的开发，如服务发现注册、配置中心、智能路由、消息总线、负载均衡、断路器、数据监控等，都可以用Spring Boot的开发风格做到一键启动和部署。

### SpringCloud 和 SpringBoot不同

- SpringBoot专注于快速方便的开发单个个体微服务。SpringCloud是关注全局的微服务协调整理治理框架，它将SpringBoot开发的一个个单体微服务整合并管理起来，为各个微服务之间提供，配置管理、服务发现、断路器、路由、微代理、事件总线、全局锁、决策竞选、分布式会话等等集成服务

- SpringBoot可以离开SpringCloud独立使用开发项目， 但是SpringCloud离不开SpringBoot ，属于依赖的关系。
- SpringBoot专注于快速、方便的开发单个微服务个体，SpringCloud关注全局的服务治理框架。

### Springcloud生态

SpringCloud是基于SpringBoot为基础实现的微服务架构风格一站式解决方案，例如配置管理、服务发现、断路器、智能路由、微代理、控制总线、一次性令牌、全局锁、领导选举、分布式会话，集群状态等等。

SpringCloud是基于SpringBoot为基础实现的，并且有版本的兼容关系。

生态中常见模块如下。

#### Spring Cloud Netflix

集成众多Netflix的开源软件。

Netflix公司开发了一系列解决微服务架构问题的组件，且开源并入了SpringCloud生态中，成为了SpringCloud生态中的一个模块，名为SpringCloudNetflix，常见的Eureka\Ribbon\Fegin组件都是该公司的，这也是在SpringCloudAlibaba没有出来之前，都使用Netflix解决方案的原因，后续因为相关项目不想开源停止了维护。

> **Netflix Eureka**
>
> 服务中心，云端服务发现，一个基于 REST 的服务，用于定位服务，以实现云端中间层服务发现和故障转移。这个可是springcloud最牛鼻的小弟，服务中心，任何小弟需要其它小弟支持什么都需要从这里来拿，同样的你有什么独门武功的都赶紧过报道，方便以后其它小弟来调用；它的好处是你不需要直接找各种什么小弟支持，只需要到服务中心来领取，也不需要知道提供支持的其它小弟在哪里，还是几个小弟来支持的，反正拿来用就行，服务中心来保证稳定性和质量。
>
> 
>
> **Netflix Hystrix**
>
> 熔断器，容错管理工具，旨在通过熔断机制控制服务和第三方库的节点,从而对延迟和故障提供更强大的容错能力。比如突然某个小弟生病了，但是你还需要它的支持，然后调用之后它半天没有响应，你却不知道，一直在等等这个响应；有可能别的小弟也正在调用你的武功绝技，那么当请求多之后，就会发生严重的阻塞影响老大的整体计划。这个时候Hystrix就派上用场了，当Hystrix发现某个小弟不在状态不稳定立马马上让它下线，让其它小弟来顶上来，或者给你说不用等了这个小弟今天肯定不行，该干嘛赶紧干嘛去别在这排队了。
>
> 
>
> **Netflix Zuul**
>
> Zuul 是在云平台上提供动态路由,监控,弹性,安全等边缘服务的框架。Zuul 相当于是设备和 Netflix 流应用的 Web 网站后端所有请求的前门。当其它门派来找大哥办事的时候一定要先经过zuul,看下有没有带刀子什么的给拦截回去，或者是需要找那个小弟的直接给带过去。
>
> 
>
> **Netflix Archaius**
>
> 配置管理API，包含一系列配置管理API，提供动态类型化属性、线程安全配置操作、轮询框架、回调机制等功能。可以实现动态获取配置，
>  原理是每隔60s（默认，可配置）从配置源读取一次内容，这样修改了配置文件后不需要重启服务就可以使修改后的内容生效，前提使用archaius的API来读取。

#### Spring Cloud Config 

俗称的配置中心，配置管理工具包，让你可以把配置放到远程服务器，集中化管理集群配置，目前支持本地存储、Git以及Subversion。

#### Spring Cloud Bus 

消息总线，利用分布式消息将服务和服务实例连接在一起，用于在一个集群中传播状态的变化。

#### Spring Cloud for Cloud Foundry 

Cloud Foundry是VMware推出的业界第一个开源PaaS云平台，它支持多种框架、语言、运行时环境、云平台及应用服务，使开发人员能够在几秒钟内进行应用程序的部署和扩展，无需担心任何基础架构的问题

其实就是与CloudFoundry进行集成的一套解决方案，抱了Cloud Foundry的大腿。

#### Spring Cloud Cluster 

基于Zookeeper, Redis, Hazelcast, Consul实现的领导选举和平民状态模式的抽象和实现。

pring Cloud Cluster将取代Spring Integration。提供在分布式系统中的集群所需要的基础功能支持，如：选举、集群的状态一致性、全局锁、tokens等常见状态模式的抽象和实现。

#### Spring Cloud Consul 

基于Hashicorp Consul实现的服务发现和配置管理。

Consul 是一个支持多数据中心分布式高可用的服务发现和配置共享的服务软件,由 HashiCorp 公司用 Go 语言开发, 基于 Mozilla Public License 2.0 的协议进行开源. Consul 支持健康检查,并允许 HTTP 和 DNS 协议调用 API 存储键值对.

Spring Cloud Consul 封装了Consul操作，consul是一个服务发现与配置工具，与Docker容器可以无缝集成。

#### Spring Cloud Security 

在Zuul代理中为OAuth2 rest客户端和认证头转发提供负载均衡。基于spring security的安全工具包，为你的应用程序添加安全控制。

#### Spring Cloud Sleuth 

日志收集工具包，封装了Dapper和log-based追踪以及Zipkin和HTrace操作，为SpringCloud应用实现了一种分布式追踪解决方案。

#### Spring Cloud Data Flow 

一个云本地程序和操作模型，组成数据微服务在一个结构化的平台上。

Data flow 是一个用于开发和执行大范围数据处理其模式包括ETL，批量运算和持续运算的统一编程模型和托管服务。对于在现代运行环境中可组合的微服务程序来说，Spring Cloud data flow是一个原生云可编配的服务。使用Spring Cloud data flow，开发者可以为像数据抽取，实时分析，和数据导入/导出这种常见用例创建和编配数据通道 （data pipelines）。

 Spring Cloud data flow 是基于原生云对 spring XD的重新设计，该项目目标是简化大数据应用的开发。Spring XD 的流处理和批处理模块的重构分别是基于 spring boot的stream 和 task/batch 的微服务程序。这些程序现在都是自动部署单元而且他们原生的支持像 Cloud Foundry、Apache YARN、Apache Mesos和Kubernetes 等现代运行环境。

 Spring Cloud data flow 为基于微服务的分布式流处理和批处理数据通道提供了一系列模型和最佳实践。




#### Spring Cloud Stream 

基于Redis,Rabbit,Kafka实现的消息微服务，简单声明模型用以在Spring Cloud应用中收发消息。

Spring Cloud Stream是基于spring boot创建，用来建立单独的／工业级spring应用，使用spring integration提供与消息代理之间的连接。数据流操作开发包，封装了与Redis,Rabbit、Kafka等发送接收消息。



#### Spring Cloud Stream App Starters 

基于Spring Boot为外部系统提供spring的集成。

#### Spring Cloud Task 

短生命周期的微服务，为SpringBooot应用简单声明添加功能和非功能特性，比如任务调度的工作，比如说某些定时任务晚上就跑一次，或者某项数据分析临时就跑几次。

#### Spring Cloud Zookeeper 

服务发现和配置管理基于Apache Zookeeper。

ZooKeeper是一个分布式的，开放源码的分布式应用程序协调服务，是Google的Chubby一个开源的实现，是Hadoop和Hbase的重要组件。它是一个为分布式应用提供一致性服务的软件，提供的功能包括：配置维护、域名服务、分布式同步、组服务等。ZooKeeper的目标就是封装好复杂易出错的关键服务，将简单易用的接口和性能高效、功能稳定的系统提供给用户。



#### Spring Cloud Connectors

 便于PaaS应用在各种平台上连接到后端像数据库和消息经纪服务。

Spring Cloud Connectors 简化了连接到服务的过程和从云平台获取操作的过程，有很强的扩展性，可以利用Spring Cloud Connectors来构建你自己的云平台，便于云端应用程序在各种PaaS平台连接到后端，如：数据库和消息代理服务。

#### Spring Cloud Starters 

（项目已经终止并且在Angel.SR2后的版本和其他项目合并）

#### Spring Cloud CLI 

基于 Spring Boot CLI，可以让你以命令行方式快速建立云组件。




@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## 基础篇

### 说一下Kafka的架构？ //todo

Kafka是多分区、多副本的架构，架构中的组件包括：



### kafka的consumer是拉模式还是推模式

生产者将消息推送到broker，消费者从broker主动拉取消息。

push模式的缺点：

由broker决定消息推送的速率，对于不同消费速率的consumer就不太好处理了。消息系统都致力于让consumer以最大的速率最快速的消费消息，但不幸的是，push模式下，当broker推送的速率远大于consumer消费的速率时，consumer恐怕就要崩溃了

pull模式的缺点：

- broker需要在数据为空时阻塞
- broker需要储存数据

### 什么是消费者组？

消费者组是 Kafka 提供的可扩展且具有容错性的消费者机制。

在 Kafka 中，消费者组是一个由多个消费者实例构成的组。

多个实例共同订阅若干个主题，实现共同消费。

同一个组下的每个实例都配置有相同的组 ID，被分配不同的订阅分区；当某个实例挂掉的时候，其他实例会自动地承担起它负责消费的分区。

### offset的作用？

在 Kafka 中，每个主题分区下的每条消息都被赋予了一个唯一的 ID 数值，用于标识它在分区中的位置。

这个 ID 数值，就被称为位移，或者叫偏移量，它的作用是为了唯一地区别分区中的每条消息。

## 分区机制篇

### 说一下分区？

在Kafka中，主题Topic是一个逻辑上的概念，topic下细分为多个分区，某个分区只属于一个主题，同一主题下不同分区包含的消息是不同的。

在存储层面，分区可以看做一个可追加的日志文件，消息在追加到分区文件的时候，会分配一个特定的偏移量，作为消息在分区中的唯一标识，Kafka通过offset保证消息在分区中的顺序性。

### 分区的目的？

分区机制是Kafka实现高吞吐、水平扩展的机制，让数据消费更加均衡。

从逻辑组织来说，kafka有三层结构，kafka有多个主题，每个主题有多个分区，每个分区又有多条消息。以分区为单位进行数据读写，每个分区可以分布到不同的机器上，可以实现高伸缩性，以及负载均衡，动态调节的能力。

### 生产者分区策略？

分区策略就是决定生产者将消息发送到哪个分区的算法，在Kafka中分区策略包括：

	1. 轮询分区策略，按照分区编号依次将消息分配到不同的分区。
 	2. 哈希分区策略，将消息的key进行哈希计算，然后将哈希结果对分区数取余，得到消息所在的分区。
 	3. 范围分区策略，根据消息key的范围将消息分配到不同的分区。需要在创建主题时指定分区边界。
 	4. 粘性分区策略，将消息发送到同一个分区，直到该分区的消息数量超过阈值，才会将消息发送到下一个分区。这个策略可以用来保证消息的顺序性。
 	5. 自定义分区策略，用户可以根据自己的业务逻辑自定义分区策略，重写实现Partitioner类中的partition()方法。

### 消费者组分区策略？

在消费者组中，分配消费者消费哪些分区的算法有两种：



### 分区个数如何确定？

在`server.properties`包含默认主题分区数配置选项，默认情况下按照配置项数量进行配置。

也可以在创建topic时使用`-partitions`参数指定分区。

对于分区个数，分区越多，所需要消耗的资源就越多，并不是分区越多性能越好。确定分区个数的方式有：

1. 结合具体业务的处理速度和时间来估算。假如每秒钟需要从主题写入和读取1GB数据，而消费者1秒钟最多处理50MB的数据，那么这个时候就可以设置20-25个分区，当然还要结合具体的物理资源情况。
2. 基准测试来测试，创建不同分区的topic，逐步压测测出最终的结果。
3. 一般情况下，推荐确定分区数的方式就是broker机器数量的2~3倍。

## 多副本机制篇

### 说一下多副本？

在分区中又引入了多副本的概念，通过增加副本数量可以提高容灾能力。

同一分区的不同副本中保存的是相同的消息。副本之间是一主多从的关系，其中主副本负责读写，从副本只负责消息同步。副本处于不同的 broker 中，当主副本出现异常，便会在从副本中提升一个为主副本。

### 多副本的目的？



## 应用篇

### 如何基于Kafka实现优先队列

大致有以下方案

（一）consumer 各自拉取，使用优先级队列重新缓冲。

这种对内存要求很大，而且单纯靠内存，程序崩溃后难以找回未消费消息。

（二）先拉取高优先级topic的数据，只要有就一直消费，直到没有数据再消费低一级topic。消费低一级topic的过程中，如果发现有高一级topic消息到来，则转向消费高优先级消息。

该方案在高峰时段可能会导致低优先级消息完全失去消费机会，这种要看应用场景，比如在一些任务调度上，资源有限，高峰时段全部在高优先级任务上，也是符合设计的。

（三）实现相对的有序，先不考虑优先级，在高中低优先级consumer中循环拉取一批次，在该批次消费中，优先消费优先级高的。

该方案实现的是相对的有序，无法做到当高中低都有消息待消费时，集中全力先消费高优先级的消息。

```java
// 同时维护多个consumer
private Map<Integer, KafkaConsumer<K, V>> consumers;
public ConsumerRecords<K, V> poll(long pollTimeoutMs) {
    Map<TopicPartition, List<ConsumerRecord<K, V>>> consumerRecords = 
        new HashMap<TopicPartition, List<ConsumerRecord<K, V>>>();
    long start = System.currentTimeMillis();
    do {
        // 每一次整体“拉取”，都调用每个“子”consumer 拉取一次
        for (int i = maxPriority - 1; i >= 0; --i) {
            ConsumerRecords<K, V> records = consumers.get(i).poll(0);
            for (TopicPartition partition : records.partitions()) {
                consumerRecords.put(partition, records.records(partition));
            }
        }
    } while (consumerRecords.isEmpty() && System.currentTimeMillis() < (start + pollTimeoutMs));
    ...
}
```

### Kafka哪种情况下会丢消息、如何避免

**生产者**

当生产者发送数据时，可以通过request.required.acks参数来设置数据可靠性的级别：

- acks=0： 表示producer不需要等待任何broker确认收到消息的回复，就可以继续发送下一条消息。

  性能最高，但是最容易丢消息。大数据统计报表场景，对性能要求很高，对数据丢失不敏感的情况可以用这种。

- acks=1： 至少要等待leader已经成功将数据写入本地log，但是不需要等待所有follower是否成功写入。

  这种情况下，如果follower没有成功备份数据，而此时leader又挂掉，则消息会丢失。

- acks=-1或all： 这意味着leader需要等待所有备份(min.insync.replicas配置的备份个数)都成功写入日志，这种策略会保证只要有一个备份存活就不会丢失数据。

  这是最强的数据保证。一般除非是金融级别，或跟钱打交道的场景才会使用这种配置。

**消费者**

如果消费这边配置的是自动提交，万一消费到数据还没处理完，就自动提交offset了，但是此时consumer直接宕机了，未处理完的数据丢失了，下次也消费不到了。

避免可以采用手动提交offset，确保消息成功消费之后再提交offset。

### Kafka如何保证消息有序性？

Kafka中是以分区作为单元进行消费的，同一个分区使用offset偏移量作为唯一标识，保证顺序性，但这只是保证分区内部的顺序性，而不能保证整个topic的有序性。

如果局部有序性不能满足需求，为了实现消息的全局有序，需要将所有消息发往同一个分区中才能保证消息顺序消费，那么可以：

- 如果是是全部消息都要全局有序，可以仅设置一个分区；
- 如果是部分消息要求全局有序，可以设置多个分区，在发送的时候指定 MessageKey，同一个key的消息会发到同一个分区中。

### 生产过程中何时会发生QueueFullExpection以及如何处理？

当生产者试图发送消息的速度快于Broker可以处理的速度时，通常会发生 `QueueFullException`

解决方案如下：

- 先进行判断生产者是否能够降低生产速率
- 如果生产者不能阻止这种情况，为了处理增加的负载，增加 Broker数量
- 或者选择生产阻塞，设置`Queue.enQueueTimeout.ms` 为 -1，通过这样处理，如果队列已满的情况，生产者将阻塞

> [!tip]`Queue.enQueueTimeout.ms` 字段说明：
>
> - 默认的 enqueueTimeout是0，如果producer内部的队列满了，数据(messages)会被丢弃，并抛出QueueFullExceptions异常
> - 阻塞模式的producer(queue.enqueueTimeout.ms=-1)，如果内部队列满了就会一直等待，从而有效的节制内置consumer的消费速度





> https://javabetter.cn/interview/kafka-40.html#_7%E3%80%81kafka-%E4%B8%AD%E5%88%86%E5%8C%BA%E7%9A%84%E5%8E%9F%E5%88%99

> https://zhuanlan.zhihu.com/p/443784983
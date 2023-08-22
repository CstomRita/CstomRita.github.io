@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>


## 如何基于Kafka实现优先队列

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

## kafka的consumer是拉模式还是推模式

producer将消息推送到broker，consumer从broker拉取消息。

push模式的缺点：

由broker决定消息推送的速率，对于不同消费速率的consumer就不太好处理了。消息系统都致力于让consumer以最大的速率最快速的消费消息，但不幸的是，push模式下，当broker推送的速率远大于consumer消费的速率时，consumer恐怕就要崩溃了

pull模式的缺点：

- broker需要在数据为空时阻塞
- broker需要储存数据

## Kafka哪种情况下会丢消息、如何避免

###  生产者

当生产者发送数据时，可以通过request.required.acks参数来设置数据可靠性的级别：

- acks=0： 表示producer不需要等待任何broker确认收到消息的回复，就可以继续发送下一条消息。

  性能最高，但是最容易丢消息。大数据统计报表场景，对性能要求很高，对数据丢失不敏感的情况可以用这种。

- acks=1： 至少要等待leader已经成功将数据写入本地log，但是不需要等待所有follower是否成功写入。

  这种情况下，如果follower没有成功备份数据，而此时leader又挂掉，则消息会丢失。

- acks=-1或all： 这意味着leader需要等待所有备份(min.insync.replicas配置的备份个数)都成功写入日志，这种策略会保证只要有一个备份存活就不会丢失数据。

  这是最强的数据保证。一般除非是金融级别，或跟钱打交道的场景才会使用这种配置。

### 消费者

如果消费这边配置的是自动提交，万一消费到数据还没处理完，就自动提交offset了，但是此时你consumer直接宕机了，未处理完的数据丢失了，下次也消费不到了。

避免可以采用手动提交offset，确保消息成功消费之后再提交offset。


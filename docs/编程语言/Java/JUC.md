@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>



![image](/Users/changsiteng/Documents/%25E6%2588%2591%25E7%259A%2584%25E7%25AC%2594%25E8%25AE%25B0/docsifyDocs/docs/%25E7%25BC%2596%25E7%25A8%258B%25E8%25AF%25AD%25E8%25A8%2580/Java/%25E5%25A4%259A%25E7%25BA%25BF%25E7%25A8%258B%25E5%25B9%25B6%25E5%258F%2591.assets/java-thread-x-juc-overview-1-u.png)

JUC框架包括五个部分：

- Lock框架：锁机制
- Collections: 并发集合
- Atomic: 原子类
- Executors: 线程池
- Tools类：工具类

## 锁机制

### AQS



### ReentrantLock



### ReentrantReadWriteLock





## 集合类

### ConcurrentHashMap

#### jdk 1.7

从结构上说，1.7版本的ConcurrentHashMap采用分段锁机制，里面包含一个Segment数组，Segment继承于ReentrantLock，Segment则包含HashEntry的数组，HashEntry本身就是一个链表的结构，具有保存key、value的能力能指向下一个节点的指针。

实际上就是相当于每个Segment都是一个HashMap，默认的Segment长度是16，也就是支持16个线程的并发写，Segment之间相互不会受到影响。

![1.7ConcurrentHashMap示意图](JUC.assets/collection-31.png)

#### jdk1.8

jdk1.8实现线程安全不是在数据结构上下功夫，它的数据结构和HashMap是一样的，数组+链表+红黑树。

![img](JUC.assets/java-thread-x-concurrent-hashmap-2.png)

它实现线程安全的关键点在于put流程。

![ConcurrentHashmap jdk1.8put流程](JUC.assets/collection-32.jpg)



## 原子类

### CAS



### Unsafe





## 线程池



## 工具类


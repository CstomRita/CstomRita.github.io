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

它实现线程安全的关键点在于put流程：

1. 如果没有初始化就先调用initTable（）方法来进行初始化过程 ；
2. 如果没有hash冲突就直接CAS插入，直接调用Unsafe的方法CAS插入该元素；
3. 如果还在进行扩容操作就先进行扩容 ；
4. 如果存在hash冲突，就加锁来保证线程安全，这里有两种情况，一种是链表形式就直接遍历到尾端插入，一种是红黑树就按照红黑树结构插入；
5. 最后一个如果该链表的数量大于阈值8，就要先转换成黑红树的结构，break再一次进入循环 ；
6. 如果添加成功就调用addCount（）方法统计size，并且检查是否需要扩容。

![ConcurrentHashmap jdk1.8put流程](JUC.assets/collection-32.jpg)



## 原子类

### CAS

CAS的全称为Compare-And-Swap，直译就是对比交换。

CAS是一条CPU的原子指令，其作用是让CPU先进行比较两个值是否相等，然后原子地更新某个位置的值。

其实现方式是基于硬件平台的汇编指令，就是说CAS是靠硬件实现的，JVM只是封装了汇编调用，那些AtomicInteger类便是使用了这些封装后的接口。  

> [!Note]CAS操作需要输入两个数值，一个旧值(期望操作前的值)和一个新值，在操作期间先比较下在旧值有没有发生变化，如果没有发生变化，才交换成新值，发生了变化则不交换。

CAS操作是原子性的，所以多线程并发使用CAS更新数据时，可以不使用锁。JDK中大量使用了CAS来更新数据而防止加锁来保持原子更新。

#### CAS原理

在CAS中，有这样三个值：

- V：要更新的变量(var)
- E：预期值(expected)
- N：新值(new)

比较并交换的过程如下：

1. 判断V是否等于E，如果等于，将V的值设置为N；
2. 如果不等，说明已经有其它线程更新了V，则当前线程放弃更新，什么都不做。

所以这里的**预期值E本质上指的是“旧值”**。

以一个简单的例子来解释这个过程，如果有一个多个线程共享的变量`i`原本等于5，在线程A中，想把它设置为新的值6，使用CAS来做这个事情：

1. 首先我们用i去与5对比，发现它等于5，说明没有被其它线程改过，那我就把它设置为新的值6，此次CAS成功，`i`的值被设置成了6；
2. 如果不等于5，说明`i`被其它线程改过了（比如现在`i`的值为2），那么我就什么也不做，此次CAS失败，`i`的值仍然为2。

那有没有可能我在判断了`i`为5之后，正准备更新它的新值的时候，被其它线程更改了`i`的值呢？

不会的。因为CAS是一种原子操作，它是一种系统原语，是一条CPU的原子指令，从CPU层面保证它的原子性。

**当多个线程同时使用CAS操作一个变量时，只有一个会胜出，并成功更新，其余均会失败，但失败的线程并不会被挂起，仅是被告知失败，并且允许再次尝试，当然也允许失败的线程放弃操作。**

#### Java中实现CAS的原理

在Java中，如果一个方法是native的，那Java不负责具体实现它，而是交给底层的JVM使用c或者c++去实现。

在Java中，有一个`Unsafe`类，它在`sun.misc`包中。它里面是一些`native`方法，其中就有几个关于CAS的：

```java
boolean compareAndSwapObject(Object o, long offset,Object expected, Object x);
boolean compareAndSwapInt(Object o, long offset,int expected,int x);
boolean compareAndSwapLong(Object o, long offset,long expected,long x);
```

当然，他们都是`public native`的。

Unsafe中对CAS的实现是C++写的，它的具体实现和操作系统、CPU都有关系。

Linux的X86下主要是通过`cmpxchgl`这个指令在CPU级完成CAS操作的，但在多处理器情况下必须使用`lock`指令加锁来完成。当然不同的操作系统和处理器的实现会有所不同，大家可以自行了解。

当然，Unsafe类里面还有其它方法用于不同的用途。比如支持线程挂起和恢复的`park`和`unpark`， LockSupport类底层就是调用了这两个方法。还有支持反射操作的`allocateInstance()`方法。

### Unsafe





## 线程池



## 工具类


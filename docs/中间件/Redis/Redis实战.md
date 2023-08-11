<p align="right">update time : {docsify-updated}</p>

@autoHeader:1

##缓存应用

在高并发的业务场景下，数据库大多数情况都是用户并发访问最薄弱的环节。

一般需要使用redis做一个缓冲操作，让请求先访问到redis，而不是直接访问Mysql等数据库。这样可以大大缓解数据库的压力。

作为缓存应用时，必须要考虑如下问题：

- 缓存穿透
- 缓存穿击
- 缓存雪崩
- 缓存污染
- 缓存一致性

### 缓存穿透

#### 问题描述

缓存穿透是指**缓存和数据库中都没有的数据**，而用户不断发起请求。由于缓存是不命中时被动写的，并且出于容错考虑，如果从存储层查不到数据则不写入缓存，这将导致这个不存在的数据每次请求都要到存储层去查询，失去了缓存的意义。

在流量大时，可能DB就挂掉了，要是有人利用不存在的key频繁攻击我们的应用，这就是漏洞，如发起为id为“-1”的数据或id为特别大不存在的数据。这时的用户很可能是攻击者，攻击会导致数据库压力过大。

#### 解决方案

1. 在业务层面增加校验，不符合业务规则的请求直接拦截掉。如用户鉴权校验，id做基础校验，id<=0的直接拦截；
2. 在缓存和数据库都没有取到的数据，将key-value写入对应的key-null，缓存时间有效期设置短一些，如多少秒，防止影响正常业务。这样可以防止用户暴力攻击。
3. 使用布隆过滤器。详见下一小节。

#### 布隆过滤器

布隆过滤器可以用于快速检索一个元素是否在一个集合中。

##### 实现原理

当一个元素被加入集合时，通过K个散列函数将这个元素映射成一个位数组中的K个点，把它们置为1。

检索时，我们只要看看这些点是不是都是1就（大约）知道集合中有没有它了：如果这些点有任何一个0，则被检元素一定不在；如果都是1，则被检元素很可能在。

![image-20230811174805441](Redis%E5%AE%9E%E6%88%98.assets/image-20230811174805441.png)

这个思想就是哈希，那和单哈希函数的不同之处呢？不同之处就是，Bloom Filter使用了k个哈希函数，每个字符串跟k个bit对应，比单哈希函数减少了哈希冲突的概率。

##### 优缺点

它的优点是时间和空间上的查询效率高。

缺点是有一定的误识别率和删除困难：

- 存在误判，可能要查到的元素并没有在容器中，但是hash之后得到的k个位置上值都是1。如果bloom filter中存储的是黑名单，那么可以通过建立一个白名单来存储可能会误判的元素。

- 删除困难。一个放入容器的元素映射到bit数组的k个位置上是1，删除的时候不能简单的直接置为0，可能会影响其他元素的判断。

##### 使用方式

在使用bloom filter时，绕不过的两点是预估数据量n以及期望的误判率fpp

在实现bloom filter时，绕不过的两点就是hash函数的选取以及bit数组的大小

对于一个确定的场景，需要的信息包括：

1、要存的数据量为n

2、期望的误判率为fpp

3、计算我们需要的Bit数组的大小m，以及hash函数的个数k，并选择hash函数

Step1：Bit数组大小

根据预估数据量n以及误判率fpp，bit数组大小的m的计算方式：

![img](Redis%E5%AE%9E%E6%88%98.assets/16e112fbd079c208~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.image)

Step2：哈希函数选择，k个哈希函数都用不同的会有些麻烦，选择一个哈希函数，然后送入k个不同的参数

预估数据量n以及bit数组长度m，可以得到一个hash函数的个数k

![img](Redis%E5%AE%9E%E6%88%98.assets/16e112fbd09afadb~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.image)

Step3：实现

```java
<dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>23.0</version>
 </dependency>   

public class TestBloomFilter {

    private static int total = 1000000;
  //创建布隆过滤器
    private static BloomFilter<Integer> bf = BloomFilter.create(Funnels.integerFunnel(), total, 0.0001);

    public static void main(String[] args) {
        // 初始化1000000条数据到过滤器中
        for (int i = 0; i < total; i++) {
            bf.put(i);
        }

        // 匹配已在过滤器中的值，是否有匹配不上的
        for (int i = 0; i < total; i++) {
            if (!bf.mightContain(i)) {
                System.out.println("有坏人逃脱了~~~");
            }
        }

        // 匹配不在过滤器中的10000个值，有多少匹配出来
        int count = 0;
        for (int i = total; i < total + 10000; i++) {
            if (bf.mightContain(i)) {
                count++;
            }
        }
        System.out.println("误伤的数量：" + count);
    }
}
```

##### 应用场景

应用于量大、但允许出现一定误差的场景下，如常见的：

- 爬虫过滤已抓到的url就不再抓，可用bloom filter过滤。
- 垃圾邮件过滤。

### 缓存击穿

#### 问题描述

缓存击穿是一个热点的Key，有大并发集中对其进行访问，突然间这个Key失效了，导致大并发全部打在数据库上，导致数据库压力剧增。

#### 解决方案



### 缓存雪崩

#### 问题描述



#### 解决方案



### 缓存污染

#### 问题描述



#### 解决方案



### 缓存一致性

#### 问题描述



#### 解决方案





## 性能调优



## 运维监控




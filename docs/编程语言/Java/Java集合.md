@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>



![wxmp](Java%E9%9B%86%E5%90%88.assets/co-1.png)

![wxmp](Java%E9%9B%86%E5%90%88.assets/co-2.png)

Java的集合类主要由两个接口派生而出：Collection和Map。

collection接口下的子接口：

1. list
   	 - ArrayList
      	 - Vector
      	 - Stack
      	 - LinkedList
      	 - RandomAccessSubList
      	 - CopyOnWriteArrayList

2. set
   	- HashSet
      	- LinkedHashSet
      	- TreeSet
      	- ConcurrentSkipListSet
      	- CopyOnwriteArraySet

3. queue
   	- LinkedList
      	- ArrayDeque
      	- PriorityQueue
    - 阻塞队列BlockingQueue接口
      	- PriorityBlockingQueue
      	- ArrayBlockingQueue
      	- SynchronousQueue
      	- DelayQueue
      	- LinkedBlockingQueue
       - LinkedBlockingDeque
   - 非阻塞队列直接实现Queue接口
     - ConcurrentLinkedQueue
     - ConcurrentLinkedDeque

## List

### ArrayList

ArrayList实现了List接口，是顺序容器，即元素存放的数据与放进去的顺序相同，允许放入`null`元素，底层通过**数组实现**。除该类未实现同步外，其余跟*Vector*大致相同。

#### 底层结构

每个ArrayList都有一个容量(capacity)，表示底层数组的实际大小，容器内存储元素的个数不能多于当前容量。当向容器中添加元素时，如果容量不足，容器会自动增大底层数组的大小。

![ArrayList_base](Java%E9%9B%86%E5%90%88.assets/ArrayList_base.png)

```java
  transient Object[] elementData; // non-private to simplify nested class access
  private int size;
```

#### 自动扩容

每当向数组中添加元素时，都要去检查添加后元素的个数是否会超出当前数组的长度，如果超出，数组将会进行扩容，以满足添加数据的需求。数组扩容通过一个公开的方法ensureCapacity(int minCapacity)来实现。在实际添加大量元素前，我也可以使用ensureCapacity来手动增加ArrayList实例的容量，以减少递增式再分配的数量。

数组进行扩容时，会将老数组中的元素重新拷贝一份到新的数组中，每次数组容量的增长大约是其原容量的**1.5**倍。

这种操作的代价是很高的，因此在实际使用时，应该尽量避免数组容量的扩张：

- 如果预知要保存的元素的多少时，要在构造ArrayList实例时，就指定其容量，以避免数组扩容的发生
- 或者根据实际需求，通过调用ensureCapacity方法来手动增加ArrayList实例的容量

![ArrayList_grow](Java%E9%9B%86%E5%90%88.assets/ArrayList_grow.png)

#### 方法实现

##### add

![ArrayList_add](Java%E9%9B%86%E5%90%88.assets/ArrayList_add.png)

`add(int index, E e)`需要先对元素进行移动，然后完成插入操作，也就意味着该方法有着线性的时间复杂度。

`addAll()`方法能够一次添加多个元素，根据位置不同也有两个版本，一个是在末尾添加的`addAll(Collection c)`方法，一个是从指定位置开始插入的`addAll(int index, Collection c)`方法。跟`add()`方法类似，在插入之前也需要进行空间检查，如果需要则自动扩容；如果从指定位置插入，也会存在移动元素的情况。 `addAll()`的时间复杂度不仅跟插入元素的多少有关，也跟插入的位置相关。

##### set

既然底层是一个数组*ArrayList*的`set()`方法也就变得非常简单，直接对数组的指定位置赋值即可。

```java
public E set(int index, E element) {
    rangeCheck(index);//下标越界检查
    E oldValue = elementData(index);
    elementData[index] = element;//赋值到指定位置，复制的仅仅是引用
    return oldValue;
}
```

##### get

`get()`方法同样很简单，唯一要注意的是由于底层数组是Object[]，得到元素后需要进行类型转换。

```java
public E get(int index) {
    rangeCheck(index);
    return (E) elementData[index];//注意类型转换
}
```

##### remove

`remove()`方法也有两个版本，一个是`remove(int index)`删除指定位置的元素，另一个是`remove(Object o)`删除第一个满足`o.equals(elementData[index])`的元素。删除操作是`add()`操作的逆过程，需要将删除点之后的元素向前移动一个位置。

```java
public E remove(int index) {
    rangeCheck(index);
    modCount++;
    E oldValue = elementData(index);
    int numMoved = size - index - 1;
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index, numMoved);
    elementData[--size] = null; //清除该位置的引用，让GC起作用
    return oldValue;
}
```

> 需要注意的是为了让GC起作用，必须显式的为最后一个位置赋`null`值。

### LinkedList



### Vector 

#### Vector



#### Stack

Stack类继承Vector类，并在其基础上添加了一些入栈、出栈的操作。

Stack与Vector一样，是线程安全的，但是性能较差，尽量少用Stack类。如果要实现栈”这种数据结构，可以考虑使用LinkedList。

### SynchronizedList

当多线程并发访问一个 List 的实例时，可以使用 `Collections.synchronizedList(List)` 将 List 的实例进行包装。

```java
List<String> list = Collections.synchronizedList(new ArrayList<>());
```

#### 实现原理

```java
static class SynchronizedCollection<E> implements Collection<E>, Serializable {

    final Collection<E> c;  // Backing Collection
    final Object mutex;     // Object on which to synchronize

    SynchronizedCollection(Collection<E> c) {
        this.c = Objects.requireNonNull(c);
        mutex = this;
    }

    SynchronizedCollection(Collection<E> c, Object mutex) {
        this.c = Objects.requireNonNull(c);
        this.mutex = Objects.requireNonNull(mutex);
    }

    public Iterator<E> iterator() {
        return c.iterator(); // Must be manually synched by user!
    }

    public boolean add(E e) {
        synchronized (mutex) {return c.add(e);}
    }

    // ...
}
```

1、可以看出内部使用了 `mutex` 作为锁的对象以保证线程安全：

- 构造函数允许用户传入锁的对象，比如用户需要使用单个锁来同步多个集合时，以实现对多集合多线程的并发访问
- 当构造函数为传入锁Object对象时，默认锁住自己this，此时锁的对象和Vector内部机制是一样的

2、可以看到只有add方法用synchronized锁住了代码块，iterator函数并没有加锁，因此迭代函数不是线程安全的，所以如果要遍历，还是必须要在外面加一层锁。

#### 和Vector的区别

> **同步代码块和同步方法的区别：**
>
> 因为SynchronizedList只是使用同步代码块包裹了ArrayList的方法，而ArrayList和Vector中同名方法的方法体内容并无太大差异，所以在锁定范围和锁的作用域上两者并无区别。
>
> 在锁定的对象区别上，SynchronizedList的同步代码块锁定的是mutex对象，Vector锁定的是this对象
> 而其实mutex对象就是SynchronizedList有一个构造函数可以传入一个Object类型对象，如果在调用的时候显示的传入一个对象，那么锁定的就是用户传入的对象。如果没有指定，那么锁定的也是this对象。

- 应用定位不同：Vector是线程安全的List，定位是一个基础的集合结构，底层是数组实现，使用Vector必须要转成Vector的数组结构；SynchronizedList的定位是一个包装类，可以包装所有List的子类，即可以实现同步，完全不会修改底层数据结构。
- 锁机制不同：Vector对读写操作都加了锁，而SynchronizedList仅对写操作加锁，如果要线程安全地遍历，必须要在外面再加一层锁。
- 锁对象不同：Vector使用的同步方法，锁定的是this对象；而SynchronizedList使用的同步代码块，锁对象默认是this对象，也可以是构造器传入的Object对象。
- 扩容机制不同：Vector可以指定扩容大小，默认扩容到原来的 2 倍；SynchronizedList采用ArrayList的扩容，只能扩容到 1.5 倍，没有办法自定义扩容大小。

## Map

| Map               | key        | Value      | Super       | 是否安全               | 是否有序 |
| ----------------- | ---------- | ---------- | ----------- | ---------------------- | -------- |
| HashMap           | 可以为null | 可以为null | AbstractMap | 线程不安全             | 无序     |
| HashTable         | 不能为null | 不能为null | Dictionary  | 线程安全(synchronized) | 无序     |
| ConcurrentHashMap | 不能为null | 不能为null | AbstractMap | 线程局部安全           | 无序     |
| TreeMap           | 不能为null | 可以为null | AbstractMap | 线程不安全             | 有序     |
| LinkedHashMap     | 可以为null | 可以为null | HashMap     | 线程不安全             | 有序     |

### 基础知识

#### 哈希函数

![散列函数构造](Java%E9%9B%86%E5%90%88.assets/collection-19.png)

HashMap里哈希构造函数的方法叫：

- **除留取余法**：H（key)=key%p（p<=N）,关键字除以一个不大于哈希表长度的正整数p，所得余数为地址，当然HashMap里进行了优化改造，效率更高，散列也更均衡。

除此之外，还有这几种常见的哈希函数构造方法：

- **直接定址法**

  直接根据`key`来映射到对应的数组位置，例如1232放到下标1232的位置。

- **数字分析法**

  取`key`的某些数字（例如十位和百位）作为映射的位置

- **平方取中法**

  取`key`平方的中间几位作为映射的位置

- **折叠法**

  将`key`分割成位数相同的几段，然后把它们的叠加和作为映射的位置

#### 解决哈希冲突

HashMap使用链表的原因为了处理哈希冲突，这种方法就是所谓的：

- **链地址法**：在冲突的位置拉一个链表，把冲突的元素放进去。

除此之外，还有一些常见的解决冲突的办法：

- **开放定址法**：开放定址法就是从冲突的位置再接着往下找，给冲突元素找个空位。

  找到空闲位置的方法也有很多种：

  - 线行探查法: 从冲突的位置开始，依次判断下一个位置是否空闲，直至找到空闲位置
  - 平方探查法: 从冲突的位置x开始，第一次增加`1^2`个位置，第二次增加`2^2`…，直至找到空闲的位置
  - ……

![开放定址法](Java%E9%9B%86%E5%90%88.assets/collection-20.png)

- **再哈希法**：换种哈希函数，重新计算冲突元素的地址。
- **建立公共溢出区**：再建一个数组，把冲突的元素放进去

#### equals、hashcode 详解

hashcode 获取对象的哈希值，用于确定对象在哈希表上的位置，是一个int整型

equals:比较两个对象实例是否相等

== ： 比较基本数据类型时比较的是值，比较引用数据类型时比较的是是否指向同一内存地址

如果引用对象1==引用对象2，那么对象1和对象2一定是同一个对象实例

HashCode相等两个对象不一定相等，HashCode不相等两个对象一定不相等，两个对象相等HashCode一定相等

> [!note]所以有
>
> 1. hashcode相等equals不一定返回true
> 2. 但是HashCode不相等，equals一定返回false
> 3. equals返回true,hashcode一定相等

equals方法和hashcode方法都是Object方法，可以重写，但是如果要重写equals方法就一定要重写HashCode方法，否则可能会出现a.equals(b)返回true，但是a b哈希值不同的情况

默认Object下的equals方法是`return this == obj;`

返回是否是一个对象，如果反过来仅仅修改hashcode,不重写equals方法其实是可行的，不管怎么修改HashCode，equals不改就是返回同一个对象就不会违背上面的准则。

### HashMap

对于HashMap来说，将key-value当做一个整体来处理（Entry），同时采用Hash算法来决定key-value的存储位置



#### 红黑树

红黑树本质上是一种二叉查找树，为了保持平衡，它又在二叉查找树的基础上增加了一些规则：

1. 每个节点要么是红色，要么是黑色；
2. 根节点永远是黑色的；
3. 所有的叶子节点都是是黑色的（注意这里说叶子节点其实是图中的 NULL 节点）；
4. 每个红色节点的两个子节点一定都是黑色；
5. 从任一节点到其子树中每个叶子节点的路径都包含相同数量的黑色节点；

![红黑树](Java%E9%9B%86%E5%90%88.assets/collection-9.png)

> 为什么不用二叉树：
>
> 红黑树是一种平衡的二叉树，插入、删除、查找的最坏时间复杂度都为 O(logn)，避免了二叉树最坏情况下的O(n)时间复杂度。

> 为什么不用平衡二叉树：
>
> 平衡二叉树是比红黑树更严格的平衡树，为了保持保持平衡，需要旋转的次数更多，也就是说平衡二叉树保持平衡的效率更低，所以平衡二叉树插入和删除的效率比红黑树要低。



#### HashMap的存储结构

##### JDK1.7

在jdk1.7中，使用数组+链表的方式实现，其实就是一个存储链表的数组，底层实现还是数组，只是每个数组存放的是一个单向链表

![A7D8E485-83CD-42E4-BFD0-A8A20DF1D44E](Java%E9%9B%86%E5%90%88.assets/A7D8E485-83CD-42E4-BFD0-A8A20DF1D44E.png)

这个链表在hashmap中的类叫做Entry，是HashMap的内部类

包含了key value hash以及下一个节点next，是哈希表所存储元素的具体形式

```java
static class Entry<K,V> implements Map.Entry<K,V> {
  final K key;   // 键值对的键
  V value;    // 键值对的值
  Entry<K,V> next;  // 下一个节点
  final int hash;   // hash(key.hashCode())方法的返回值

  Entry(int h, K k, V v, Entry<K,V> n) {   // Entry 的构造函数
   value = v;
   next = n;
   key = k;
   hash = h;
  }
  ......
}
```

注意这个key 和 hash不相等的，hash是通过key的HashCode方法得到的，这个hash相等时，key不一定相等（比如取余，3%2 = 5 %2但是3和5不相等）这就是为什么需要存放链表的原因，链表中是hash相等但是key不相等的元素

##### JDK1.8

在jdk1.8后，更改了底层实现方式，采用 **数组 + 链表 + 红黑树** 的方式实现。

因为链表的查询时间是O(n)，当冲突很严重，一个索引上的链表非常长，效率就很低了，所以在1.8版本的时候做了优化，当一个链表的长度超过8的时候就转换数据结构，不再使用链表存储，而是使用红黑树，红黑树是一个保证大致平衡的平衡树，查找效率更高。

![jdk1.8 hashmap数据结构示意图](Java%E9%9B%86%E5%90%88.assets/collection-8.png)

数据元素通过映射关系，也就是散列函数，映射到桶数组对应索引的位置，如果发生冲突，从冲突的位置拉一个链表，插入冲突的元素。

当链表长度太长时，链表就转换为红黑树，这样大大提高了查找的效率：

- 当随着元素的增加，链表的长度大于8个时，链表转为红黑树
- 当随着元素的减少，红黑树节点小于6个时，红黑树转为链表

#### put流程

##### jdk1.7

添加某个元素时，拿到数组[hash]的这个链表，遍历这个链表，是否有key这个元素，如果没有则添加到链表的最后一个，如果有说明是重复元素覆盖原来的值

##### jdk1.8

![HashMap插入数据流程图](Java%E9%9B%86%E5%90%88.assets/collection-13.jpg)

1. 首先进行哈希值的扰动，获取一个新的哈希值。`(key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);`

2. 判断tab是否位空或者长度为0，如果是则进行扩容操作。

   

   ```java
   if ((tab = table) == null || (n = tab.length) == 0)
       n = (tab = resize()).length;
   ```

3. 根据哈希值计算下标，如果对应小标正好没有存放数据，则直接插入即可否则需要覆盖。`tab[i = (n - 1) & hash])`

4. 判断tab[i]是否为树节点，否则向链表中插入数据，是则向树中插入节点。

5. 如果链表中插入节点的时候，链表长度大于等于8，则需要把链表转换为红黑树。`treeifyBin(tab, hash);`

6. 最后所有元素处理完成后，判断是否超过阈值；`threshold`，超过则扩容。

#### get流程

##### jdk1.7

当get某个元素时，根据key得到hash，拿到数组[hash]的那个链表，遍历这个链表，是否有key这个元素。

##### jdk1.8

![HashMap查找流程图](Java%E9%9B%86%E5%90%88.assets/collection-14.png)

HashMap的查找就简单很多：

1. 使用扰动函数，获取新的哈希值
2. 计算数组下标，获取节点
3. 当前节点和key匹配，直接返回
4. 否则，当前节点是否为树节点，查找红黑树
5. 否则，遍历链表查找。

#### 扩容机制

##### jdk.17

1.7 中整个扩容过程就是一个取出数组元素（实际数组索引位置上的每个元素是每个独立单向链表的头部，也就是发生 Hash 冲突后最后放入的冲突元素），然后遍历以该元素为头的单向链表元素，依据每个被遍历元素的 hash 值，重新计算其在新数组中的下标，然后进行交换。

**原来 hash 冲突的单向链表尾部，扩容交换后，变成了单向链表的头部**

举个例子说明下扩容过程：假设了我们的hash算法就是简单的用key mod 一下表大小。

其中的哈希桶数组table的size=2， 所以key = 3、7、5，put顺序依次为 5、7、3。在mod 2以后都冲突在table[1]这里了。

这里假设负载因子 loadFactor=1，即当键值对的实际大小size 大于 table的实际大小时进行扩容。

接下来的三个步骤是哈希桶数组 resize成4，然后所有的Node重新rehash的过程。

![img](Java%E9%9B%86%E5%90%88.assets/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3BhbmdlMTk5MQ==,size_16,color_FFFFFF,t_70.png)

##### jdk1.8

在jdk1.8中，使用的是2次幂的扩展(指长度扩为原来2倍)，所以，元素的位置要么是在原位置，要么是在原位置再移动2次幂的位置。

看下图可以明白这句话的意思，n为table的长度，图（a）表示扩容前的key1和key2两种key确定索引位置的示例，图（b）表示扩容后key1和key2两种key确定索引位置的示例，其中hash1是key1对应的哈希值(也就是根据key1算出来的hashcode值)与高位与运算的结果。

![img](Java%E9%9B%86%E5%90%88.assets/20170123110634173.png)

元素在重新计算hash之后，因为n变为2倍，那么n-1的mask范围在高位多1bit(红色)，因此新的index就会发生这样的变化：

![img](Java%E9%9B%86%E5%90%88.assets/20170123110716285.png)

因此，我们在扩充HashMap的时候，不需要像JDK1.7的实现那样重新计算hash，只需要看看原来的hash值新增的那个bit是1还是0就好了，是0的话索引没变，是1的话索引变成“原索引+oldCap”。

> [!Note]在jdk1.8中， 观察原先的哈希值，在扩容后数组长度n-1新增的bit位上，对应的二进制是0还是1：
>
> - 0：元素下标位置不变
> - 1：元素下标位置 = 原下标位置 + 未扩容前数组大小

#### 线程安全问题

HashMap不是线程安全的，可能会发生这些问题：

- 多线程下扩容死循环。JDK1.7 中的 HashMap 使用头插法插入元素，在多线程的环境下，扩容的时候有可能导致环形链表的出现，形成死循环。因此，JDK1.8 使用尾插法插入元素，在扩容时会保持链表元素原本的顺序，不会出现环形链表的问题。
- 多线程的 put 可能导致元素的丢失。多线程同时执行 put 操作，如果计算出来的索引位置是相同的，那会造成前一个 key 被后一个 key 覆盖，从而导致元素的丢失。此问题在 JDK 1.7 和 JDK 1.8 中都存在。
- put 和 get 并发时，可能导致 get 为 null。线程 1 执行 put 时，因为元素个数超出 threshold 而导致 rehash，线程 2 此时执行 get，有可能导致这个问题。这个问题在 JDK 1.7 和 JDK 1.8 中都存在。

Java 中有 HashTable、Collections.synchronizedMap、以及 ConcurrentHashMap 可以实现线程安全的 Map。

- HashTable 是直接在操作方法上加 synchronized 关键字，锁住整个table数组，粒度比较大；
- Collections.synchronizedMap 包装封装map，内部定义了一个对象锁，方法内通过对象锁实现；
- ConcurrentHashMap 在jdk1.7中使用分段锁，在jdk1.8中使用CAS+synchronized。

#### 有序问题

HashMap是无序的，根据 hash 值随机插入，迭代HashMap的顺序并不是HashMap放置的顺序。

如果想使用有序的Map，可以使用LinkedHashMap 或者 TreeMap。

### ConcurrentHashMap

#### 实现原理

##### jdk 1.7

从结构上说，1.7版本的ConcurrentHashMap采用分段锁机制，里面包含一个Segment数组，Segment继承于ReentrantLock，Segment则包含HashEntry的数组，HashEntry本身就是一个链表的结构，具有保存key、value的能力能指向下一个节点的指针。

实际上就是相当于每个Segment都是一个HashMap，默认的Segment长度是16，也就是支持16个线程的并发写，Segment之间相互不会受到影响。

![1.7ConcurrentHashMap示意图](Java%E9%9B%86%E5%90%88.assets/collection-31.png)

##### jdk1.8

jdk1.8实现线程安全不是在数据结构上下功夫，它的数据结构和HashMap是一样的，数组+链表+红黑树。

它实现线程安全的关键点在于put流程。



### LinkedHashMap

#### 底层结构

它的底层就是存放了一个HashMap+一个LinkedList

因为维护了一个**双向链表**，可以很好的保持迭代顺序

![F7617227-D760-4421-B5F7-C715051B7629](Java%E9%9B%86%E5%90%88.assets/F7617227-D760-4421-B5F7-C715051B7629.png)

HashMap和双向链表的密切配合和分工合作造就了LinkedHashMap。

除此之外，它又额外定义了一个以head为头结点的空的双向链表节点，因此对于每次put进来Entry还会将其插入到双向链表的尾部。

特别需要注意的是，next用于维护HashMap各个桶中的Entry链（这个链就是HashMap中的单向链表），before、after用于维护LinkedHashMap的双向链表（用来标记先插入了什么数据，然后又插入了什么数据），虽然它们的作用对象都是Entry，但是各自分离，是两码事儿。

![206F6152-2D18-47DB-90AA-8B54F6D7E716](Java%E9%9B%86%E5%90%88.assets/206F6152-2D18-47DB-90AA-8B54F6D7E716.png)

#### put流程

- LinkedHashMap没有重写put方法，通过调用HashMap得到put方法：

```java
    public V put(K key, V value) {
        // 对key为null的处理
        if (key == null)
            return putForNullKey(value);
        // 计算hash
        int hash = hash(key);
        // 得到在table中的index
        int i = indexFor(hash, table.length);
        // 遍历table[index]，是否key已经存在，存在则替换，并返回旧值
        for (Entry<K,V> e = table[i]; e != null; e = e.next) {
            Object k;
            if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
                V oldValue = e.value;
                e.value = value;
                e.recordAccess(this);
                return oldValue;
            }
        }
        
        modCount++;
        // 如果key之前在table中不存在，则调用addEntry，LinkedHashMap重写了该方法
        addEntry(hash, key, value, i);
        return null;
    }
```

- LinkedHashMap重写了addEntry方法

```java
    void addEntry(int hash, K key, V value, int bucketIndex) {
        // 调用父类的addEntry，增加一个Entry到HashMap中
        super.addEntry(hash, key, value, bucketIndex);

        // removeEldestEntry方法默认返回false，不用考虑
        Entry<K,V> eldest = header.after;
        if (removeEldestEntry(eldest)) {
            removeEntryForKey(eldest.key);
        }
    }
```

- LinkedHashMap重写createEntry方法，当put元素时，不但要把它加入到HashMap中去，还要加入到双向链表中

```JAVA
   void createEntry(int hash, K key, V value, int bucketIndex) {
       HashMap.Entry<K,V> old = table[bucketIndex];
       // e就是新创建了Entry，会加入到table[bucketIndex]的表头
       Entry<K,V> e = new Entry<>(hash, key, value, old);
       table[bucketIndex] = e;
       // 把新创建的Entry，加入到双向链表中
       e.addBefore(header);
       size++;
   }
```

LinkedHashMap就是HashMap+双向链表，下面用图来表示逐步往LinkedHashMap中添加数据的过程，红色部分是双向链表，黑色部分是HashMap结构，header是一个Entry类型的双向链表表头，本身不存储数据。

首先是只加入一个元素Entry1，假设index为0：

![image-20230918185631453](Java%E9%9B%86%E5%90%88.assets/image-20230918185631453.png)

当再加入一个元素Entry2，假设index为15：

![image-20230918185641216](Java%E9%9B%86%E5%90%88.assets/image-20230918185641216.png)

当再加入一个元素Entry3, 假设index也是0：

![image-20230918185652230](Java%E9%9B%86%E5%90%88.assets/image-20230918185652230.png)

以上，就是LinkedHashMap的put的所有过程了，总体来看，跟HashMap的put类似，只不过多了把新增的Entry加入到双向列表中。

#### get流程

LinkedHashMap有对get方法进行了重写：

```kotlin
    public V get(Object key) {
        // 调用genEntry得到Entry
        Entry<K,V> e = (Entry<K,V>)getEntry(key);
        if (e == null)
            return null;
        // 如果LinkedHashMap是访问顺序的，则get时，也需要重新排序
        e.recordAccess(this);
        return e.value;
    }
```

先是调用了getEntry方法，通过key得到Entry，而LinkedHashMap并没有重写getEntry方法，所以调用的是HashMap的getEntry方法------ >HashMap的getEntry方法：首先通过key算出hash值，然后根据hash值算出在table中存储的index，然后遍历table[index]的单向链表去对比key，如果找到了就返回Entry。

后面调用了LinkedHashMap.Entry的recordAccess方法，在访问顺序的LinkedHashMap进行了get操作以后，重新排序，把get的Entry移动到双向链表的表尾。

#### 总结

|        **关  注  点**         |         **结    论**         |
| :---------------------------: | :--------------------------: |
|    LinkedHashMap是否允许空    |      Key和Value都允许空      |
| LinkedHashMap是否允许重复数据 | Key重复会覆盖、Value允许重复 |
|     LinkedHashMap是否有序     |           **有序**           |
|   LinkedHashMap是否线程安全   |          非线程安全          |

### TreeMap

TreeMap 是按照 Key 的自然顺序或者 Comprator 的顺序进行排序，内部是通过红黑树来实现。所以要么 key 所属的类实现 Comparable 接口，或者自定义一个实现了 Comparator 接口的比较器，传给 TreeMap 用于 key 的比较。

![TreeMap](Java%E9%9B%86%E5%90%88.assets/collection-35.png)
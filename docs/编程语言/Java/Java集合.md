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

| Map               | key        | Value      | Super       | 是否安全     |
| ----------------- | ---------- | ---------- | ----------- | ------------ |
| HashTable         | 不能为null | 不能为null | Dictionary  | 线程安全     |
| ConcurrentHashMap | 不能为null | 不能为null | AbstractMap | 线程局部安全 |
| TreeMap           | 不能为null | 可以为null | AbstractMap | 线程不安全   |
| HashMap           | 可以为null | 可以为null | AbstractMap | 线程不安全   |
| LinkedHashMap     | 可以为null | 可以为null | HashMap     | 线程不安全   |

### HashMap

对于HashMap来说，将key-value当做一个整体来处理（Entry），同时采用Hash算法来决定key-value的存储位置

#### 红黑树



#### HashMap的存储结构

**JDK1.7**

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

当get某个元素时，根据key得到hash，拿到数组[hash]的那个链表，遍历这个链表，是否有key这个元素

add某个元素时，也是一样，拿到数组[hash]的这个链表，遍历这个链表，是否有key这个元素，如果没有则添加到链表的最后一个，如果有说明是重复元素覆盖原来的值

**JDK1.8**

在jdk1.8后，更改了底层实现方式，采用 **数组 + 链表 + 红黑树** 的方式实现。



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

### LinkedHashMap

LinkeedHashMap是HashMap的一个子类，HashMap是无序的，也就是说，迭代HashMap所得到的元素顺序并不是它们最初放置到HashMap的顺序

#### LinkedHashMap底层结构

它的底层就是存放了一个HashMap+一个LinkedList

因为维护了一个双向链表可以很好的保持迭代顺序

![F7617227-D760-4421-B5F7-C715051B7629](Java%E9%9B%86%E5%90%88.assets/F7617227-D760-4421-B5F7-C715051B7629.png)

HashMap和双向链表的密切配合和分工合作造就了LinkedHashMap。

除此之外，它又额外定义了一个以head为头结点的空的双向链表节点，因此对于每次put进来Entry还会将其插入到双向链表的尾部。

特别需要注意的是，next用于维护HashMap各个桶中的Entry链（这个链就是HashMap中的单向链表），before、after用于维护LinkedHashMap的双向链表（用来标记先插入了什么数据，然后又插入了什么数据），虽然它们的作用对象都是Entry，但是各自分离，是两码事儿。

![206F6152-2D18-47DB-90AA-8B54F6D7E716](Java%E9%9B%86%E5%90%88.assets/206F6152-2D18-47DB-90AA-8B54F6D7E716.png)




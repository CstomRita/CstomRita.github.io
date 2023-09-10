@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## 语法篇

### 深拷贝和浅拷贝的区别

浅拷贝：仅仅是指向被复制的内存地址，如果原地址发生改变，那么浅复制出来的对象也会相应的改变。

深拷贝：在计算机中开辟一块**新的内存地址**用于存放复制的对象。

## 集合篇

### Java中的集合有哪些？

Java集合大致可以分为Set、List、Queue和Map四种体系。

其中，List、Set、Queue的父接口都是Collection，List代表有序、重复的集合；Set代表无序、不可重复的集合；Java 5 又增加了Queue体系集合，代表一种队列集合。

Map是另外的接口，是键值对映射结构的集合。

### ArrayList如何扩容？

ArrayList是基于数组的集合，数组的容量是在定义的时候确定的，如果数组满了，再插入，就会数组溢出。所以在插入时候，会先检查是否需要扩容，如果当前容量+1超过数组长度，就会进行扩容。

ArrayList的扩容是创建一个**1.5倍**的新数组，然后把原数组的值拷贝过去。

### ArrayList和LinkedList的区别？

1. 数据结构不同：ArrayList基于数组实现；LinkedList基于双向链表实现
2. 是否支持随机访问不同：ArrayList基于数组可以根据下标查找，支持随机访问；LinkedList基于链表，所以它没法根据序号直接获取元素，不支持随机访问。
3. 查找时间复杂度不同：ArrayList基于数组实现，get(int index)可以直接通过数组下标获取，时间复杂度是O(1)；LinkedList基于链表实现，get(int index)需要遍历链表，时间复杂度是O(n)；当然，get(E element)这种查找，两种集合都需要遍历，时间复杂度都是O(n)。
4. 增删复杂度不同：ArrayList增删如果是数组末尾的位置，直接插入或者删除就可以了，但是如果插入中间的位置，就需要把插入位置后的元素都向前或者向后移动，甚至还有可能触发扩容；双向链表的插入和删除只需要改变前驱节点、后继节点和插入节点的指向就行了，不需要移动元素。所以，多数情况下，ArrayList更利于查找，LinkedList因为移动的平均步长短更利于增删。
5. 内存占用不同：ArrayList基于数组，是一块连续的内存空间，LinkedList基于链表，内存空间不连续，它们在空间占用上都有一些额外的消耗：ArrayList是预先定义好的数组，可能会有空的内存空间，存在一定空间浪费；LinkedList每个节点，需要存储前驱和后继，所以每个节点会占用更多的空间。

### 快速失败和安全失败机制，采用这些机制的集合有哪些？

**1、快速失败（fail—fast）**：快速失败是Java集合的一种错误检测机制，用于用迭代器遍历一个集合对象时，如果线程A遍历过程中，线程B对集合对象的内容进行了修改（增加、删除、修改），则会抛出Concurrent Modification Exception。

java.util包下的集合类都是快速失败的，不能在多线程下发生并发修改（迭代过程中被修改），比如ArrayList 类

实现的原理为：迭代器在遍历时直接访问集合中的内容，并且在遍历过程中使用一个 `modCount` 变量。集合在被遍历期间如果内容发生变化，就会改变`modCount`的值。每当迭代器使用hashNext()/next()遍历下一个元素之前，都会检测modCount变量是否为expectedmodCount值，是的话就返回遍历；否则抛出异常，终止遍历。

> 这里异常的抛出条件是检测到 modCount！=expectedmodCount 这个条件。如果集合发生变化时修改modCount值时，刚好又设置为了expectedmodCount值，则异常不会抛出。因此，不能依赖于这个异常是否抛出而进行并发操作的编程，这个异常只建议用于检测并发修改的bug。

**2、安全失败（fail—safe）**：采用安全失败机制的集合容器，在遍历时不是直接在集合内容上访问的，而是先复制原有集合内容，在拷贝的集合上进行遍历。

java.util.concurrent包下的容器都是安全失败，可以在多线程下并发使用，并发修改，比如CopyOnWriteArrayList类。

安全失败的实现原理原理：由于迭代时是对原集合的拷贝进行遍历，所以在遍历过程中对原集合所作的修改并不能被迭代器检测到，所以不会触发Concurrent Modification Exception。基于拷贝内容的优点是避免了Concurrent Modification Exception，但同样地，迭代器并不能访问到修改后的内容，即：迭代器遍历的是开始遍历那一刻拿到的集合拷贝，在遍历期间原集合发生的修改迭代器是不知道的。

### ArrayList如何序列化？

ArrayList底层使用`transient`修饰存储元素的`elementData`的数组，这样的作用是让被修饰的成员属性不被序列化，这样是出于效率的考虑，数组可能长度100，但实际只用了50，剩下的50不用其实不用序列化，这样可以提高序列化和反序列化的效率，还可以节省内存空间。

ArrayList通过两个方法**readObject、writeObject**自定义序列化和反序列化策略，实际直接使用两个流`ObjectOutputStream`和`ObjectInputStream`来进行序列化和反序列化。

### 如何实现线程安全的ArrayList？

保证ArrayList的线程安全可以通过这些方案：

- 使用Vector，Vector的线程安全实现方式是对所有读写操作方法都加上了synchronized关键字。
- 使用 CopyOnWriteArrayList 代替 ArrayList。
- 在使用 ArrayList 时，应用程序通过同步机制去控制 ArrayList 的读写。
- 使用 Collections.synchronizedList 包装 ArrayList，然后操作包装后的 list。

### 说一下CopyOnWriteArrayList？

CopyOnWriteArrayList，核心是写时复制，是线程安全版本的ArrayList。

CopyOnWriteArrayList采用了一种读写分离的并发策略。读操作是无锁的，写操作时拷贝一个副本，并在副本上加锁，在新副本上执行写操作，结束之后再将原容器的引用指向新容器。

### synchronizedList和vector的区别？

这两者都是线程安全的，但在实现方式上有区别：

- 应用定位不同：Vector是线程安全的List，定位是一个基础的集合结构，底层是数组实现，使用Vector必须要转成Vector的数组结构；SynchronizedList的定位是一个包装类，可以包装所有List的子类，即可以实现同步，完全不会修改底层数据结构。
- 锁机制不同：Vector对读写操作都加了锁，而SynchronizedList仅对写操作加锁，如果要线程安全地遍历，必须要在外面再加一层锁。
- 锁对象不同：Vector使用的同步方法，锁定的是this对象；而SynchronizedList使用的同步代码块，锁对象默认是this对象，也可以是构造器传入的Object对象。
- 扩容机制不同：Vector可以指定扩容大小，默认扩容到原来的 2 倍；SynchronizedList采用ArrayList的扩容，只能扩容到 1.5 倍，没有办法自定义扩容大小。



### 线程安全的集合有哪些？



## JUC


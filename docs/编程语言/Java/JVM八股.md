@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## 类加载机制篇

### 简述Java类加载机制过程？

虚拟机把Class文件加载到内存，并对数据进行校验，解析和初始化，最终形成可以被虚拟机直接使用的java类型的过程称为类加载过程。

类从加载到虚拟机内存的过程包括了加载、验证、准备、解析、初始化五个阶段：

1、加载阶段就是把class字节码文件载入到虚拟机中，在堆内存中生成class对象。

2、验证阶段是确保class文件的字节流中信息符合虚拟机的要求，不会危害虚拟机安全。

3、准备阶段的工作就是为类的静态变量分配内存并设为jvm默认的初值。

4、解析阶段中，虚拟机将常量池中的符号引用替换为直接引用。

5、初始化阶段，虚拟机将执行类变量的赋值动作、静态语句块等类构造器方法。前面的类加载过程中，除了加载阶段用户可以通过自定义类加载器参与之外，其余动作完全由虚拟机主导和控制。到了初始化阶段，才真正开始执行类中定义的Java代码。

### 类加载器有哪些？

1、启动类加载器，是虚拟机自身的一部分，用来加载Java_HOME/lib/目录中的，或者被 -Xbootclasspath 参数所指定的路径中并且被虚拟机识别的类库；

2、扩展类加载器：负责加载\lib\ext目录或Java. ext. dirs系统变量指定的路径中的所有类库；

3、应用程序类加载器：负责加载用户类路径classpath上的指定类库，我们可以直接使用这个类加载器。一般情况，如果我们没有自定义类加载器默认就是用这个加载器。

4、自定义类加载器：重写findClass()方法，实现业务自己需要的类加载器。

### 什么是双亲委派模型？

除了启动类加载器外，其他类加载器都要有自己的父类加载器。 

如果一个类接收到了类加载请求，首先将请求派给父加载器加载，如果父加载器没有所需的类无法完成加载时，再由子加载器加载。

**采用双亲委派模型是为了保证基础类的统一。** 

两个类是否相等取决于两个类来自同一个class文件+被同一个加载器加载。 

如果没有双亲委派模型，两个全限定名完全相同的类由各自的类加载器加载，相当于两个不同的类，加载不会出错，但是对这个类进行引用时，由于全限定名一致并没有任何措施知道引用的到底是哪一个类，如此系统中类将处于混乱的状态。**采用双亲委派模型是为了保证基础类的统一。** 

### 双亲委派模型可以打破吗？

可以打破，双亲委派模型并不是一种强制性的约束，只是 JDK 官方推荐的一种方式。

如果我们因为某些特殊需求想要打破双亲委派模型，可以通过重写loadClass()方法打破

## JVM内存模型篇

### JVM的主要组成部分和作用

JVM包含两个子系统和两个组件，两个子系统为Class loader(类装载)、Execution engine(执行引擎)；两个组件为Runtime data area(运行时数据区)、Native Interface(本地接口)，其中：

1. Class loader(类装载)：根据给定的全限定名类名来装载class文件到JVM内存。
2. Execution engine（执行引擎）：执行classes中的指令。
3. Runtime data area(运行时数据区域)：这就是我们常说的JVM的内存。
4. Native Interface(本地接口)：与native libraries交互，是其它编程语言交互的接口。

### JVM运行时内存有哪些组成部分？

**JVM运行时内存**划分成以下五个部分：

1. 方法区：线程共享的，存储类信息、常量、静态变量、编译后代码等等。同样是不需要物理上内存连续、只要在逻辑上连续、大小可固定可扩展的一块区域，可能抛出OutOfMemoryerror异常。  

   > <font color=red>方法区用于存储已被虚拟机加载的类型信息、常量、静态变量、即时编译器编译后的代码缓存等。</font>

2. 堆：线程共享的，是JVM管理内存中最大的一块，在虚拟机启动时被创建，目的是存放对象实例、不需要物理上内存连续、只要在逻辑上连续、大小可固定可扩展的一块区域，所有的对象实例及数组都在堆上分配，也是GC的主要区域。可能抛出OutOfMemoryerror异常。

   > 此内存区域的唯一目的就是存放对象实例，几乎所有的对象实例以及数据都在这里分配内存。

3. Java虚拟机栈：：也就是说这部分就是一个存放栈帧的栈，栈帧来存放局部变量表，操作数栈、动态链接、方法出口等信息，方法调用就是栈帧的入栈，方法执行完成就是栈帧出栈。是线程私有的，生命周期与线程一致，描述Java方法执行的内存模型，可能抛出stackoverflow异常、或者outofmemoryerror异常。

   > 主管 Java 程序的运行，它保存方法的局部变量、部分结果，并参与方法的调用和返回

4. 本地方法栈：与虚拟机栈的作用是一样的，只不过虚拟机栈是服务 Java 方法的，而本地方法栈是为虚拟机调用 Native 方法服务的。线程私有的，可能抛出stackoverflow异常或者outofmemoryerror异常。

   > 本地方法栈用于管理本地方法的调用

5. 程序计数器：是用来指示当前线程所执行字节码行号的一块小内存，线程私有的，字节码解析器的工作是通过改变这个计数器的值，来选取下一条需要执行的字节码指令，是唯一一个没有内存溢出情况的区域。

   > PC 寄存器用来存储指向下一条指令的地址，即将要执行的指令代码。由执行引擎读取下一条指令。

### 堆和栈的区别？

1. 物理地址不同：栈使用的是数据结构中的栈，先进后出的原则，物理地址分配是连续的；而堆的物理地址分配对对象是不连续的；
2. 分配大小不同：栈的大小是在编译器确定的，大小是固定的；堆的大小是运行期确认的，大小不固定，且一般远远大于栈的大小。
3. 存放内容不同：栈中存放的是局部变量、操作数栈等信息；堆中存放的是所有的对象实例和数组。
4. 线程可见度不同：栈是线程私有的，生命周期和线程一致；堆是线程共享的。

### 什么情况下会发生栈内存溢出？

栈发生主要会抛出两种异常：

一、如果线程请求的栈深度大于虚拟机所允许的最大深度，将抛出StackOverflowError异常，这种情况一般发生在方法的递归使用中，递归深度非常大时，栈帧会不断地被压入栈中，最终导致栈内存溢出。

二、如果新建线程的时候，没有足够的内存去创建对应的虚拟机栈，那么JVM将抛出一个OutOfMemory异常，这种一般是线程启动过多，内存不够分配。

### JVM中的常量放在哪里

> 首先注意区分class常量池和运行时常量池，这里问的应该是运行时常量池：
>
> - class常量池是一个类编译成class文件后字节码的一部分，将这一部分字节码流定义为常量池，说到底就是class字节码的一部分：用于编译器生成的各种字面量(Literal)和符号引用(Symbolic References)， 字面量包括：1.文本字符串 2.八种基本类型的值 3.被声明为final的常量等;符号引用包括：1.类和方法的全限定名 2.字段的名称和描述符 3.方法的名称和描述符。每个class文件都有一个class常量池。 
> - 运行时常量池是JVM的一块内存区域，是一块真实的内存。在加载阶段，class字节码的常量池部分将被加载到运行时常量池中；在解析阶段，会把符号引用替换为直接引用。

一、在Hostspot6及之前，运行时常量池包括字符串常量、静态变量都存在永久代(方法区)中；

二、在Hostspot7中，运行时常量池存在永久代中(方法区)中，字符串常量、静态变量移至堆中保存；

三、在Hostspot8之后，运行时常量池保存在本地内存的元空间，字符串常量、静态变量仍然在堆中保存。

### 堆中的内存结构？

1. 1.7版本中，采用永久代实现方法区的规范，占有的依然是堆中的内存，在此版本中堆空间的逻辑结构为： 

   主要分为新生代、老年代、永久代三大部分 

2. 在1.8版本中，不再使用老年代的方法实现方法区，反而采用了元空间的方式实现，元空间并不在虚拟机中，占有的是本地内存。

   此版本中堆空间的逻辑结构仅有新生代、老年代两大部分，但是增加了一个本机内存元空间。 

**Q：为什么做如此变化**

A:

1. 类和方法信息难以确定大小，所以难以指定永久代的大小，如果指定大了其他空间小了则容易造成老年代的溢出，指定小了则易造成永久代的溢出。 
2. 永久代的垃圾收集是和老年代(old generation)捆绑在一起的Full GC的，因此无论谁满了，都会触发永久代的垃圾收集，然而永久代的GC复杂度较高、而效率又很低。 
3. 使用本地内存，不占用堆的内存，不必权衡永久代的大小了，当元空间的内存大小超过额度时才会GC。

### 内存溢出和内存泄漏的区别？

内存泄漏：是指程序在申请内存后，无法释放已申请的内存空间，一次内存泄露危害可以忽略，但内存泄露堆积后果很严重，无论多少内存，迟早会被占光。

内存溢出：是指程序在申请内存时，没有足够的内存空间供其使用，出现out of memory。

### Java可能出现内存泄漏吗？

理论上Java因为有GC机制不会存在内存泄漏的问题，但是在实际开发中，常常有无用、但是可达的对象，这些对象不会被GC回收。

主要原因是：长生命周期的对象持有短生命周期对象的引用，短生命周期的对象已经不再使用但是因为长生命周期的引用而不能回收。

常见的情况包括：

 主要包括：

1. **静态集合类引起内存泄漏。**HashMap、Vector等静态变量的生命周期与应用程序一致，他们所持有的对象不能释放，即便这个对象为null，也会一直在hashmap中引用不被回收，如果想回收这个对象必须在hashmap中remove。

2. **集合类对象属性改变引起hashcode改变之后，想通过remove删除这个对象**：此时再remove这个对象就会发现找不到这个对象，则会一直持有这个对象的引用。

3. **内部类和外部模块之间的引用**：单例对象持有外部引用，单例对象在初始化之后将会以静态变量的方式存在于JVM的整个生命周期，如果此单例对象持有外部引用，则不能被JVM正常回收，导致内存泄漏。

4. **连接池**：比如数据库连接、socket等，除非其显式的调用了close方法将其连接关闭，否则是不会自动被GC 回收的。

   > 对于Resultset 和Statement 对象可以不进行显式回收，但Connection 一定要显式回收，因为Connection 在任何时候都无法自动回收，而Connection一旦回收，Resultset 和Statement 对象就会立即为NULL。
   >
   > 但是如果使用连接池，情况就不一样了，除了要显式地关闭连接，还必须显式地关闭Resultset Statement 对象（关闭其中一个，另外一个也会关闭），否则就会造成大量的Statement 对象无法释放，从而引起内存泄漏。这种情况下一般都会在try里面去的连接，在finally里面释放连接。

5. **监听器**：通常一个应用当中会用到很多监听器，我们会调用一个控件的诸如addXXXListener()等方法来增加监听器，但往往在释放对象的时候却没有记住去删除这些监听器，从而增加了内存泄漏的机会。

### 知道直接内存吗？

直接内存并不是 JVM 运行时数据区的一部分，是使用本地方法库时分配的堆外内存，避免了在 Java堆和 Native 堆中来回复制数据, 因此在一些场景中可以显著提高性能。

比如，NIO 提供了基于 Channel 与 Buﬀer 的 IO 方式, 它可以使用 Native 函数库直接分配堆外内存, 然后使用DirectByteBuﬀer 对象作为这块内存的引用进行操作。

### 64 位 JVM 中，int 的长度是多数？

Java 中，int 类型变量的长度是一个固定值，与平台无关，都是 32 位。

在 32 位 和 64 位 的 Java 虚拟机中，int 类型的长度是相同的。

### 32位JVM和64位JVM的区别？

区别在于最大堆的内存数不同。

理论上说上 32 位的 JVM 堆内存可以到达 2^32， 即 4GB，但实际上会比这个小很多，不同操作系统之间不同。

64 位 JVM 允许指定最大的堆内存，理论上可以达到 2^64，实际上指定堆内存大小可以达到 100GB。甚至有的 JVM，如 Azul，堆内存到 1000G 都是可能的。

可以检查某些系统属性如 sun.arch.data.model 或 os.arch 来获取JVM位数信息。

### JRE、JDK、JVM 及 JIT 之间有什么不同？

JRE 代表 Java 运行时（Java run-time），是运行 Java 必须引用的。

JDK 代表 Java 开发工具（Java development kit），是 Java 程序的开发工具，如 Java编译器，它也包含 JRE。

JVM 代表 Java 虚拟机（Java virtual machine），它的责任是运行 Java 应用。

JIT 代表即时编译（Just In Time compilation），当代码执行的次数超过一定的阈值时，会将 Java 字节码转换为本地代码，如，主要的热点代码会被准换为本地代码，这样有利大幅度提高 Java 应用的性能。

## GC

### 线上服务CPU占有过高怎么排查？

1. 先用top命令需要找出那个进程占用 CPU 高。

2. 根据`top -Hp 进程 ID `找到对应进行里哪个线程占用 CPU 高

3. 找到对应线程 ID 后，再用`jstack PID `打印出对应线程的堆栈信息，查看是否有线程长时间的 watting 或 blocked，如果线程长期处于 watting 状态下，说明线程在等待这把锁，然后根据锁的地址找到持有锁的线程。

   >  printf "%x\n" PID 把线程 ID 转换为 16 进制。jstack PID 打印出进程的所有线程信息，从打印出来的线程信息中找到上一步转换为 16 进制的线程 ID 对应的线程信息

4. 最后根据线程的堆栈信息定位到具体业务方法,从代码逻辑中找到问题所在

### 内存飙高如何排查？

内存飚高如果是发生在 java 进程上，一般是因为创建了大量对象所导致，持续飚高说明垃圾回收跟不上对象创建的速度，或者内存泄露导致对象无法回收，可以如下排查：

1. `jstat -gc PID 1000`查看 GC 次数，时间等信息，每隔一秒打印一次。如果每次 GC 次数频繁，而且每次回收的内存空间也正常，那说明是因为对象创建速度快导致内存一直占用很高；如果每次回收的内存非常少，那么很可能是因为内存泄露导致内存一直无法被回收。
2. `jmap`命令导出堆内存文件快照，使用 visualVM 对 dump 文件进行离线分析，找到占用内存高的对象，再找到创建该对象的业务代码位置，从代码和业务场景中定位具体问题。

### 简述GC机制？

GC 是垃圾收集的意思，Java 提供的 GC 机制可以自动监测对象是否超过作用域从而达到自动回收内存的目的。

### 如何判断一个对象是否可以回收？

一般有两种方法来判断：

引用计数器法：为每个对象创建一个引用计数，有对象引用时计数器 +1，引用被释放时计数 -1，当计数器为 0 时就可以被回收。但它的缺点是两个对象出现循环引用的情况下，此时引用计数器永远不为 0，导致无法对它们进行回收

可达性分析算法：从 GC Roots 开始向下搜索，搜索所走过的路径称为引用链。当一个对象到 GC Roots 没有任何引用链相连时，则证明此对象是可以被回收的。

### 哪些对象可以作为GC Roots？

**GC Root采用栈方式存放变量和指针，所以如果一个指针，它保存了堆内存里面的对象，但是自己又不存放在堆内存里面，那它就是一个Root。**

常见的GC Root包括：

1. 虚拟机栈中引用的对象

2. 方法区类静态变量引用的对象

3. 方法区中常量引用的对象

4. 本地方法栈中引用的对象

### 四种引用类型的区别？

Java中一共有四种引用类型：

1、强引用：平时new了一个对象就是强引用，他的特点是只要强引用还在，发生 gc 的时候不会被回收，在内存不足的情况下，JVM宁愿抛出OutOfMemory错误也不会回收这种对象。

2、软引用：创建了SoftReference的对象即为软引用，他的特点是内存空间足够，垃圾回收器就不会回收它，如果内存空间不足了，就会回收这些对象的内存。

3、弱引用：创建了WeakReference的对象即为弱引用，他的特点是一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存，因此弱引用具有更短的生命周期。

4、虚引用：创建了PhantomReference的对象为虚引用。一个对象是否有虚引用的存在，完全不会对其生存时间构成影响，也无法通过虚引用取得一个对象。为一个对象设置虚引用关联的唯一目的就是能在这个对象被回收时收到一个系统通知。

### 四种引用类型的应用场景？

1、强引用表示对象的正常状态。

2、软引用可以用于缓存场景，排除过期数据。

3、弱引用的主要作用是避免内存泄漏，保证无用对象被JVM回收。比如存放多个有弱引用对象的列表，当其中某个对象无用后，该对象将被JVM回收，不会再存在于列表中，防止内存泄漏。`比如ThreadLocal中的弱引用，ThreadLocal对象变量以弱引用的形式存放在ThreadLocalMap中，当threadLocal引用消失的时候，数组中的弱引用也被回收了。如果不使用弱引用，那么threadLocal变量就会一直存在于ThreadLocalMap中，直到线程停止运行。这样的话，就有可能会有内存泄露的风险。`

4、虚引用的主要作用是得知对象被GC的时机，可以利用虚引用来进行销毁前的一些操作，比如说资源释放等。

### 说一下JVM中的分代GC机制？

分代收集法是目前大部分 JVM 所采用的方法，其核心思想是根据对象存活的不同生命周期将内存划分为不同的域，一般情况下将 GC 堆划分为老生代和新生代。

其中在新生代中，分为一块较大的Eden区，和两块较小的Survivor区，默认情况下比例为 8 : 1 : 1，每次使用Eden区和其中一块Survivor区，另外一块Survivor区则保持空白，在新生代中的GC机制为：

1. 首先，每次新创建的对象在Eden区中分配，除了很长的数组、字符串这种需要大量连续空间的大对象会直接进入老年代；
2. 当Eden区内存不够时，触发一次新生代GC，通过复制算法，扫描Eden区和Survivor区中还存活的对象，复制到另外一块Survivor区，之后把Eden区和Survivor区清空
3. 每次从 Survivor移动到另外一个 Survivor区，仍然存活的对象，年龄+1，当年龄到达 15（默认配置是 15）时，升级为老生代。
4. 为了更好适应内存情况，在新生代GC中，并不会一定要等到年龄达到设置的15才会移入老年代，如果Survivor区中相同年龄的所有对象大小的总和大于Survivor空间的一半，年龄大于或等于该年龄的对象可以直接进入老年代。

在老年代中，每次新生代GC时会检查老年代剩余连续空间是否大于新生代所有对象的总空间，若小于则依据虚拟机是否允许担保的设置，选择触发老年代垃圾回收。

以上这些循环往复就构成了整个分代垃圾回收的整体执行流程。

### 分配担保机制是什么？

在发生 Minor GC 之前，虚拟机先检查老年代最大可用的连续空间是否大于新生代所有对象总空间，如果条件成立的话，那么 Minor GC 可以确认是安全的。

如果不成立的话，虚拟机会查看 HandlePromotionFailure 设置值是否允许担保失败：

1. 如果允许：那么就会继续检查老年代最大可用的连续空间是否大于之前晋升到老年代对象的平均大小：
   1. 如果大于，将尝试着进行一次 Minor GC，如果尝试失败，则也会引发一次Full GC。
   2. 如果小于，将进行一次Full GC。
2. 如果 HandlePromotionFailure 设置不允许冒险，将进行一次 Full GC。

### MinorGC和Full GC的区别？

Minor GC是指发生在新生代的 GC，因为 Java 对象大多都是朝生夕死，所有 Minor GC 非常频繁，一般回收速度也非常快。

Full GC是指发生在老年代的 GC，出现了 Full GC 通常会伴随至少一次 Minor GC。Full GC 的速度通常会比 Minor GC 慢 10 倍以上。

### MinorGC 和Full GC的触发时间？

一、对于 Minor GC，其触发条件非常简单，当Eden区域中没有足够的空间存放新创建的对象时会触发一次MinorGC。

二、对于Full GC，其触发时机包括以下情况：

1. **调用 System.gc()**

只是建议虚拟机执行 Full GC，但是虚拟机不一定真正去执行。不建议使用这种方式，而是让虚拟机管理内存。

2. **老年代空间不足**

老年代空间不足的常见场景为大对象直接进入老年代、长期存活的对象进入老年代等，导致老年代空间不足，不满足空间分配担保成功的条件时，引发Full GC

3. **空间分配担保失败**

老年代的内存空间作担保，如果担保失败会执行一次 Full GC。

4. **JDK 1.7 及以前的永久代空间不足**

在 JDK 1.7 及以前，HotSpot 虚拟机中的方法区是用永久代实现的，永久代中存放的为一些 Class 的信息、常量、静态变量等数据。

当系统中要加载的类、反射的类和调用的方法较多时，永久代可能会被占满，在未配置为采用 CMS GC 的情况下也会执行 Full GC。如果经过 Full GC 仍然回收不了，那么虚拟机会抛出 java.lang.OutOfMemoryError。

> 其他：
>
> Concurrent Mode Failure
>
> 对于CMS收集器而言，执行 CMS GC 的过程中同时有对象要放入老年代，而此时老年代空间不足(可能是 GC 过程中浮动垃圾过多导致暂时性的空间不足)，便会报 Concurrent Mode Failure 错误，并触发 Full GC。

### jvm的对象分配规则？

1. 对象优先分配在Eden区，如果Eden区没有足够的空间时，虚拟机执行一次Minor GC。如果本次 GC 后还是没有足够的空间，则将启用分配担保机制在老年代中分配内存。
2. 需要大量连续内存空间的大对象直接进入老年代。这样做的目的是避免在Eden区和两个Survivor区之间发生大量的内存拷贝。
3. 长期存活的对象进入老年代。
4. 动态判断对象的年龄。如果Survivor区中相同年龄的所有对象大小的总和大于Survivor空间的一半，年龄大于或等于该年龄的对象可以直接进入老年代。

### 垃圾收集算法有哪些？

常见的几种垃圾收集算法： 

1. 标记-清除算法，标记出所有需要回收的对象，标记完成之后统一回收所有被标记的对象。缺点：效率较低，标记和清除阶段的效率都很低；回收后会产生大量的内存碎片，不利于分配大对象。 
2. 复制算法，将内存分成大小相等两块，每次使用其中的一块，另外一块作为备用；当其中一块使用完，将存活的对象复制到另外一块中，之后清除整个这一块的内存。此中方法适用于生命周期不长的对象，存活下的对象比较少的情况，新生代就使用的这种方法。 
3. 标记-整理算法：将所有需要回收的对象标记出来，之后令还存活的对象向内存区域的一端移动，将需要回收的对象挤出边界外，之后直接清理掉边界外的内存。此种方法不会产生空间碎片，但是移动整理需要花费一定时间。 

## 调优篇

### JVM怎么调优？

一般情况下， JVM 参数配置大多还是会遵循 JVM 官方的建议，例如：

- -XX:NewRatio=2，年轻代:老年代=1:2
- -XX:SurvivorRatio=8，eden:survivor=8:1
- 堆内存设置为物理内存的3/4左右

如果是业务情况比较特殊的话，可以依照经验调整部分参数，比如O密集型的可以稍微把「年轻代」空间加大些，因为大多数对象都是在年轻代就会灭亡。内存计算密集型的可以稍微把「老年代」空间加大些，对象存活时间会更长些。

但大多数情况都是出现内存不足、CPU飙高等问题时，利用java自带的命令工具，了解内部的线程情况、GC情况，并根据具体情况分析优化，具体包括：

1. 用`jstack PID `打印出对应线程的堆栈信息，查看是否有线程长时间的 watting 或 blocked，排查是否有死锁问题。
2. 用`jstat`命令查看各个内存区域GC概况和统计，是否存在频繁GC的情况。
3. 用`jmap`命令导出堆内存文件快照，对文件进行离线分析，找到占用内存高的对象，排查是否有大量大对象或者长生命周期对象，定位代码逻辑是否有问题等等。

### 如何避免内存泄漏？

内存泄漏是指对象可达但不可用，对象已不会被使用但是内存并没有被释放，一次内存泄露危害可以忽略，但内存泄露堆积后果很严重，无论多少内存,迟早会被占光。

是指程序在申请内存后，无法释放已申请的内存空间，一次内存泄露危害可以忽略，但内存泄露堆积后果很严重，无论多少内存,迟早会被占光。

日常代码上如何避免：

1. **尽早释放无用对象的引用**

   好的办法是使用临时变量的时候，让引用变量在推出活动域后自动设置为null，暗示垃圾收集器来收集该对象，防止发生内存泄漏。

2. **程序进行字符串处理时，尽量避免使用String，而应该使用StringBuffer。** 
   因为String类是不可变的，每一个String对象都会独立占用内存一块区域。

3. **尽量少用静态变量**
   因为静态变量是全局的，存在方法区，GC不会回收。（用永久代实现的方法区，垃圾回收行为在这个区域是比较少出现的，垃圾回收器的主要目标是针对常量池和类型的卸载）

4. **避免集中创建对象，尤其是大对象，如果可以的话尽量使用流操作** 
   JVM会突然需要大量内存，这时会出发GC优化系统内存环境

5. **尽量运用对象池技术以提高系统性能**
   生命周期长的对象拥有生命周期短的对象时容易引发内存泄漏，例如大集合对象拥有大数据量的业务对象的时候，可以考虑分块进行处理，然后解决一块释放一块的策略。

6. **不要在经常调用的方法中创建对象，尤其忌讳在循环中创建对象** 
   可以适当的使用hashtable，vector创建一组对象容器，然后从容器中去取这些对象，而不用每次new之后又丢弃。

### 频繁minor gc如何优化？

通常情况下，由于新生代空间较小，Eden 区很快被填满，就会导致频繁 Minor GC，因此可以通过增大新生代空间`-Xmn`来降低 Minor GC 的频率。

### 频繁Full Gc如何排查？

Full GC的导致原因有可能是如下情况：

- **大对象**：系统一次性加载了过多数据到内存中（比如 SQL 查询未做分页），导致大对象进入了老年代。
- **内存泄漏**：频繁创建了大量对象，但是无法被回收（比如 IO 对象使用完后未调用 close 方法释放资源），先引发 FGC，最后导致 OOM.
- 程序频繁生成一些**长生命周期的对象**，当这些对象的存活年龄超过分代年龄时便会进入老年代，最后引发 FGC. （即本文中的案例）
- **程序 BUG**
- 代码中**显式调用了 gc**方法，包括自己的代码甚至框架中的代码。
- JVM 参数设置问题：包括总内存大小、新生代和老年代的大小、Eden 区和 S 区的大小、元空间大小、垃圾回收算法等等

在了解这些原因后，可尝试排查：

1. 利用`jstat`等工具查看当前 Full GC 的频率是否正常，了解该时间点之前有没有程序上线、基础组件升级等情况。
2. 根据Full GC可能出现的原因做排除法，利用`jmap`命令查看目前堆内存活的对象及大小，排查是否是大对象或者长生命周期对象导致的 Full GC，定位可疑对象。
3. 查看JVM的设置参数，是否是因为参数配置不合理导致的
4. 生成 `dump` 文件，借助工具分析哪 个对象非常多，定位可疑对象
5. 通过可疑对象定位到具体代码再次具体分析。

```shell
# 查看堆内存各区域的使用率以及GC情况
jstat -gcutil -h20 pid 1000
# 查看堆内存中的存活对象，并按空间排序
jmap -histo pid | head -n20
# dump堆内存文件
jmap -dump:format=b,file=heap pid
```

### 如何排查内存泄漏/内存溢出问题？

如果内存出现问题的话，往往可能也有频繁GC、连接对象耗尽等其他表现，还是需要从堆中的对象入手。

1. 使用 `top -Hp [pid]` 查看进程下的所有线程占 CPU 和 内存 的情况，是否有线程占有内存极多的特殊情况，定位可以线程。
2. 使用 `jstat -gccause [pid] 5000` ，同样是输出 GC 摘要信息，是否有频繁Full GC的情况。
3. 使用 `jmap -histo:live [pid]` 输出每个类的对象数量，生成 `dump` 文件，借助工具分析哪 个对象非常多，在 dump 文析结果中查找存在大量的对象，再查对其的引用，查看是否有代码逻辑问题。






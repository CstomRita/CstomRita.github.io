@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## SPI机制

> [!tip]
>
> SPI 全称 Service Provider Interface，是JDK内置的一种**服务提供发现机制**，可以用来启用框架扩展和替换组件，它是一种用于动态加载服务的机制。
>
> Java 中 SPI 机制主要思想是将装配的控制权移到程序之外，在模块化设计中这个机制尤其重要，其核心思想就是解耦。

### 概述

#### 为什么需要SPI

在面向对象编程中，基于开闭原则和解耦的需要，一般建议用接口进行模块之间通信编程，通常情况下调用方模块是不会感知到被调用方模块的内部具体实现，而这种接口调用是需要再程序中显示声明调用何种方法的。

<font color=red>为了实现在模块装配的时候不用在程序里面动态指明</font>，这就需要一种服务发现机制。

Java SPI 就是提供了这样一个机制：为某个接口寻找服务实现的机制。SPI 将服务接口和具体的服务实现分离开来，将服务调用方和服务实现者**解耦**，能够提升程序的扩展性、可维护性。修改或者替换服务实现并不需要修改调用方。

![img](Java%E6%9C%BA%E5%88%B6.assets/eqjfnmzobz6ii_20230814_05c8ee4ce1fe451fb99db802cf0ae65a.jpeg)

这有点类似 IoC 的思想，将装配的控制权移交到了程序之外。

#### 应用场景

SPI机制应用在服务的规范制定者和服务的实现者需要分离的情况，就是接口中方法的规定和实现是分离的，这种机制经常在可选组件和可选插件的场景中使用，通过SPI的机制将具体的实现加载进来。

#### 例子

SPI扩展机制应用场景有很多，比如Common-Logging，JDBC，Dubbo等等。

具体的应用在 Java 的 java.util.spi package 中就约定了很多 SPI 接口。例如：

1. TimeZoneNameProvider: 为 TimeZone 类提供本地化的时区名称。
2. DateFormatProvider: 为指定的语言环境提供日期和时间格式。
3. NumberFormatProvider: 为 NumberFormat 类提供货币、整数和百分比值。
4. Driver: 从 4.0 版开始，JDBC API 支持 SPI 模式。旧版本使用 Class.forName() 方法加载驱动程序。
5. PersistenceProvider: 提供 JPA API 的实现。

> JDBC场景下：
>
> - Java中定义了接口java.sql.Driver，并没有具体的实现，具体的实现都是由不同厂商提供。
> - 在MySQL的jar包mysql-connector-java-6.0.6.jar中，可以找到META-INF/services目录，该目录下会有一个名字为java.sql.Driver的文件，文件内容是com.mysql.cj.jdbc.Driver，这里面的内容就是针对Java中定义的接口的实现。
> - 同样在PostgreSQL的jar包PostgreSQL-42.0.0.jar中，也可以找到同样的配置文件，文件内容是org.postgresql.Driver，这是PostgreSQL对Java的java.sql.Driver的实现。
#### 优缺点

**优点：**

- 灵活性高，可以通过简单地添加或替换实现类来扩展应用程序的功能。

- 具有一定的可扩展性和可维护性，因为它将应用程序和具体实现解耦，实现了高内聚、低耦合的目标。

**缺点：**

- 需要程序员手动编写实现类并在META-INF/services目录下创建配置文件，这样会增加代码量和工作量。
- 存在安全风险，因为实现类是由外部提供的，可能存在恶意实现类的风险。
- 不能按需加载，需要遍历所有的实现，并实例化，然后在循环中才能找到我们需要的实现。如果不想用某些实现类，或者某些类实例化很耗时，它也被载入并实例化了，这就造成了浪费。

#### SPI VS API

![image-20231128135625868](Java%E6%9C%BA%E5%88%B6.assets/image-20231128135625868.png)

![image-20231128135636140](Java%E6%9C%BA%E5%88%B6.assets/image-20231128135636140.png)

两种模式都区分服务提供者和服务调用者的：

- API的服务实现放在服务提供者方那边，和接口一起提供；
- SPI的服务实现可以第三方实现或者自己实现，和接口是分开的。

### 原理

#### 组成部分

1. **SPI 接口：**为服务提供者实现类约定的的接口或抽象类。
2. **SPI 实现类：**实际提供服务的实现类。
3. **SPI 配置：**Java SPI 机制约定的配置文件，提供查找服务实现类的逻辑。配置文件必须置于 META-INF/services 目录中，并且，<font color=red>**文件名应与服务提供者接口的完全限定名保持一致。文件中的每一行都有一个实现服务类的详细信息，同样是服务提供者类的完全限定名称**</font>。
4. **ServiceLoader：**Java SPI 的核心类，用于加载 SPI 实现类。ServiceLoader 中有各种实用方法来获取特定实现、迭代它们或重新加载服务

#### 源码原理

动态加载实现类主要是通过ServiceLoader类来实现。

![image-20231128103818277](Java%E6%9C%BA%E5%88%B6.assets/image-20231128103818277.png)

1. 通过ServiceLoader的load(Class<> service)的类静态方法进入程序内部；

![image-20231128104616321](Java%E6%9C%BA%E5%88%B6.assets/image-20231128104616321.png)

- 静态load方法内获得到当前线程的classloader对象
- load方法内调用构造方法ServiceLoader()

> [!ATTENTION]通过`Thread.currentThread().getContextClassLoader();`这个方法来获取ApplicationClassLoader
>
> 在调用ServiceLoader.load ()方法时，会进行一次重载调用，会多传入了一个新的ClassLoader，这个ClassLoader是ApplicationClassLoader，他的作用是加载目前运行中应用的类对象。
>
> 需要这样做的原因是JDK的双亲委派机制决定的，加载ServiceLoader类的ClassLoader是BootstrapClassLoader，所以默认情况通过他去创建的对象也是BootstrapClassLoader，但通过SPI机制需要加载的实现类都在classpath中，无法被加载，所以需要ApplicationClassLoader加载。

2. 构造方法调用reload() 方法

![image-20231128104849619](Java%E6%9C%BA%E5%88%B6.assets/image-20231128104849619.png)

在reload方法中：

- 清理缓存
- 初始化LazyIterator，注意此处是Lazy，懒加载。此时并不会去加载文件下的内容；只有当遍历器被遍历时，才会去读取配置文件。

3. ServiceLoader实现了Iterable接口，所以它有迭代器的属性。实际使用中，遍历serviceloader，通过serviceloader内部LazyIterator对象的hasNext和next方法进行加载

```java
private class LazyIterator implements Iterator<S> {
    // 服务提供者接口
    Class<S> service;
    // 类加载器
    ClassLoader loader;
    // 保存实现类的url
    Enumeration<URL> configs = null;
    // 保存实现类的全名
    Iterator<String> pending = null;
    // 迭代器中下一个实现类的全名
    String nextName = null;
 
    public boolean hasNext() {
        if (nextName != null) {
            return true;
        }
        if (configs == null) {
            try {
                String fullName = PREFIX + service.getName();
                if (loader == null)
                    configs = ClassLoader.getSystemResources(fullName);
                else
                    configs = loader.getResources(fullName);
            } catch (IOException x) {
                fail(service, "Error locating configuration files", x);
            }
        }
        while ((pending == null) || !pending.hasNext()) {
            if (!configs.hasMoreElements()) {
                return false;
            }
            pending = parse(service, configs.nextElement());
        }
        nextName = pending.next();
        return true;
    }
 
    public S next() {
        if (!hasNext()) {
            throw new NoSuchElementException();
        }
        String cn = nextName;
        nextName = null;
        Class<?> c = null;
        try {
            c = Class.forName(cn, false, loader);
        } catch (ClassNotFoundException x) {
            fail(service,"Provider " + cn + " not found");
        }
        if (!service.isAssignableFrom(c)) {
            fail(service, "Provider " + cn  + " not a subtype");
        }
        try {
            S p = service.cast(c.newInstance());
            providers.put(cn, p);
            return p;
        } catch (Throwable x) {
            fail(service, "Provider " + cn + " could not be instantiated: " + x, x);
        }
        throw new Error();          // This cannot happen
    }
}
```

- hasnext()方法中通过`  String fullName = PREFIX + service.getName();`扫描了所有的配置文件，解析实现类的全限定名

  > 静态变量PREFIX就是”META-INF/services/”目录，这也就是为什么需要在classpath下的META-INF/services/目录里创建一个以服务接口命名的文件

- next()方法通过反射方法Class.forName()将实现类转换为Class类对象加载进来，并用newInstance方法将类实例化，并把实例化后的类缓存到providers对象中，(LinkedHashMap<String,S>类型） 然后返回实例对象。

#### 手写 ServiceLoader

主要的流程：

1. 通过 URL 工具类从 jar 包的 /META-INF/services 目录下面找到对应的文件，
2. 读取这个文件的名称找到对应的 spi 接口，
3. 通过 InputStream 流将文件里面的具体实现类的全类名读取出来，
4. 根据获取到的全类名，先判断跟 spi 接口是否为同一类型，如果是的，那么就通过反射的机制构造对应的实例对象，
5. 将构造出来的实例对象添加到 Providers 的列表中。

```java
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Constructor;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class MyServiceLoader<s> {

    // 对应的接口 Class 模板
    private final Class<S> service;

    // 对应实现类的 可以有多个，用 List 进行封装
    private final List<S> providers = new ArrayList<>();

    // 类加载器
    private final ClassLoader classLoader;

    // 暴露给外部使用的方法，通过调用这个方法可以开始加载自己定制的实现流程。
    public static <S> MyServiceLoader<S> load(Class<S> service) {
        return new MyServiceLoader<>(service);
    }

    // 构造方法私有化
    private MyServiceLoader(Class<S> service) {
        this.service = service;
        this.classLoader = Thread.currentThread().getContextClassLoader();
        doLoad();
    }

    // 关键方法，加载具体实现类的逻辑
    private void doLoad() {
        try {
            // 读取所有 jar 包里面 META-INF/services 包下面的文件，这个文件名就是接口名，然后文件里面的内容就是具体的实现类的路径加全类名
            Enumeration<URL> urls = classLoader.getResources("META-INF/services/" + service.getName());
            // 挨个遍历取到的文件
            while (urls.hasMoreElements()) {
                // 取出当前的文件
                URL url = urls.nextElement();
                System.out.println("File = " + url.getPath());
                // 建立链接
                URLConnection urlConnection = url.openConnection();
                urlConnection.setUseCaches(false);
                // 获取文件输入流
                InputStream inputStream = urlConnection.getInputStream();
                // 从文件输入流获取缓存
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                // 从文件内容里面得到实现类的全类名
                String className = bufferedReader.readLine();

                while (className != null) {
                    // 通过反射拿到实现类的实例
                    Class<?> clazz = Class.forName(className, false, classLoader);
                    // 如果声明的接口跟这个具体的实现类是属于同一类型，（可以理解为Java的一种多态，接口跟实现类、父类和子类等等这种关系。）则构造实例
                    if (service.isAssignableFrom(clazz)) {
                        Constructor<? extends S> constructor = (Constructor<? extends S>) clazz.getConstructor();
                        S instance = constructor.newInstance();
                        // 把当前构造的实例对象添加到 Provider的列表里面
                        providers.add(instance);
                    }
                    // 继续读取下一行的实现类，可以有多个实现类，只需要换行就可以了。
                    className = bufferedReader.readLine();
                }
            }
        } catch (Exception e) {
            System.out.println("读取文件异常。。。");
        }
    }

    // 返回spi接口对应的具体实现类列表
    public List<S> getProviders() {
        return providers;
    }
}
```

### 使用

#### 开发流程

SPI流程：

1. 有关组织和公式定义接口标准
2. 第三方提供具体实现: 实现具体方法
3. 配置 META-INF/services/${interface_name} 文件
4. 开发者使用，使用ServiceLoader类加载配置文件并解析出实现类

#### demo

##### 定义接口

```java
package com.study.spidemo.spi;
public interface HelloSPI {
    void sayHello();
}
```

##### 定义实现类

定义两个实现类

```java
package com.study.spidemo.spi.impl;
import com.study.spidemo.spi.HelloSPI;
public class ImageHello implements HelloSPI {
    public void sayHello() {
        System.out.println("Image Hello");
    }
}
```

```java
package com.study.spidemo.spi.impl;
import com.study.spidemo.spi.HelloSPI;
public class TextHello implements HelloSPI {
    public void sayHello() {
        System.out.println("Text Hello");
    }
}
```

#### 配置文件

在`META-INF/services/`目录里创建一个以`com.study.spidemo.spi.HelloSPI`的文件，这个文件里的内容就是这个接口的具体实现类的全限定名。

```
com.study.spidemo.spi.impl.ImageHello
com.study.spidemo.spi.impl.TextHello
```

#### 使用ServiceLoader加载

```java
import java.util.ServiceLoader;
import com.study.spidemo.spi.HelloSPI;
public class SPIDemo {
    public static void main(String[] args) {
        ServiceLoader<HelloSPI> serviceLoader = ServiceLoader.load(HelloSPI.class);
        // 执行不同厂商的业务实现，具体根据业务需求配置
        for (HelloSPI helloSPI : serviceLoader) {
            helloSPI.sayHello();
        }
    }
}
```

## 异常机制

### 层次结构

![Java：详解Java中的异常(Error与Exception)[通俗易懂]](Java%E6%9C%BA%E5%88%B6.assets/b1a7e20c39031b7dcb122faf3e78630d.jpg)

#### Throwable

Throwable 是 Java 语言中所有错误与异常的超类。

Throwable 包含两个子类：Error（错误）和 Exception（异常），它们通常用于指示发生了异常情况。<font color=red>异常和错误的区别是：异常能被程序本身可以处理，错误是无法处理。</font>

Throwable 包含了其线程创建时线程执行堆栈的快照，它提供了 printStackTrace() 等接口用于获取堆栈跟踪数据等信息，常用方法如下：

```java
1. 返回异常发生时的详细信息
public string getMessage();
 
2. 返回异常发生时的简要描述
public string toString();
 
3. 返回异常对象的本地化信息。使用Throwable的子类覆盖这个方法，可以声称本地化信息。如果子类没有覆盖该方法，则该方法返回的信息与getMessage（）返回的结果相同
public string getLocalizedMessage();
 
4. 在控制台上打印Throwable对象封装的异常信息
public void printStackTrace();
```

#### Error

Error 类及其子类：程序中无法处理的错误，表示运行应用程序中出现了严重的错误。

此类错误一般表示代码运行时 JVM 出现问题，通常有：

1.  Virtual MachineError：虚拟机运行错误
2. NoClassDefFoundError：类定义错误
3.  OutOfMemoryError：内存不足错误；
4. StackOverflowError：栈溢出错误。

<font color=red>此类错误发生时，JVM 将终止线程。这些错误是不受检异常，非代码性错误。因此，当此类错误发生时，应用程序不应该去处理此类错误。</font>

按照Java惯例，不应该实现任何新的Error子类。

#### Exception

程序本身可以捕获并且可以处理的异常。

![image-20231225160751597](Java%E6%9C%BA%E5%88%B6.assets/image-20231225160751597.png)

Exception 这种异常又分为两类，运行时异常和编译时异常：

- **运行时异常**

<font color=red>运行时异常，编译器检查不出来。</font>一般是指编程时的逻辑错误，是程序员应该避免其出现的异常。`java.lang.RuntimeException` 类及它的子类都是运行时异常。<font color=red>对于运行时异常，可以不作处理，因为这类异常很普遍，若全处理可能会对程序的可读性和运行效率产生影响。</font>

常见的运行时异常包括：

1. `NullPointerException` 空指针异常，当应用程序试图在需要对象的地方使用null 时，抛出该异常。
2. `ArithmeticException` 数学运算异常，当出现异常的运算条件时，抛出此异常。例如，一个整数“除以零”时，抛出此类的一个实例。
3. `ArrayIndexOutOfBoundsException` 数组下标越界异常，数组下标越界异常 用非法索引访问数组时抛出的异常。如果索引为负或大于等于数组大小，则该索引为非法索引。
4. `ClassCastException` 类型转换异常，试图将对象强制转换为不是实例的子类时，抛出该异常。
5. `NumberFormatException` 数字格式不正确异常，当应用程序试图将字符串转换成一种数值类型，但该字符串不能转换为适当格式时，抛出该异常。
6. 等等

这些异常是不检查异常，程序中可以选择捕获处理，也可以不处理。这些异常一般是由程序逻辑错误引起的，程序应该从逻辑角度尽可能避免这类异常的发生。

运行时异常的特点是Java编译器不会检查它，也就是说，当程序中可能出现这类异常，即使没有用try-catch语句捕获它，也没有用throws子句声明抛出它，也会编译通过。

- **非运行时异常** （编译异常）

编译时异常，是编译器要求必须处置的异常。

是RuntimeException以外的异常，类型上都属于Exception类及其子类。从程序语法角度讲是必须进行处理的异常，如果不处理，程序就不能编译通过。

常见的编译异常包括：

1. `SQLException`：操作数据库时，查询表可能发生异常
2. `IOException`：操作文件时，发生的异常
3. `FileNotFoundException`：当操作一个不存在的文件时，发生异
4. `ClassNotFoundException`：加载类,而该类不存在时，异常
5. `EOFException`：操作文件,到文件末尾,发生异常
6. `lllegalArguementException` ：参数异常
7. 用户自定义的Exception异常，一般情况下不自定义检查异常。
8. 等等

#### 可查异常/不可查异常

 通常，Java的异常（Throwable）分为**可查的异常（checked exceptions）**和**不可查的异常（unchecked exceptions）**

![image-20231225161617649](Java%E6%9C%BA%E5%88%B6.assets/image-20231225161617649.png)

- **可查异常**（编译器要求必须处置的异常）

正确的程序在运行中，很容易出现的、情理可容的异常状况。可查异常虽然是异常状况，但在一定程度上它的发生是可以预计的，而且一旦发生这种异常状况，就必须采取某种方式进行处理。

除了RuntimeException及其子类以外，其他的Exception类及其子类都属于可查异常。这种异常的特点是Java编译器会检查它，也就是说，当程序中可能出现这类异常，要么用try-catch语句捕获它，要么用throws子句声明抛出它，否则编译不会通过。

- **不可查异常**(编译器不要求强制处置的异常)

包括运行时异常（RuntimeException与其子类）和错误（Error）

### 异常处理

#### 关键字

 - **try** 

用于监听。将要被监听的代码(可能抛出异常的代码)放在try语句块之内，当try语句块内发生异常时，异常就被抛出。

 - **catch** 

 用于捕获异常。catch用来捕获try语句块中发生的异常。

- **finally** 

 finally语句块总是会被执行。它主要用于回收在try块里打开的物力资源(如数据库连接、网络连接和磁盘文件)。只有finally块，执行完成之后，才会回来执行try或者catch块中的return或者throw语句，如果finally中使用了return或者throw等终止方法的语句，则就不会跳回执行，直接停止。

 - **throw** 

用于抛出异常。

 - **throws** 

 用在方法签名中，用于声明该方法可能抛出的异常。

#### 异常捕获

异常捕获处理的方法通常有：

- try-catch
- try-catch-finally
- try-finally
- try-with-resource

##### try-catch-finally

![img](Java%E6%9C%BA%E5%88%B6.assets/java-basic-exception-2.jpg)

- 当try没有捕获到异常时

try语句块中的语句逐一被执行，程序将跳过catch语句块，执行finally语句块和其后的语句；

- 当try捕获到异常，catch语句块里没有处理此异常的情况

当try语句块里的某条语句出现异常时，而没有处理此异常的catch语句块时，此异常将会抛给JVM处理，finally语句块里的语句还是会被执行，但finally语句块后的语句不会被执行；

- 当try捕获到异常，catch语句块里有处理此异常的情况

在try语句块中是按照顺序来执行的，当执行到某一条语句出现异常时，程序将跳到catch语句块，并与catch语句块逐一匹配，找到与之对应的处理程序，其他的catch语句块将不会被执行，而try语句块中，出现异常之后的语句也不会被执行，catch语句块执行完后，执行finally语句块里的语句，最后执行finally语句块后的语句；

> 可以直接用try-finally吗？ 可以。
>
> try块中引起异常，异常代码之后的语句不再执行，直接执行finally语句。 try块没有引发异常，则执行完try块就执行finally语句。
>
> try-finally可用在不需要捕获异常的代码，可以保证资源在使用后被关闭。例如IO流中执行完相应操作后，关闭相应资源；使用Lock对象保证线程同步，通过finally可以保证锁会被释放；数据库连接代码时，关闭连接操作等等。
>
> finally遇见如下情况不会执行
>
> - 在前面的代码中用了System.exit()退出程序。
> - finally语句块中发生了异常。
> - 程序所在的线程死亡。
> - 关闭CPU

##### try-with-resource

###### 用途：关闭资源

如果在finally方法中调用close方法，finally 中的 close 方法也可能抛出 IOException, 从而覆盖了原始异常。

JAVA 7 提供了更优雅的方式来实现资源的自动释放，自动释放的资源需要是实现了 `AutoCloseable` 接口的类。

try-with-resources的语法几乎与通常的try-catch-finally语法相同，唯一的区别是<font color=red>括号后`try`，在其中声明将使用的资源</font>：

```java
public final class Scanner implements Iterator<String>, Closeable {
  // ...
}
public interface Closeable extends AutoCloseable {
    public void close() throws IOException;
}

private  static void tryWithResourceTest(){
    try (Scanner scanner = new Scanner(new FileInputStream("c:/abc"),"UTF-8")){
        // code
    } catch (IOException e){
        // handle exception
    }
}
```

try 代码块退出时，会自动调用 scanner.close 方法。

###### 抑制异常

<font color=red>抑制异常指的是：是在代码中引发的异常，但是以某种方式被忽略了。</font>

为了支持抑制的异常，在 JDK 7 中向`Throwable`类添加了新的构造器和两个新方法：

```java
Throwable.getSupressed(); // Returns Throwable[]
Throwable.addSupressed(aThrowable);
```

try-with-resource和把close 方法放在 finally 代码块中不同的是：

<font color=red>若 close 抛出异常，则会被抑制，抛出的仍然为原始异常，被抑制的异常会由 addSusppressed 方法添加到原来的异常，如果想要获取被抑制的异常列表，可以调用 getSuppressed 方法来获取。</font>

###### 使用对比

使用普通的try/catch语句：

```java
BufferedWriter writer = null;
try {
 writer = new BufferedWriter(new FileWriter(fileName));
 writer.write(str);  // do something with the file we've opened
} catch (IOException e) {
// handle the exception
} finally {
 try {
     if (writer != null)
         writer.close();
 } catch (IOException e) {
    // handle the exception
 }
}
```

使用*try-with-resources*编写的相同代码如下所示：

```java
try(BufferedWriter writer = new BufferedWriter(new FileWriter(fileName))){
 writer.write(str); // do something with the file we've opened
}
catch(IOException e){
 // handle the exception
}
```

从Java 9开始，没有必要一定要在try-with-resources语句中声明资源，可以在外部声明也可：

```java
BufferedWriter writer = new BufferedWriter(new FileWriter(fileName));
try (writer) {
    writer.write(str); // do something with the file we've opened
}
catch(IOException e) {
    // handle the exception
}
```

###### Multiple Resources

*try-with-resources的*另一个好方面是添加/删除我们正在使用*的资源*的简便性，同时确保在完成后它们将被关闭。

如果要使用多个文件，则可以在`try()`语句中打开文件，并用分号将它们分开：

```text
try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName));
    Scanner scanner = new Scanner(System.in)) {
if (scanner.hasNextLine())
    writer.write(scanner.nextLine());
}
catch(IOException e) {
    // handle the exception
}
```

然后，Java会小心地调用`.close()`在中打开的所有资源`try()`。

**注意**：<font color=red>它们以相反的声明顺序关闭</font>，这意味着，在我们的示例中，`scanner`它将在之前关闭`writer`。

###### 原理

看一下使用try-with-resources的写法编译后的字节码再反编译之后的样子：

```java
String readTextFromFile(String path) {
    StringBuilder sb = new StringBuilder();

    try {
      BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(path)));

      String var5;
      try {
        String line = null;

        while(true) {
          if ((line = br.readLine()) == null) {
            var5 = sb.toString();
            break;
          }

          sb.append(line).append("\n");
        }
      } catch (Throwable var7) {
        try {
          br.close();
        } catch (Throwable var6) {
          var7.addSuppressed(var6);
        }

        throw var7;
      }

      br.close();
      return var5;
    } catch (IOException var8) {
      var8.printStackTrace();
      return sb.toString();
    }
  }
```

可以看到这个跟标准的Java io流关闭的写法还是差不多的，只不过没有使用finally机制，而是在各种catch中进行close方法的调用。

<font color=red>可以看到try-with-resouce其实就是一个语法糖，由编译器在编译为字节码的时候自动添加了close方法调用。</font>

#### 异常实践指南

##### 只针对不正常的情况才使用异常

异常只应该被用于不正常的条件，它们永远不应该被用于正常的控制流。

《阿里手册》中：【强制】<font color=red>Java 类库中定义的可以通过预检查方式规避的RuntimeException异常不应该通过catch 的方式来处理</font>，比如：NullPointerException，IndexOutOfBoundsException等等。

例如，在解析字符串形式的数字时，可能存在数字格式错误，要通过格式校验的方式提前检查，而不得通过catch Exception来实现。

主要原因是性能上的考虑，有三点：

- 异常机制的设计初衷是用于不正常的情况，所以很少会会JVM实现试图对它们的性能进行优化。所以，创建、抛出和捕获异常的开销是很昂贵的。
- 把代码放在try-catch中返回阻止了JVM实现本来可能要执行的某些特定的优化。
- 对数组进行遍历的标准模式并不会导致冗余的检查，有些现代的JVM实现会将它们优化掉。

##### 在 finally 块中清理资源或者使用 try-with-resource 语句

当使用类似InputStream这种需要使用后关闭的资源时，一个常见的错误就是在try块的最后关闭资源。

- 错误示例

```java
public void doNotCloseResourceInTry() {
    FileInputStream inputStream = null;
    try {
        File file = new File("./tmp.txt");
        inputStream = new FileInputStream(file);
        // use the inputStream to read a file
        // do NOT do this
        inputStream.close();
    } catch (FileNotFoundException e) {
        log.error(e);
    } catch (IOException e) {
        log.error(e);
    }
}
```

问题就是，只有没有异常抛出的时候，这段代码才可以正常工作。try 代码块内代码会正常执行，并且资源可以正常关闭。

但是，如果出现异常，这意味着代码可能不会执行到 try 代码块的最后部分，并没有关闭资源。

所以，应该把清理工作的代码放到 finally 里去，或者使用 try-with-resource 特性。

##### 尽可能使用标准异常

如果需求有自定义业务异常情况，首先查看现有异常类中又没有可以满足业务需求直接使用的，尽可能重用现有的异常。

重用现有的异常有几个好处：

- 使得API更加易于学习和使用，因为它与程序员原来已经熟悉的习惯用法是一致的。
- 对于用到这些API的程序而言，它们的可读性更好，因为它们不会充斥着程序员不熟悉的异常。
- 异常类越少，意味着内存占用越小，并且装载这些类的时间开销也越小。

Java标准异常中有几个是经常被使用的异常。如下表格：

| 异常                            | 使用场合                                   |
| ------------------------------- | ------------------------------------------ |
| IllegalArgumentException        | 参数的值不合适                             |
| IllegalStateException           | 参数的状态不合适                           |
| NullPointerException            | 在null被禁止的情况下参数值为null           |
| IndexOutOfBoundsException       | 下标越界                                   |
| ConcurrentModificationException | 在禁止并发修改的情况下，对象检测到并发修改 |
| UnsupportedOperationException   | 对象不支持客户请求的方法                   |

##### 对异常进行文档说明

当在方法上声明抛出异常时，也需要进行文档说明。目的是为了给调用者提供尽可能多的信息，从而可以更好地避免或处理异常。

在 Javadoc 添加 @throws 声明，并且描述抛出异常的场景。

```java
/**
* Method description
* 
* @throws MyBusinessException - businuess exception description
*/
public void doSomething(String input) throws MyBusinessException {
   // ...
}
```

同时，在抛出MyBusinessException 异常时，需要尽可能精确地描述问题和相关信息，这样无论是打印到日志中还是在监控工具中，都能够更容易被人阅读，从而可以更好地定位具体错误信息、错误的严重程度等。

##### 优先捕获最具体的异常

只有匹配异常的第一个 catch 块会被执行，总是优先捕获最具体的异常类，并将不太具体的 catch 块添加到列表的末尾。

##### 不要捕获Throwable类

如果在 catch 子句中使用 Throwable ，它不仅会捕获所有异常，也将捕获所有的错误，会指出不应该由应用程序处理的严重问题。 

例如，OutOfMemoryError 或者 StackOverflowError ，两者都是由应用程序控制之外的情况引起的，无法处理，也不应该处理。

所以，最好不要捕获 Throwable ，除非你确定自己处于一种特殊的情况下能够处理错误。

##### 不要忽略异常

很多时候，开发者很有自信不会抛出异常，因此写了一个catch块，但是没有做任何处理或者记录日志。

```java
public void doNotIgnoreExceptions() {
    try {
        // do something
    } catch (NumberFormatException e) {
        // this will never happen
    }
}
```

但现实是经常会出现无法预料的异常，或者无法确定这里的代码未来是不是会改动(删除了阻止异常抛出的代码)，而此时由于异常被捕获，使得无法拿到足够的错误信息来定位问题。

<font color=red>合理的做法是至少要记录异常的信息。</font>

```java
public void logAnException() {
    try {
        // do something
    } catch (NumberFormatException e) {
        log.error("This should never happen: " + e); // see this line
    }
}
```

##### 不要记录并抛出异常

可以发现很多代码甚至类库中都会有捕获异常、记录日志并再次抛出的逻辑。如下：

```java
try {
    new Long("xyz");
} catch (NumberFormatException e) {
    log.error(e);
    throw e;
}
```

这个处理逻辑看着是合理的。但这经常会给同一个异常输出多条日志。如下：

```java
17:44:28,945 ERROR TestExceptionHandling:65 - java.lang.NumberFormatException: For input string: "xyz"
Exception in thread "main" java.lang.NumberFormatException: For input string: "xyz"
at java.lang.NumberFormatException.forInputString(NumberFormatException.java:65)
at java.lang.Long.parseLong(Long.java:589)
at java.lang.Long.(Long.java:965)
at com.stackify.example.TestExceptionHandling.logAndThrowException(TestExceptionHandling.java:63)
at com.stackify.example.TestExceptionHandling.main(TestExceptionHandling.java:58)
```

如上所示，后面的日志也没有附加更有用的信息。

<font color=red>如果想要提供更加有用的信息，那么可以将异常包装为自定义异常。</font>

```java
public void wrapException(String input) throws MyBusinessException {
    try {
        // do something
    } catch (NumberFormatException e) {
        throw new MyBusinessException("A message that describes the error.", e);
    }
}
```

因此，仅仅当想要处理异常时才去捕获，否则只需要在方法签名中声明让调用者去处理。

##### 包装异常时不要抛弃原始的异常

捕获标准异常并包装为自定义异常是一个很常见的做法。这样可以添加更为具体的异常信息并能够做针对的异常处理。 

在这样做时，请确保将原始异常设置为原因（注：参考下方代码 NumberFormatException e 中的原始异常 e ）。

Exception 类提供了特殊的构造函数方法，它接受一个 Throwable 作为参数。否则，将会丢失堆栈跟踪和原始异常的消息，这将会使分析导致异常的异常事件变得困难。

```java
public void wrapException(String input) throws MyBusinessException {
    try {
        // do something
    } catch (NumberFormatException e) {
        throw new MyBusinessException("A message that describes the error.", e);
    }
}
```

##### 不要使用异常控制程序流程

不应该使用异常控制应用的执行流程。

例如，本应该使用if语句进行条件判断的情况下，却使用异常处理，这是非常不好的习惯，会严重影响应用的性能。

##### 不要在finally使用return

不要在finally块中使用return。

<font color=red>try块中的return语句执行成功后，并不马上返回，而是继续执行finally块中的语句：</font>

- <font color=red>如果finally存在return语句，则在此直接返回，此时try中的return无效。</font>
- <font color=red>如果finally中没有return，将执行完finally后，return try中的结果。</font>

例如：

```java
    public static int checkReturn() {
        try {
            return 2;
        } finally {

        }
    }
//此时返回2
```

```java
    public static int checkReturn() {
        try {
            return 2;
        } finally {
            return 3;
        }
    }
}
//此时返回3
```


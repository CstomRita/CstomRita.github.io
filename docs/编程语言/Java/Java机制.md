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




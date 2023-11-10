@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

> [!warning]
>
> ⚠️ 程序是否支持事务首先取决于数据库 ，比如使用 MySQL 的话，如果你选择的是 innodb 引擎是可以支持事务的。但是如果使用的是 myisam 引擎的话，从根上就是不支持事务的。

## Spring事务使用

系统的每个业务方法可能包括了多个原子性的数据库操作，比如下面的 `savePerson()` 方法中就有两个原子性的数据库操作。这些原子性的数据库操作是有依赖的，它们要么都执行，要不就都不执行。

```java
	public void savePerson() {
		personDao.save(person);
		personDetailDao.save(personDetail);
	}
```

### 编程式事务管理

通过 `TransactionTemplate`或者`TransactionManager`手动管理事务，实际应用中很少使用，但是可以理解 Spring 事务管理原理。

使用`TransactionTemplate` 进行编程式事务管理的示例代码如下：

```java
@Autowired
private TransactionTemplate transactionTemplate;
public void testTransaction() {

        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus transactionStatus) {
                try {
                    // ....  业务代码
                } catch (Exception e){
                    //回滚 
                    transactionStatus.setRollbackOnly();
                }
            }
        });
}
```

使用 `TransactionManager` 进行编程式事务管理的示例代码如下：

```java
@Autowired
private PlatformTransactionManager transactionManager;

public void testTransaction() {

  TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
          try {
               // ....  业务代码
              transactionManager.commit(status);
          } catch (Exception e) {
              transactionManager.rollback(status);
          }
}
```

### 声明式事务管理

使用 `@Transactional`注解进行事务管理：

```java
@Transactional(propagation = Propagation.REQUIRED)
public void aMethod {
  //do something
  B b = new B();
  C c = new C();
  b.bMethod();
  c.cMethod();
}
```

这种是使用最多的情况，推荐使用（代码侵入性最小），实际是通过 AOP 实现（基于`@Transactional` 的全注解方式使用最多）

#### `@Transactional` 的作用范围

1. **方法**：推荐将注解使用于方法上，不过需要注意的是：**该注解只能应用到 public 方法上，否则不生效。**
2. **类**：如果这个注解使用在类上的话，表明该注解对该类中所有的 public 方法都生效。
3. **接口**：不推荐在接口上使用。

####  `@Transactional` 的常用配置参数

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {

	@AliasFor("transactionManager")
	String value() default "";

	@AliasFor("value")
	String transactionManager() default "";

	Propagation propagation() default Propagation.REQUIRED;

	Isolation isolation() default Isolation.DEFAULT;

	int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;

	boolean readOnly() default false;

	Class<? extends Throwable>[] rollbackFor() default {};

	String[] rollbackForClassName() default {};

	Class<? extends Throwable>[] noRollbackFor() default {};

	String[] noRollbackForClassName() default {};

}
```

**常用配置参数总结（只列出了平时比较常用的）：**

| 属性名      | 说明                                                         |
| :---------- | :----------------------------------------------------------- |
| propagation | 事务的传播行为，默认值为 REQUIRED                            |
| isolation   | 事务的隔离级别，默认值采用 DEFAULT                           |
| timeout     | 事务的超时时间，默认值为-1（不会超时）。如果超过该时间限制但事务还没有完成，则自动回滚事务。 |
| readOnly    | 指定事务是否为只读事务，默认值为 false。                     |
| rollbackFor | 用于指定能够触发事务回滚的异常类型，并且可以指定多个异常类型。 |

## Spring的事务管理接口

Spring 框架中，事务管理相关最重要的 3 个接口如下：

- **`PlatformTransactionManager`**：（平台）事务管理器，Spring 事务策略的核心。
- **`TransactionDefinition`**：事务定义信息(事务隔离级别、传播行为、超时、只读、回滚规则)。
- **`TransactionStatus`**：事务运行状态。

 **`PlatformTransactionManager`** 接口可以被看作是事务上层的管理者，而 **`TransactionDefinition`** 和 **`TransactionStatus`** 这两个接口可以看作是事务的描述。

**`PlatformTransactionManager`** 会根据 **`TransactionDefinition`** 的定义比如事务超时时间、隔离级别、传播行为等来进行事务管理 ，而 **`TransactionStatus`** 接口则提供了一些方法来获取事务相应的状态比如是否新事务、是否可以回滚等等。

### PlatformTransactionManager

**Spring 并不直接管理事务，而是提供了多种事务管理器** 。

Spring 事务管理器的接口是：**`PlatformTransactionManager`** 。

通过这个接口，Spring 为各个平台如：JDBC(`DataSourceTransactionManager`)、Hibernate(`HibernateTransactionManager`)、JPA(`JpaTransactionManager`)等都提供了对应的事务管理器，但是具体的实现就是各个平台自己的事情了。

![img](Spring%E4%BA%8B%E5%8A%A1.assets/PlatformTransactionManager-bfc04603.png)

`PlatformTransactionManager`接口中定义了三个方法：

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface PlatformTransactionManager {
    //获得事务
    TransactionStatus getTransaction(@Nullable TransactionDefinition var1) throws TransactionException;
    //提交事务
    void commit(TransactionStatus var1) throws TransactionException;
    //回滚事务
    void rollback(TransactionStatus var1) throws TransactionException;
}
```

> [!Note]
>
> **为什么要抽象出来`PlatformTransactionManager`这个接口呢？**
>
> 主要是因为要将事务管理行为抽象出来，然后不同的平台去实现它，这样可以保证提供给外部的行为不变，方便我们扩展。

### TransactionDefinition

事务管理器接口 **`PlatformTransactionManager`** 通过 **`getTransaction(TransactionDefinition definition)`** 方法来得到一个事务，这个方法里面的参数是 **`TransactionDefinition`** 类 ，这个类就定义了一些基本的事务属性。

**什么是事务属性呢？** 事务属性可以理解成事务的一些基本配置，描述了事务策略如何应用到方法上。

事务属性包含了 5 个方面：

- 隔离级别
- 传播行为
- 回滚规则
- 是否只读
- 事务超时

#### 隔离级别

定义了五种隔离级别：

- **`TransactionDefinition.ISOLATION_DEFAULT`** :使用后端数据库默认的隔离级别，MySQL 默认采用的 `REPEATABLE_READ` 隔离级别 Oracle 默认采用的 `READ_COMMITTED` 隔离级别。
- **`TransactionDefinition.ISOLATION_READ_UNCOMMITTED`** :最低的隔离级别，使用这个隔离级别很少，因为它允许读取尚未提交的数据变更，**可能会导致脏读、幻读或不可重复读**
- **`TransactionDefinition.ISOLATION_READ_COMMITTED`** : 允许读取并发事务已经提交的数据，**可以阻止脏读，但是幻读或不可重复读仍有可能发生**
- **`TransactionDefinition.ISOLATION_REPEATABLE_READ`** : 对同一字段的多次读取结果都是一致的，除非数据是被本身事务自己所修改，**可以阻止脏读和不可重复读，但幻读仍有可能发生。**
- **`TransactionDefinition.ISOLATION_SERIALIZABLE`** : 最高的隔离级别，完全服从 ACID 的隔离级别。所有的事务依次逐个执行，这样事务之间就完全不可能产生干扰，也就是说，**该级别可以防止脏读、不可重复读以及幻读**。但是这将严重影响程序的性能。通常情况下也不会用到该级别。

#### 传播行为

**事务传播行为是为了解决业务层方法之间互相调用的事务问题**。

当事务方法被另一个事务方法调用时，必须指定事务应该如何传播。例如：方法可能继续在现有事务中运行，也可能开启一个新事务，并在自己的事务中运行。

> 例如：：在 A 类的`aMethod()`方法中调用了 B 类的 `bMethod()` 方法。这个时候就涉及到业务层方法之间互相调用的事务问题。如果 `bMethod()`如果发生异常需要回滚，如何配置事务传播行为才能让 `aMethod()`也跟着回滚呢？

在Spring中，枚举类配置了7种传播行为：

![传播行为](Spring%E4%BA%8B%E5%8A%A1.assets/640)

##### REQUIRED

**`TransactionDefinition.PROPAGATION_REQUIRED`**

使用的最多的一个事务传播行为，平时经常使用的`@Transactional`注解默认使用就是这个事务传播行为。

如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。也就是说：

- 如果外部方法没有开启事务的话，`Propagation.REQUIRED`修饰的内部方法会新开启自己的事务，且开启的事务相互独立，互不干扰。
- 如果外部方法开启事务并且被`Propagation.REQUIRED`的话，所有`Propagation.REQUIRED`修饰的内部方法和外部方法均属于同一事务 ，只要一个方法回滚，整个事务均回滚。

> 上面的`aMethod()`和`bMethod()`使用的都是`PROPAGATION_REQUIRED`传播行为的话，两者使用的就是同一个事务，只要其中一个方法回滚，整个事务均回滚。

##### NESTED

**`TransactionDefinition.PROPAGATION_NESTED`**

如果当前存在事务，就在嵌套事务内执行；如果当前没有事务，就执行与`TransactionDefinition.PROPAGATION_REQUIRED`类似的操作。也就是说：

- 在外部方法开启事务的情况下，在内部开启一个新的事务，作为嵌套事务存在。
- 如果外部方法无事务，则单独开启一个事务，与 `PROPAGATION_REQUIRED` 类似。

##### REQUIRES_NEW

**`TransactionDefinition.PROPAGATION_REQUIRES_NEW`**

创建一个新的事务，如果当前存在事务，则把当前事务挂起。也就是说不管外部方法是否开启事务，`Propagation.REQUIRES_NEW`修饰的内部方法会新开启自己的事务，且开启的事务相互独立，互不干扰。

> 上面的`bMethod()`使用`PROPAGATION_REQUIRES_NEW`事务传播行为修饰，`aMethod`还是用`PROPAGATION_REQUIRED`修饰的话：
>
> - 如果`aMethod()`发生异常回滚，`bMethod()`不会跟着回滚，因为 `bMethod()`开启了独立的事务。
> - 但是，如果 `bMethod()`抛出了未被捕获的异常并且这个异常满足事务回滚规则的话,`aMethod()`同样也会回滚，因为这个异常被 `aMethod()`的事务管理机制检测到了。

##### SUPPORTS

**`TransactionDefinition.PROPAGATION_SUPPORTS`**

 如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。

这个使用的很少。

##### MANDATORY

**`TransactionDefinition.PROPAGATION_MANDATORY`**

如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。（mandatory：强制性）

这个使用的很少。

##### NOT_SUPPORTED

**`TransactionDefinition.PROPAGATION_NOT_SUPPORTED`**:

以非事务方式运行，如果当前存在事务，则把当前事务挂起。

这个使用很少。

##### NEVER

**`TransactionDefinition.PROPAGATION_NEVER`**

以非事务方式运行，如果当前存在事务，则抛出异常。

这个使用很少。

#### 回滚规则

回滚规则定义了哪些异常会导致事务回滚而哪些不会。

默认情况下，事务只有遇到运行期异常（`RuntimeException` 的子类）时才会回滚，`Error` 也会导致事务回滚，但是，在遇到检查型（Checked）异常时不会回滚。

想要回滚特定的异常类型的话，可以这样：

```java
@Transactional(rollbackFor= MyException.class)
```

#### 是否只读

对于只有读取数据查询的事务，可以指定事务类型为 readonly，即只读事务。

只读事务不涉及数据的修改，数据库会提供一些优化手段，适合用在有多条数据库查询操作的方法中。

> [!Note] 关于只读事务：
>
> - 如果一次执行单条查询语句，则没有必要启用事务支持，数据库默认支持 SQL 执行期间的读一致性；
> - 如果一次执行多条查询语句，例如统计查询，报表查询，在这种场景下，多条查询 SQL 必须保证整体的读一致性，否则，在前条 SQL 查询之后，后条 SQL 查询之前，数据被其他用户改变，则该次整体的统计查询将会出现读数据不一致的状态，此时，应该启用事务支持。

#### 事务超时

事务超时，就是指一个事务所允许执行的最长时间，如果超过该时间限制但事务还没有完成，则自动回滚事务。

在 `TransactionDefinition` 中以 int 的值来表示超时时间，其单位是秒，默认值为-1，这表示事务的超时时间取决于底层事务系统或者没有超时时间。

### TransactionStatus

`TransactionStatus`接口用来记录事务的状态 该接口定义了一组方法,用来获取或判断事务的相应状态信息。

`PlatformTransactionManager.getTransaction(…)`方法返回一个 `TransactionStatus` 对象。

**TransactionStatus 接口内容如下：**

```java
public interface TransactionStatus{
    boolean isNewTransaction(); // 是否是新的事务
    boolean hasSavepoint(); // 是否有恢复点
    void setRollbackOnly();  // 设置为只回滚
    boolean isRollbackOnly(); // 是否为只回滚
    boolean isCompleted; // 是否已完成
}
```

## 原理

### JDBC封装

Spring事务是对数据库事务的进⼀步封装。

使用JDBC开启事务的步骤：

```java
// 第⼀步：加载JDBC驱动，代码如下
Class.forName("com.mysql.jdbc.Driver");

// 第⼆步：建⽴与数据库的连接，后两个参数分别为账号和密码，代码如下。
Connection conn = DriverManager.getConnection(url, "root", "root");

// 第三步：开启事务，代码如下
conn.setAutoCommit(true/false);

// 第四步：执⾏数据库的CRUD操作，代码如下
PreparedStatement ps = con.prepareStatement(sql);

// 新增、修改、删除
ps.executeUpdate();

// 查询
ps.executeQuery()

// 第五步：提交或者回滚事务，代码如下
conn.commit();
conn.rollback();

// 第六步：关闭连接，代码如下。
ps.close();
conn.close();
```

如果使⽤Spring的事务功能，则不必⼿动开启事务、提交事务和回滚事务，也就是不⽤再写第三步和第五步中的代码，开启事务、提交事务和回滚事务的操作全部交由 Spring框架⾃动完成。

```java
@Transactional
    public void declarativeUpdate() {
        updateOperation1();
        updateOperation2();
    }
```

Spring中的事务依然是依托于底层数据库的，依然是对JDBC代码的封装，具体行为交于数据库系统实现事务特性。

以上的写法相当于：在进入`declarativeUpdate()`方法前，使用`BEGIN`开启了事务，在执行完方法后，使用`COMMIT`提交事务。

### @Transactional

#### 基于AOP实现

Spring框架在启动的时候会创建相关的bean实例对象，并且会扫描标注有相关注解的类和方法，为这些⽅法⽣成代理对象。

如果扫描到标注有@Transactional注解的类或者⽅法时，会根据@Transactional注解的相关参数进⾏配置注⼊，在代理对象中会处理相应的事务，对事务进行管理。例如在代理对象中开启事务、提交事务和回滚事务。⽽这些操作都是Spring框架通过 AOP代理⾃动完成的，⽆须开发⼈员过多关⼼其中的细节。

如果一个类或者一个类中的 public 方法上被标注`@Transactional` 注解的话，Spring 容器就会在启动的时候为其创建一个代理类，在调用被`@Transactional` 注解的 public 方法的时候，实际调用的是，`TransactionInterceptor` 类中的 `invoke()`方法。这个方法的作用就是在目标方法之前开启事务，方法执行过程中如果遇到异常的时候回滚事务，方法调用完成之后提交事务。

#### 自调用问题

当一个方法被标记了`@Transactional` 注解的时候，Spring 事务管理器只会在被其他类方法调用的时候生效，而不会在一个类中方法调用生效。

这是因为 Spring AOP 工作原理决定的。因为 Spring AOP 使用动态代理来实现事务的管理，它会在运行的时候为带有 `@Transactional` 注解的方法生成代理对象，并在方法调用的前后应用事物逻辑。如果该方法被其他类调用我们的代理对象就会拦截方法调用并处理事务。但是在一个类中的其他方法内部调用的时候，我们代理对象就无法拦截到这个内部调用，因此事务也就失效了。

严格上来说,只要对方法A使用注解AOP均会失效，原因是因为这里的this.调用的并不是Spring的代理对象。

```java
@Service
public class ClassA{
 
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void methodA(){
 
        }
 
        /**
         * 这里调用methodA() 的事务将会失效
         */
        public void methodB(){
            this.methodA();
        }
 
    }
```

**解决方法一：getBean获取代理对象**

```java

        public void methodB(){
　　　　　　　　//使用getBean
　　　　((BaseClass)SpringUtil.getBean("classA")).methodA();
        }
```

**解决方法二：注入自己的bean**

直接在当前类@Autowire 或者@Resource注入自己，然后用注入的bean 调用方法。

#### 失效情况

- 底层使用的数据库必须支持事务机制，否则不生效；

- `@Transactional` 注解只有作用到 public 方法上事务才生效，不推荐在接口上使用；
- 避免同一个类中调用 `@Transactional` 注解的方法，这样会导致事务失效；
- 被 `@Transactional` 注解的方法所在的类必须被 Spring 管理，否则不生效；
- 正确的设置 `@Transactional` 的 `rollbackFor` 和 `propagation` 属性，否则事务可能会回滚失败;
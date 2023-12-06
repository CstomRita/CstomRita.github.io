@autoHeader: 2.1.1.1.1.1


<p align="right">update time : {docsify-updated}</p>

## IOC

### 将一个类声明为 Bean 的注解有哪些?

- `@Component`：通用的注解，可标注任意类为 `Spring` 组件。如果一个 Bean 不知道属于哪个层，可以使用`@Component` 注解标注。
- `@Repository` : 对应持久层即 Dao 层，主要用于数据库相关操作。
- `@Service` : 对应服务层，主要涉及一些复杂的逻辑，需要用到 Dao 层。
- `@Controller` : 对应 Spring MVC 控制层，主要用于接受用户请求并调用 `Service` 层返回数据给前端页面

###  @Component 和 @Bean 的区别是什么？

- `@Component` 注解作用于类，而`@Bean`注解作用于方法。

- `@Component`通常是通过类路径扫描来自动侦测以及自动装配到 Spring 容器中。`@Bean` 注解通常是我们在标有该注解的方法中定义产生这个 bean,`@Bean`告诉了 Spring 这是某个类的实例，当我需要用它的时候还给我。

- `@Bean` 注解比 `@Component` 注解的自定义性更强，而且很多地方我们只能通过 `@Bean` 注解来注册 bean。比如当我们引用第三方库中的类需要装配到 `Spring`容器时，则只能通过 `@Bean`来实现。

  > ```java
  > @Bean
  > public OneService getService(status) {
  >     case (status)  {
  >         when 1:
  >                 return new serviceImpl1();
  >         when 2:
  >                 return new serviceImpl2();
  >         when 3:
  >                 return new serviceImpl3();
  >     }
  > }
  > ```
  >
  > 例如这个例子，通过 `@Component` 是无法实现的。

### @Autowired 和 @Resource 的区别是什么？

- `@Autowired` 是 Spring 提供的注解，`@Resource` 是 JDK 提供的注解。

- `Autowired` 默认的注入方式为`byType`（根据类型进行匹配），`@Resource`默认注入方式为 `byName`（根据名称进行匹配）。

- 当一个接口存在多个实现类的情况下，`@Autowired` 和`@Resource`都需要通过名称才能正确匹配到对应的 Bean。`Autowired` 可以通过 `@Qualifier` 注解来显式指定名称，`@Resource`可以通过 `name` 属性来显式指定名称。

- `@Autowired` 支持在构造函数、方法、字段和参数上使用。`@Resource` 主要用于字段和方法上的注入，不支持在构造函数或参数上使用

> - `Autowired` 属于 Spring 内置的注解，默认的注入方式为`byType`，根据类型进行匹配，会优先根据接口类型去匹配并注入 Bean。
>
>   当一个接口存在多个实现类的话，注入方式会变为 `byName`，根据名称进行匹配，对象变量名称要和类名对应；或者使用 `@Qualifier` 注解来显式指定名称。
>
>   ```java
>   // 报错，byName 和 byType 都无法匹配到 bean
>   @Autowired
>   private SmsService smsService;
>   
>   // 正确注入 SmsServiceImpl1 对象对应的 bean
>   @Autowired
>   private SmsService smsServiceImpl1;
>   
>   // 正确注入  SmsServiceImpl1 对象对应的 bean
>   // smsServiceImpl1 就是我们上面所说的名称
>   @Autowired
>   @Qualifier(value = "smsServiceImpl1")
>   private SmsService smsService;
>   ```
>
> - `@Resource`属于 JDK 提供的注解，默认注入方式为 `byName`。如果无法通过名称匹配到对应的 Bean 的话，注入方式会变为`byType`。该注解有name、type两个数学，如果仅指定 `name` 属性则注入方式为`byName`，如果仅指定`type`属性则注入方式为`byType`，如果同时指定`name` 和`type`属性则注入方式为`byType`+`byName`。
>
>   ```java
>   // 报错，byName 和 byType 都无法匹配到 bean
>   @Resource
>   private SmsService smsService;
>   
>   // 正确注入 SmsServiceImpl1 对象对应的 bean
>   @Resource
>   private SmsService smsServiceImpl1;
>   
>   // 正确注入 SmsServiceImpl1 对象对应的 bean（比较推荐这种方式）
>   @Resource(name = "smsServiceImpl1")
>   private SmsService smsService;
>   ```

### Bean 的作用域有哪些?

Spring 中 Bean 的作用域通常有下面几种：

- **singleton** : IoC 容器中只有唯一的 bean 实例。Spring 中的 bean 默认都是单例的，是对单例设计模式的应用。
- **prototype** : 每次获取都会创建一个新的 bean 实例。也就是说，连续 `getBean()` 两次，得到的是不同的 Bean 实例。
- **request** （仅 Web 应用可用）: 每一次 HTTP 请求都会产生一个新的 bean（请求 bean），该 bean 仅在当前 HTTP request 内有效。
- **session** （仅 Web 应用可用） : 每一次来自新 session 的 HTTP 请求都会产生一个新的 bean（会话 bean），该 bean 仅在当前 HTTP session 内有效。
- **application/global-session** （仅 Web 应用可用）：每个 Web 应用在启动时创建一个 Bean（应用 Bean），该 bean 仅在当前应用启动时间内有效。
- **websocket** （仅 Web 应用可用）：每一次 WebSocket 会话产生一个新的 bean。

### 如何配置 bean 的作用域？

- xml 方式中，配置scope属性

```xml
<bean id="..." class="..." scope="singleton"></bean>
```

- 注解方式使用@Scope注解

```java
@Bean
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public Person personPrototype() {
    return new Person();
}
```

### Bean 是线程安全的吗？



### Bean的生命周期？



## AOP

### 谈谈自己对于 AOP 的了解?

AOP能够将那些与业务无关，却为业务模块所共同调用的逻辑或责任，例如事务处理、日志管理、权限控制等封装起来，便于减少系统的重复代码，降低模块间的耦合度，并有利于未来的可拓展性和可维护性。

Spring AOP 就是基于动态代理的，如果要代理的对象，实现了某个接口，那么 Spring AOP 会使用 JDK Proxy，去创建代理对象，而对于没有实现接口的对象，就无法使用 JDK Proxy 去进行代理了，这时候 Spring AOP 会使用 Cglib 生成一个被代理对象的子类来作为代理。

### AspectJ 定义的通知类型有哪些？

- **Before**（前置通知）：目标对象的方法调用之前触发
- **After** （后置通知）：目标对象的方法调用之后触发
- **AfterReturning**（返回通知）：目标对象的方法调用完成，在返回结果值之后触发
- **AfterThrowing**（异常通知）：目标对象的方法运行中抛出 / 触发异常后触发。AfterReturning 和 AfterThrowing 两者互斥。如果方法调用成功无异常，则会有返回值；如果方法抛出了异常，则不会有返回值。
- **Around** （环绕通知）：编程式控制目标对象的方法调用。环绕通知是所有通知类型中可操作范围最大的一种，因为它可以直接拿到目标对象，以及要执行的方法，所以环绕通知可以任意的在目标对象的方法调用前后搞事，甚至不调用目标对象的方法

## 事务

### @Transactional失效的情况

- 底层使用的数据库必须支持事务机制，否则不生效；

- `@Transactional` 注解只有作用到 public 方法上事务才生效，不推荐在接口上使用；
- 自调用问题，避免同一个类中调用 `@Transactional` 注解的方法，这样会导致事务失效；
- 被 `@Transactional` 注解的方法所在的类必须被 Spring 管理，否则不生效；
- 正确的设置 `@Transactional` 的 `rollbackFor` 和 `propagation` 属性，否则事务可能会回滚失败;

### 自调用失效的原因

有 `@Transactional` 注解的方法，在运行的时候生成代理对象，并在方法调用的前后应用事物逻辑。

如果该方法被其他类调用我们的代理对象就会拦截方法调用并处理事务。

但如果是类内部调用，调用的是this.方法，并不是Spring的代理对象，无法进入拦截方法，导致注解失效。

### 事务的传播行为有哪些？

事务的传播行为是指事务方法被另一个事务方法调用时，事务应该如何传播。在Spring中定义了7种事务的传播方式：

1. REQUIRED，默认的传播行为，如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。
2. NESTED，嵌套事务，如果当前存在事务，在内部开启一个新的事务，作为嵌套事务；如果当前没有事务，则创建一个新的事务。
3. NEW，创建一个新的、独立的事务，如果当前存在事务，则把当前事务挂起。
4. SUPPORTS， 如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。
5. MANDATORY，强制性传播行为，如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。
6. NOT_SUPPORTED，以非事务方式运行，如果当前存在事务，则把当前事务挂起。
7. NEVER，以非事务方式运行，如果当前存在事务，则抛出异常。

### 加入事务和嵌套事务的区别？

加入事务是默认的传播行为，如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。

嵌套事务的逻辑为：如果当前存在事务，在内部开启一个新的事务，作为嵌套事务；如果当前没有事务，则创建一个新的事务

两者的区别在于，如果当前存在事务，那么加入事务的事务传播级别在遇到异常之后，会将事务全部回滚；而嵌套事务在遇到异常时，只是执行了部分事务的回滚。

嵌套事务会在数据库中存在一个保存点的概念，滚回时只回滚到当前保存点，因此之前的事务是不受影响的；而加入到当前事务中，并没有创建事务的保存点，因此出现了回滚就是整个事务回滚。
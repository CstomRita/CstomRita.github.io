@autoHeader: 2.1.1.1.1.1

<p align="right">update time : {docsify-updated}</p>

## 机制篇

### 工作流程

我们已经大概知道了MyBatis的工作流程，按工作原理，可以分为两大步：`生成会话工厂`、`会话运行`。

![MyBatis的工作流程](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-61ac17ef-9eee-48c0-9a2d-545e1d554b13.png)

#### 构建会话工厂

构造会话工厂也可以分为两步：

![构建会话工厂](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-234a4d1b-2d44-4576-9954-26f56162750e.png)

##### 获取配置

获取配置这一步经过了几步转化，最终由生成了一个配置类Configuration实例，这个配置类实例非常重要，主要作用包括：

- 读取配置文件，包括基础配置文件和映射文件
- 初始化基础配置，比如MyBatis的别名，还有其它的一些重要的类对象，像插件、映射器、ObjectFactory等等
- 提供一个单例，作为会话工厂构建的重要参数
- 它的构建过程也会初始化一些环境变量，比如数据源

```java
public SqlSessionFactory build(Reader reader, String environment, Properties properties) {
      SqlSessionFactory var5;
      //省略异常处理
          //xml配置构建器
          XMLConfigBuilder parser = new XMLConfigBuilder(reader, environment, properties);
          //通过转化的Configuration构建SqlSessionFactory
          var5 = this.build(parser.parse());
}
```

##### 构建SqlSessionFactory

SqlSessionFactory只是一个接口，构建出来的实际上是它的实现类的实例，一般我们用的都是它的实现类DefaultSqlSessionFactory，

```java
public SqlSessionFactory build(Configuration config) {
    return new DefaultSqlSessionFactory(config);
}
```

#### 会话运行

会话运行是MyBatis最复杂的部分，它的运行离不开四大组件的配合：

![MyBatis会话运行四大关键组件](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-da477d50-209e-45b3-a003-6d63e674bd99.png)

##### MyBatis会话运行四大关键组件

![会话运行的简单示意图](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-ebd0712a-1f62-4154-b391-2cb596634710.png)

- Executor（执行器）

Executor起到了至关重要的作用，SqlSession只是一个门面，相当于客服，真正干活的是是Executor，就像是默默无闻的工程师。它提供了相应的查询和更新方法，以及事务方法。

```java
Environment environment = this.configuration.getEnvironment();
TransactionFactory transactionFactory = this.getTransactionFactoryFromEnvironment(environment);
tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
//通过Configuration创建executor
Executor executor = this.configuration.newExecutor(tx, execType);
var8 = new DefaultSqlSession(this.configuration, executor, autoCommit);
```

- StatementHandler（数据库会话器）

StatementHandler，顾名思义，处理数据库会话的。我们以SimpleExecutor为例，看一下它的查询方法，先生成了一个StatementHandler实例，再拿这个handler去执行query。

```java
 public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
    Statement stmt = null;

    List var9;
    try {
        Configuration configuration = ms.getConfiguration();
        StatementHandler handler = configuration.newStatementHandler(this.wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
        stmt = this.prepareStatement(handler, ms.getStatementLog());
        var9 = handler.query(stmt, resultHandler);
    } finally {
        this.closeStatement(stmt);
    }

    return var9;
}
```

再以最常用的PreparedStatementHandler看一下它的query方法，其实在上面的`prepareStatement`已经对参数进行了预编译处理，到了这里，就直接执行sql，使用ResultHandler处理返回结果。

```java
public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
    PreparedStatement ps = (PreparedStatement)statement;
    ps.execute();
    return this.resultSetHandler.handleResultSets(ps);
}
```

- ParameterHandler （参数处理器）

PreparedStatementHandler里对sql进行了预编译处理。

```java
public void parameterize(Statement statement) throws SQLException {
    this.parameterHandler.setParameters((PreparedStatement)statement);
}
```

这里用的就是ParameterHandler，setParameters的作用就是设置预编译SQL语句的参数。

里面还会用到typeHandler类型处理器，对类型进行处理。

```java
public interface ParameterHandler {
    Object getParameterObject();

    void setParameters(PreparedStatement var1) throws SQLException;
}
```

- ResultSetHandler（结果处理器）

  我们前面也看到了，最后的结果要通过ResultSetHandler来进行处理，handleResultSets这个方法就是用来包装结果集的。Mybatis为我们提供了一个DefaultResultSetHandler，通常都是用这个实现类去进行结果的处理的。

```java
public interface ResultSetHandler {
  <E> List<E> handleResultSets(Statement var1) throws SQLException;

  <E> Cursor<E> handleCursorResultSets(Statement var1) throws SQLException;

  void handleOutputParameters(CallableStatement var1) throws SQLException;
}
```

它会使用typeHandle处理类型，然后用ObjectFactory提供的规则组装对象，返回给调用者。

#### 总结

![MyBatis整体工作原理图](Mybatis%E5%9F%BA%E7%A1%80.assets/mybatis-dc142e94-8e7f-4ec6-a1f6-1d20669292ad-20230911201331348.png)

1. 读取 MyBatis 配置文件——mybatis-config.xml 、加载映射文件——映射文件即 SQL 映射文件，文件中配置了操作数据库的 SQL 语句。最后生成一个配置对象。
2. 构造会话工厂：通过 MyBatis 的环境等配置信息构建会话工厂 SqlSessionFactory。
3. 创建会话对象：由会话工厂创建 SqlSession 对象，该对象中包含了执行 SQL 语句的所有方法。
4. Executor 执行器：MyBatis 底层定义了一个 Executor 接口来操作数据库，它将根据 SqlSession 传递的参数动态地生成需要执行的 SQL 语句，同时负责查询缓存的维护。
5. StatementHandler：数据库会话器，串联起参数映射的处理和运行结果映射的处理。
6. 参数处理：对输入参数的类型进行处理，并预编译。
7. 结果处理：对返回结果的类型进行处理，根据对象映射规则，返回相应的对象

### 预编译机制

MyBaits会首先对其进行预编译，将#{参数}替换成?[占位符]，然后在执行时替换成实际传入的参数值，**并在两边加上单引号，以字符串方式处理**。

####  #{}和${}

##### #{}

`#{}`是将传入的值按照字符串的形式进行处理，如下面这条语句：

`select user_id,user_name from t_user where user_id = #{user_id}`

MyBaits会首先对其进行预编译，将#{user_ids}替换成?占位符，然后在执行时替换成实际传入的user_id值，**并在两边加上单引号，以字符串方式处理。**

下面是MyBatis执行日志：

```
10:27:20.247 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==>  Preparing: select id, user_name from t_user where id = ? 
10:27:20.285 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==> Parameters: 1(Long)
```

因为"#{}"会在传入的值两端加上单引号，所以可以很大程度上防止SQL注入。因此在大多数情况下，建议使用"#{}"。

##### ${}

`${}`是做简单的字符串替换，即将传入的值直接拼接到SQL语句中，且不会自动加单引号。将上面的SQL语句改为：

`select user_id,user_name from t_user where user_id = ${user_id}`

再观察MyBatis的执行日志：

```
10:41:32.242 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==>  Preparing: select id, user_name, real_name, sex, mobile, email, note, position_id from t_user where id = 1 
10:41:32.288 [main] DEBUG william.mybatis.quickstart.mapper.UserMapper.selectById - ==> Parameters: 
```


可以看到，参数是直接替换的，且没有单引号处理，这样就有SQL注入的风险。

但是在一些特殊情况下，使用${}是更适合的方式，如表名、orderby等。见下面这个例子：

`select user_id,user_name from ${table_name} where user_id = ${user_id}`

这里如果想要动态处理表名，就只能使用"${}"，因为如果使用"#{}"，就会在表名字段两边加上单引号，变成下面这样：

`select user_id,user_name from 't_user' where user_id = ${user_id}`

这样SQL语句就会报错。

#### SQL注入问题

##### 问题演示

前面说到了使用#{}可以有效防止SQL注入。那么SQL注入到底是什么呢？

考虑下面这个常见的场景：用户登录。根据前端传过来的用户名和密码，去数据库进行校验，如果查到是有效用户，则通知前端登录成功。这个场景相信大家都经历过。在数据库会执行这样一段SQL：

`select * from users where username='admin' and password=md5('admin')`

如果前端传如正确的用户名和密码，可以登录成功，这样在正常情况下没有问题。那么如果有人恶意攻击，在用户名框输入了’or 1=1#，而密码框随意输入，这个SQL语句就变为：

` select * from users where username='' or 1=1#' and password=md5('')`

“#”在mysql中是注释符，这样"#"后面的内容将被mysql视为注释内容，就不会去执行了。换句话说，上面的SQL语句等价于：

`select * from users where username='' or 1=1`

由于1=1恒成立，因此SQL语句可以被进一步简化为：

` select * from users`

这样一来，这段SQL语句可以执行成功，用户就可以恶意登录了。这样就实现了简单的SQL注入。

##### 通过MyBatis预编译防SQL注入

如前文所述，在MyBatis中，采用"${}“是简单的字符串替换，肯定无法应对SQL注入。那么”#{}"是怎样解决SQL注入的呢？

将上面的查询语句在MyBatis中实现为：

`select * from users where username=#{username} and password=md5(#{password})`

这样一来，当用户再次输入’or 1=1#，MyBatis执行SQL语句时会将其替换成：

` select * from users where username=''or 1=1#' and password=md5('')`

由于在两端加了双引号，因此输入的内容就是一个普通字符串，其中的#注释和or 1=1都不会生效，这样就无法登陆成功了，从而有效防止了SQL注入。

### 懒加载机制

懒加载机制的应用场景在于级联查询。

有A、B两个对象，在A对象中引用了B对象。Java层面上，通俗来说就是通过A对象的getter方法可以拿到B对象的引用。数据库层面，其实就是两表的关联查询。

#### 关联查询方式

在Mybatis中，使用表间的关联查询，有几种方式：

- 使用JOIN连表查询SQL，resultMap组合映射关系
- 使用JOIN连表查询SQL，使用级联标签和javaType属性
- 使用级联映射的select标签，分步查询，通过两次或多次查询，为一对一关系的实体 Bean 赋值。

本节重点关注第三种，级联映射。

##### ResultMap

写一条sql语句，比较直接。

```sql
    <select id="getEmployeeWithDeptById0" resultMap="employeeDept0">
        select e.id id, e.name name, e.gender gender, e.email email, e.d_id departmentId, d.department_name departmentName
        from tbl_employee e, tbl_department d
        where d.id=e.d_id and e.id=#{id}
    </select>
```

在ResultMap中组合A.B映射关系，写法比较直接：

    <!-- 第一种：利用resultMap进行级联查询，不使用association标签-->
    <resultMap id="employeeDept0" type="com.hly.entity.Employee">
        <id column="id" property="id"></id>
        <result column="name" property="name"></result>
        <result column="gender" property="gender"></result>
        <result column="email" property="email"></result>
        <result column="departmentId" property="department.id"></result>
        <result column="departmentName" property="department.departmentName"></result>
    </resultMap>
##### 级联映射标签和javaType属性

这种方法个人感觉跟第一种没有本质上的区别，还是一条sql语句对两张表进行关联查询，只不过在结果集映射的时候有一些不同，引入了association标签。

可读性比较好，对象的结构关系相较于第一种方式来说更为清晰和明朗。

sql部分，与第一种无异：

```csharp
    <select id="getEmployeeWithDeptById" resultMap="employeeDept">
        select e.id id, e.name name, e.gender gender, e.email email, e.d_id departmentId, d.department_name departmentName
        from tbl_employee e, tbl_department d
        where d.id=e.d_id and e.id=#{id}
    </select>
```

resultMap在进行结果映射时，有一定的区别：

```xml
    <!-- 第二种：利用resultMap进行级联查询，使用association标签 -->
    <resultMap id="employeeDept" type="com.hly.entity.Employee">
        <id column="id" property="id"></id>
        <result column="name" property="name"></result>
        <result column="gender" property="gender"></result>
        <result column="email" property="email"></result>
        <association property="department" javaType="com.hly.entity.Department">
            <id column="departmentId" property="id"></id>
            <result column="departmentName" property="departmentName"></result>
        </association>
    </resultMap>
```

可以看到在这种写法中，通过association标签明确指定了department对象的类型，然后在这个association的子标签中对department对象进行结果映射。

##### 级联映射使用select标签

与前面两种写法有比较大的不同，使用association的select标签，可以将原本两表联查的一条sql语句拆分为两条简单的sql语句。

> [!Note]个人以为搞出这种方式的原因就是要支持级联查询的懒加载，这样可以很好的提升数据库的性能，毕竟只有在用到关联对象相关属性的时候，才会执行第二步的查询操作。

sql部分，这里就分两部分了：

- 第一是在tbl_employee表中，根据id查出对应的记录。
- 第二步就是根据前一步中查出的d_id的值，在tbl_department中查询对应的记录。

<font color=red>**注意这两个sql是分散在两个mapper.xml中的，分别是各自Pojo对应的Mapper方法**</font>

```sql
    <select id="getEmployeeWithDeptById0" resultMap="employeeDept0">
        select e.id id, e.name name, e.gender gender, e.email email, e.d_id departmentId, d.department_name departmentName
        from tbl_employee e, tbl_department d
        where d.id=e.d_id and e.id=#{id}
    </select>
```

```sql
    <select id="getDeptById" resultType="com.hly.entity.Department">
        SELECT id id, department_name departmentName FROM tbl_department where id=#{id}
    </select>
```

在结果集映射中，级联标签标签中有两个重要的属性，<font color=red>select是用来指定这个对象怎么去查，而column属性则是从第一步的查询结果中找出select所需的查询参数</font>。

```xml
    <!-- 第三种：利用select标签进行分步查询 -->
    <resultMap id="employeeByStep" type="com.hly.entity.Employee">
        <id column="id" property="id"></id>
        <result column="name" property="name"></result>
        <result column="gender" property="gender"></result>
        <result column="email" property="email"></result>
        <association property="department" select="com.hly.dao.DepartmentMapper.getDeptById" column="d_id">
            <id column="id" property="id"></id>
            <result column="department_name" property="departmentName"></result>
        </association>
    </resultMap>
```

#### 级联关系和级联映射标签

1. association表示的是has one的关系，一对一或者多对一时使用，生成的某个实体类对象；
2. collection表示的是has many的关系，一对多或者多对多时使用，生成的是一个集合；

##### 一对一/多对一

使用<association>标签。

```xml
<resultMap id="empMap" type="com.mybatis.bean.Employee">
        <id column="emp_id" property="empId"></id>
        <result column="emp_name" property="empName"></result>
        <!--association映射员工表里的部门属性Department dept-->
        <association column="d_id"
        			 property="dept"
        			 javaType="com.mybatis.bean.Department" 
        			 select="com.mybatis.mapper.DepartmentMapper.getDept">
        <!--select属性指定连接查询的方法地址-->
        </association>
</resultMap>
```

在 <association> 元素中通常使用以下属性。

- property：指定映射到实体类的对象属性。
- column：指定表中对应的字段（即查询返回的列名）。
- javaType：指定映射到实体对象属性的类型。
- select：指定引入嵌套查询的子 SQL 语句，该属性用于关联映射中的嵌套查询。

##### 一对多

```xml
<!--映射关系，column表示数据库字段，property表示JavaBean字段-->
<resultMap id="deptMap" type="com.mybatis.bean.Department">
    <id column="dept_id" property="deptId"></id>
    <result column="dept_name" property="deptName"></result>
    <!--映射外部对象属性：private List<Employee> emps-->
    <collection property="emps" column="dept_id" 
                javaType="java.util.ArrayList"
                ofType="com.mybatis.bean.Employee" 
                select="com.mybatis.mapper.EmployeeMapper.getEmpsByDeptId">
                <!--通过select标签引入外部查询方法-->
    </collection>
</resultMap>
```

在 <collection> 元素中通常使用以下属性。

- property：指定映射到实体类的对象属性
- column：指定表中对应的字段（即查询返回的列名）
- select：指定引入嵌套查询的子 SQL 语句，该属性用于关联映射中的嵌套查询
- ofType：指定的是映射到list集合属性中pojo的类型 
- javaType：指定映射到实体对象属性的类型，均为LIst类型，默认可不写

##### 多对多

特别说明一下，多对多关系，MyBatis 没有实现多对多级联，推荐通过两个一对多级联替换多对多级联，以降低关系的复杂度。

> 同时在数据库设计中，一般也会对多对多关系进行改进，专门建立一个中间表对实体类的关联关系进行描述，转换成两个一对多关系，这样也满足第三范式，Mybatis中也是如此。

例如，一个用户可以在多个群组，一个群组可以有多个用户，实现“查询所有群组以及群组下每个用户信息”的功能。

- 额外建立一个关联对象中间实体类。此时，用户和中间表是

  ```java
  /** 
       * @describe: 描述User和Group之间的映射关系 
       */  
      public class UserGroupLink {  
  
          private User user;  
  
          private Group group;  
  
          private Date createTime;  
  
          public Date getCreateTime() {  
              return createTime;  
          }  
  
          public void setCreateTime(Date createTime) {  
              this.createTime = createTime;  
          }  
  
          public Group getGroup() {  
              return group;  
          }  
  
          public void setGroup(Group group) {  
              this.group = group;  
          }  
  
          public User getUser() {  
              return user;  
          }  
  
          public void setUser(User user) {  
              this.user = user;  
          }  
      }  
  ```

- ResultMap

  ```xml
   <resultMap type="Group" id="groupUserMap" extends="groupMap">  
              <collection property="users" ofType="User">  
                  <id property="id" column="userId" />  
                  <result property="name" column="userName" />  
                  <result property="password" column="password" />  
                  <result property="createTime" column="userCreateTime" />  
              </collection>  
          </resultMap>  
  ```

#### 延迟规则

MyBatis根据对关联对象查询的select语句的执行时机，分为三种类型：直接加载、侵入式延迟加载与深度延迟加载。

- 直接加载：执行完对主加载对象的 select 语句，马上执行对关联对象的 select 查询。
- 侵入式延迟： 执行对主加载对象的查询时，不会执行对关联对象的查询。但当要访问主加载对象的详情属性时，就会马上执行关联对象的select查询。
- 深度延迟： 执行对主加载对象的查询时，不会执行对关联对象的查询。访问主加载对象的详情时也不会执行关联对象的select查询。只有当真正访问关联对象的详情时，才会执行对关联对象的 select 查询。

#### 懒加载原理

> 它的原理是，使用 CGLIB 或 Javassist( 默认 ) 创建目标对象的代理对象。当调用代理对象的延迟加载属性的 getting 方法时，进入拦截器方法。比如调用 a.getB().getName() 方法，进入拦截器的 invoke(...) 方法，发现 a.getB() 需要延迟加载时，那么就会单独发送事先保存好的查询关联 B 对象的 SQL ，把 B 查询上来，然后调用 a.setB(b) 方法，于是 a 对象 b 属性就有值了，接着完成 a.getB().getName() 方法的调用。这就是延迟加载的基本原理。

##### 代理对象生成

Mybatis的查询结果是由ResultSetHandler接口的handleResultSets()方法处理的。ResultSetHandler接口只有一个实现，DefaultResultSetHandler，接下来看下延迟加载相关的一个核心的方法createResultObject()。

```java
private Object createResultObject(ResultSetWrapper rsw, ResultMap resultMap, ResultLoaderMap lazyLoader, String columnPrefix) throws SQLException {
        this.useConstructorMappings = false;
        List<Class<?>> constructorArgTypes = new ArrayList();
        List<Object> constructorArgs = new ArrayList();
        // 获取返回值结果真实对象
        Object resultObject = this.createResultObject(rsw, resultMap, constructorArgTypes, constructorArgs, columnPrefix);
        // 返回值不等于null且返回值类型指定了resultMap标签
        if (resultObject != null && !this.hasTypeHandlerForResultObject(rsw, resultMap.getType())) {
        // 对于resultMap标签里的全部子标签如：id，result，association，collection
            List<ResultMapping> propertyMappings = resultMap.getPropertyResultMappings();
            Iterator var9 = propertyMappings.iterator();

            while(var9.hasNext()) {
                ResultMapping propertyMapping = (ResultMapping)var9.next();
                //判断属性有没配置嵌套查询（association，collection中的select属性指定了StatemenId），且备注懒加载，如果有就创建代理对象
                if (propertyMapping.getNestedQueryId() != null && propertyMapping.isLazy()) {
                // 获取代理对象
                    resultObject = this.configuration.getProxyFactory().createProxy(resultObject, lazyLoader, this.configuration, this.objectFactory, constructorArgTypes, constructorArgs);
                    break;
                }
            }
        }

        this.useConstructorMappings = resultObject != null && !constructorArgTypes.isEmpty();
        return resultObject;
    }
```

- 进入configuration.getProxyFactory()

```java
// 默认为Javassist代理工厂
private proxyFactory = new JavassistProxyFactory();
public ProxyFactory getProxyFactory() {
        return this.proxyFactory;
    }
```

- 进入JavassistProxyFactory的createProxy()方法发现底层调用的是JavassistProxyFactory的静态内部类EnhancedResultObjectProxyImpl的createProxy()方法

```java
public static Object createProxy(Object target, ResultLoaderMap lazyLoader, Configuration configuration, ObjectFactory objectFactory, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
      // 结果集的对象类型
            Class<?> type = target.getClass();
            // 类似JDK动态代理InvocationHandler接口的实现类一样，要实现invoke方法
            JavassistProxyFactory.EnhancedResultObjectProxyImpl callback = new JavassistProxyFactory.EnhancedResultObjectProxyImpl(type, lazyLoader, configuration, objectFactory, constructorArgTypes, constructorArgs);
            // 调用JavassistProxyFactory的静态方法获取代理对象
            Object enhanced = JavassistProxyFactory.crateProxy(type, callback, constructorArgTypes, constructorArgs);
            PropertyCopier.copyBeanProperties(type, target, enhanced);
            return enhanced;
        }
```

- 进入JavassistProxyFactory的静态crateProxy方法

```java
static Object crateProxy(Class<?> type, MethodHandler callback, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
        org.apache.ibatis.javassist.util.proxy.ProxyFactory enhancer = new org.apache.ibatis.javassist.util.proxy.ProxyFactory();
        enhancer.setSuperclass(type);

        try {
            type.getDeclaredMethod("writeReplace");
            if (log.isDebugEnabled()) {
                log.debug("writeReplace method was found on bean " + type + ", make sure it returns this");
            }
        } catch (NoSuchMethodException var10) {
            enhancer.setInterfaces(new Class[]{WriteReplaceInterface.class});
        } catch (SecurityException var11) {
        }

        Class<?>[] typesArray = (Class[])constructorArgTypes.toArray(new Class[constructorArgTypes.size()]);
        Object[] valuesArray = constructorArgs.toArray(new Object[constructorArgs.size()]);

        Object enhanced;
        try {
        // 创建代理类
            enhanced = enhancer.create(typesArray, valuesArray);
        } catch (Exception var9) {
            throw new ExecutorException("Error creating lazy proxy.  Cause: " + var9, var9);
        }
    // 为代理类绑定处理执行器
        ((Proxy)enhanced).setHandler(callback);
        return enhanced;
    }
```

总结：当返回结果集有配置嵌套查询（association，collection中的select属性指定了StatemenId），且备注懒加载，如果有就基于Javassis产生的代理类

##### 代理对象调用懒加载属性的加载原理

- 懒加载代理对象执行方法是实际执行的是代理对象执行器EnhancedResultObjectProxyImpl的invoke方法

```java
public Object invoke(Object enhanced, Method method, Method methodProxy, Object[] args) throws Throwable {
            String methodName = method.getName();

            try {
                synchronized(this.lazyLoader) {
                    if ("writeReplace".equals(methodName)) {
                        Object original;
                        if (this.constructorArgTypes.isEmpty()) {
                            original = this.objectFactory.create(this.type);
                        } else {
                            original = this.objectFactory.create(this.type, this.constructorArgTypes, this.constructorArgs);
                        }

                        PropertyCopier.copyBeanProperties(this.type, enhanced, original);
                        if (this.lazyLoader.size() > 0) {
                            return new JavassistSerialStateHolder(original, this.lazyLoader.getProperties(), this.objectFactory, this.constructorArgTypes, this.constructorArgs);
                        }

                        return original;
                    }
        //延迟加载数量大于0
                    if (this.lazyLoader.size() > 0 && !"finalize".equals(methodName)) {
                    //aggressive 一次加载性所有需要要延迟加载属性或者包含触发延迟加载方法  
                    //对于延迟加载的两个可配置属性，一个为是否一个方法执行全部属性都加载，第二个为指定方法运行是进行全部延时加载（默认指定方法包括hashCode，toString等）
                        if (!this.aggressive && !this.lazyLoadTriggerMethods.contains(methodName)) {
                            String property;
                            // 是否为set方法
                            if (PropertyNamer.isSetter(methodName)) {
                                property = PropertyNamer.methodToProperty(methodName);
                                this.lazyLoader.remove(property);
                                // 是否为get方法
                            } else if (PropertyNamer.isGetter(methodName)) {
                                property = PropertyNamer.methodToProperty(methodName);
                                // 该属性是否设置懒加载
                                if (this.lazyLoader.hasLoader(property)) {
                                // 执行预先缓存好的sql查询，加载当前属性 ，查询后调用set方法为该属性赋值
                                    this.lazyLoader.load(property);
                                }
                            }
                        } else {
                        // 执行sql查询，加载全部属性
                            this.lazyLoader.loadAll();
                        }
                    }
                }
        // 继续执行原方法
                return methodProxy.invoke(enhanced, args);
            } catch (Throwable var10) {
                throw ExceptionUtil.unwrapThrowable(var10);
            }
        }
```

总结：懒加载代理对象执行方法是会被代理对象的拦截处理器监听执行invoke方法，在invoke方法中会判断改属性是否需要延迟加载以及是否会导致全部属性延迟加载，如果会就执行事先储存好的查询sql并调用set方法为该懒加载对象的属性赋值，并继续执行原方法。

